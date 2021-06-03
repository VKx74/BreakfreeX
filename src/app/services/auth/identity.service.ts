import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, ReplaySubject } from "rxjs";
import { GrantTokenResponse, Roles, SignInRequestModel, SignInWithThirdPartyRequestModel } from '../../models/auth/auth.models';
import { CookieService } from '../сookie.service';
import { ComponentIdentifier } from "@app/models/app-config";
import { IdentityTokenParser } from "@app/models/auth/identity-token-parser";
import { AuthenticationService } from "@app/services/auth/auth.service";
import { catchError, distinctUntilChanged, map, skip, tap } from "rxjs/operators";
import { LogoutSuccessAction } from "@app/store/actions";
import { Store } from "@ngrx/store";

@Injectable()
export class IdentityService {
    private readonly _refreshTokenKey = 'FgPoAz';
    private readonly _tokenKey = 'QsYnIwf';
    private readonly _guestTokenKey = 'GsYnIwf';
    private readonly _isRemember = 'QsYnRem';
    private readonly _defaultExpirationCookieTime = 12 * 60; // 12hours
    private readonly _defaultMaxExpirationCookieTime = 24 * 60 * 365; // 1 year

    private readonly _trialLIfeTime = 2 * 24 * 60;
    private readonly _freeTrialLIfeTime = 20;
    private _free20MinTrialExpired: boolean = false;

    private _isGuestMode: boolean = false;
    private _isTrialExpired: boolean = false;

    public id: string;
    public email: string;
    public firstName: string;
    public lastName: string;
    public role: string = "";
    public preferredUsername: string;
    public phoneNumber: string;
    public artifSubExp: number;
    public tags: string[] = [];
    public subscriptions: string[] = [];
    public isTwoFactorAuthEnable: boolean;
    public restrictedComponents: ComponentIdentifier[] = [];
    public token: string;
    public refreshToken: string;
    public expirationTime: number;
    private _refreshToken$: ReplaySubject<any>;

    private _isAuthorized$ = new BehaviorSubject<boolean>(false);
    isAuthorizedChange$: Observable<boolean>;

    get isGuestMode(): boolean {
        return this._isGuestMode;
    }

    get isAuthorized(): boolean {
        return this._isAuthorized$.value;
    }

    get isExpired(): boolean {
        if (!this.token) {
            return true;
        }

        return this.expirationTime <= Date.now() / 1000;
    }

    get isArtifSubExp(): boolean {
        if (!this.artifSubExp || !this.isTrial) {
            return false;
        }

        return this.artifSubExp <= Date.now() / 1000;
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    get isAdmin(): boolean {
        return this.role.toLowerCase() === Roles.Admin.toLowerCase();
    }  

    get isSupportOfficer(): boolean {
        return this.role.toLowerCase() === Roles.SupportOfficer.toLowerCase();
    }  
    
    get isBeta(): boolean {
        if (this.isAdmin) {
            return true;
        }

        if (this.tags && this.tags.length) {
            for (const tag of this.tags) {
                if (tag.toLowerCase() === "beta") {
                    return true;
                }
            }
        }

        return false;
    }  

    get isTrial(): boolean {
        if (this.isAdmin) {
            return false;
        }

        if (this.subscriptions && this.subscriptions.length) {
            for (const sub of this.subscriptions) {
                if (sub.indexOf("Trial") !== -1 && this.subscriptions.length === 1) {
                    return true;    
                }
            }
        }

        return false;
    }

    get isAuthorizedCustomer(): boolean {
        if (this.isAdmin) {
            return true;
        }

        if (this.isTrialNumberRequired()) {
            return false;
        }

        if (this.isTrial && this._isTrialExpired) {
            return false;
        }

        if (this.subscriptions && this.subscriptions.length) {
            return true;
        }

        return false;
    }

    get isPro(): boolean {
        if (!this.isAuthorizedCustomer) {
            return false;
        }

        if (this.isAdmin) {
            return true;
        }

        if (this.subscriptions && this.subscriptions.length) {
            for (const sub of this.subscriptions) {
                if (sub.indexOf("Pro") !== -1) {
                    return true;
                }
            }
        }

        return false;
    }

    get basicLevel(): number {
        return 4;
    }

    constructor(private _authService: AuthenticationService,
        private _coockieService: CookieService) {
        (window as any).identity = this;
        this.isAuthorizedChange$ = this._isAuthorized$.pipe(
            skip(1),
            distinctUntilChanged()
        );
    }

    signInWithThirdPartyProvider(model: SignInWithThirdPartyRequestModel): Observable<any> {
        this._clearCookies();
        return this._authService.signInWithThirdPartyProvider(model)
            .pipe(
                tap((resp: GrantTokenResponse) => {
                    this.insert(resp.accessToken, resp.refreshToken);
                    this._setCookies(resp.accessToken, resp.refreshToken, true);
                    this._isAuthorized$.next(true);
                })
            );
    }

    signIn(model: SignInRequestModel): Observable<any> {
        this._clearCookies();
        this.clearGuestMode();
        return this._authService.signIn(model)
            .pipe(
                tap((resp: GrantTokenResponse) => {
                    this.insert(resp.accessToken, resp.refreshToken);
                    this._setCookies(resp.accessToken, resp.refreshToken, model.rememberMe);
                    this._isAuthorized$.next(true);
                })
            );
    }

    signOut(): Observable<any> {
        return this._authService.signOut()
            .pipe(tap(() => {
                this._clearCookies();
                this._isAuthorized$.next(false);
            }));
    }

    signOutSilently(): Observable<any> {
        return this._authService.signOut()
            .pipe(tap(() => {
                this._clearCookies();
            }));
    }

    refreshTokens(): Observable<any> {
        if (this.isGuestMode) {
            return this._refreshGuestTokens();
        } else {
            return this._refreshTokens();
        }
    }

    public insert(token: string, refreshToken: string): boolean {
        const parsedToken = IdentityTokenParser.parseToken(token);

        console.log('Token: ', token);

        this.id = parsedToken.sub;
        this.expirationTime = parsedToken.exp;
        this.role = parsedToken.role;
        this.email = parsedToken.email;
        this.firstName = parsedToken.first_name;
        this.lastName = parsedToken.last_name;
        this.preferredUsername = parsedToken.preferred_username;
        this.phoneNumber = parsedToken.phone_number;
        this.isTwoFactorAuthEnable = parsedToken.is_two_factor_auth_enable === true;
        this.tags = parsedToken.user_tag ? parsedToken.user_tag.split(',') : [];
        this.subscriptions = parsedToken.user_subs ? parsedToken.user_subs.split(';') : [];
        this.restrictedComponents = parsedToken.hasOwnProperty('restricted') ? [].concat(parsedToken.restricted) : [];
        this.token = token;
        this.refreshToken = refreshToken;

        if (parsedToken.artifsub_exp) {
            this.artifSubExp = Number(parsedToken.artifsub_exp);
            this._isTrialExpired = this.isArtifSubExp;
            this.updateTrialExpiration();
        }

        return true;
    }

    public refreshTokenFromStorage(): Observable<any> {
        if (this.isGuestMode) {
            return this._refreshGuestTokens();
        } else {
            return this._refreshTokenFromStorage();
        }
    }

    public setGuestMode() {
        // this.signOut().subscribe(() => {
            this._clearCookies();
            this._isGuestMode = true;
        // });
    }

    public clearGuestMode() {
        this._clearCookies();
        this._isGuestMode = false;
    }

    public isTrialNumberRequired(): boolean {
        return this.isTrial && !this.phoneNumber && this._free20MinTrialExpired;
    }

    public updateTrialExpiration() {
        if (!this.isTrial || !this.artifSubExp) {
            return;
        }

        const trialingMins = this._trialLIfeTime - ((this.artifSubExp - new Date().getTime() / 1000) / 60);
        if (trialingMins > this._freeTrialLIfeTime) {
            this._free20MinTrialExpired = true;
        }
    }

    private _clearCookies() {
        this._coockieService.deleteCookie(this._refreshTokenKey);
        this._coockieService.deleteCookie(this._guestTokenKey);
        this._coockieService.deleteCookie(this._tokenKey);
    }

    private _setCookies(token: string, refreshToken: string, rememberUser?: boolean) {
        if (rememberUser === undefined) {
            rememberUser = this._coockieService.getCookie(this._isRemember) ? true : false;
        }

        let expiration = rememberUser ? this._defaultMaxExpirationCookieTime : this._defaultExpirationCookieTime;

        this._coockieService.setCookie(this._refreshTokenKey, refreshToken, expiration);
        this._coockieService.setCookie(this._tokenKey, token, expiration);
    }

    private _setGuestCookies(token: string) {
        this._coockieService.setCookie(this._guestTokenKey, token, this._defaultExpirationCookieTime);
    }

    private _refreshTokenFromStorage(): Observable<any> {
        const refreshToken = this._coockieService.getCookie(this._refreshTokenKey);
        const token = this._coockieService.getCookie(this._tokenKey);

        if (!refreshToken || !token) {
            return of(null);
        }

        return this._authService.refreshTokens(refreshToken)
            .pipe(
                tap((resp: GrantTokenResponse) => {
                    this.insert(resp.accessToken, resp.refreshToken);
                    this._setCookies(resp.accessToken, resp.refreshToken);
                    this._isAuthorized$.next(true);
                }),
                catchError((e) => {
                    console.log(e);
                    return of(null);
                })
            );
    }

    private _refreshGuestTokens(): Observable<string> {
        const token = this._coockieService.getCookie(this._guestTokenKey);

        if (token) {
            if (this._insertGuest(token)) {
                return of(token);
            }
        }

        return this._authService.getGuestToken()
            .pipe(
                tap((resp: GrantTokenResponse) => {
                    this._insertGuest(resp.accessToken);
                    this._setGuestCookies(resp.accessToken);
                }),
                map((resp: GrantTokenResponse) => {
                    return resp.accessToken;
                }),
                catchError((e) => {
                    console.log(e);
                    return of(null);
                })
            );
    }

    private _refreshTokens(): Observable<any> {
        if (this._refreshToken$) {
            return this._refreshToken$.asObservable();
        }

        this._refreshToken$ = new ReplaySubject<any>(1);
        return this._authService.refreshTokens(this.refreshToken)
            .pipe(
                tap((resp: GrantTokenResponse) => {
                    this.insert(resp.accessToken, resp.refreshToken);
                    this._setCookies(resp.accessToken, resp.refreshToken);

                    this._refreshToken$.next();
                    this._refreshToken$ = null;
                }, (error) => {
                    this._refreshToken$.error(error);
                    this._refreshToken$ = null;
                })
            );
    }

    public _insertGuest(token: string) {
        const parsedToken = IdentityTokenParser.parseToken(token);
        console.log('Token: ', token);
        this.expirationTime = parsedToken.exp;
        this.token = token;

        if (this.isExpired) {
            return false;
        }
        this.id = "";
        this.role = "guest";
        this.firstName = "Guest";
        this.lastName = "User";
        this.preferredUsername = "Guest User";
        this.email = "guest@breackfreetraging.com";
        this.phoneNumber = null;
        this.isTwoFactorAuthEnable = false;
        this.tags = [];
        this.subscriptions = [];
        this.restrictedComponents = [];
        this.refreshToken = "";

        this._isAuthorized$.next(true);
        return true;
    }

    // #endregion
}
