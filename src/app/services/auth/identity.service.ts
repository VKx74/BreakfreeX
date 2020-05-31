import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, ReplaySubject} from "rxjs";
import {GrantTokenResponse, Roles, SignInRequestModel} from '../../models/auth/auth.models';
import {CookieService} from '../сookie.service';
import {ComponentIdentifier} from "@app/models/app-config";
import {IdentityTokenParser} from "@app/models/auth/identity-token-parser";
import {AuthenticationService} from "@app/services/auth/auth.service";
import {catchError, distinctUntilChanged, skip, tap} from "rxjs/operators";
import {LogoutSuccessAction} from "@app/store/actions";
import {Store} from "@ngrx/store";

@Injectable()
export class IdentityService {
    private readonly _refreshTokenKey = 'FgPoAz';
    private readonly _tokenKey = 'QsYnIwf';
    private readonly _isRemember = 'QsYnRem';
    private readonly _defaultExpirationCookieTime = 12 * 60; // 12hours
    private readonly _defaultMaxExpirationCookieTime = 24 * 60 * 365; // 1 year


    public id: string;
    public email: string;
    public firstName: string;
    public lastName: string;
    public role: string;
    public preferredUsername: string;
    public phoneNumber: string;
    public tags: string[];
    public subscriptions: string[];
    public isTwoFactorAuthEnable: boolean;
    public restrictedComponents: ComponentIdentifier[];
    public token: string;
    public refreshToken: string;
    public expirationTime: number;
    private _refreshToken$: ReplaySubject<any>;

    private _isAuthorized$ = new BehaviorSubject<boolean>(false);
    isAuthorizedChange$: Observable<boolean>;

    get isAuthorized(): boolean {
        return this._isAuthorized$.value;
    }

    get isExpired(): boolean {
        if (!this.token) {
            return true;
        }

        return this.expirationTime <= Date.now() / 1000;
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    get isAdmin(): boolean {
        return this.role === Roles.Admin;
    }

    constructor(private _authService: AuthenticationService,
                private _coockieService: CookieService) {
        (window as any).identity = this;
        this.isAuthorizedChange$ = this._isAuthorized$.pipe(
            skip(1),
            distinctUntilChanged()
        );
    }

    signIn(model: SignInRequestModel): Observable<any> {
        this._clearCookies();
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

    refreshTokens(): Observable<any> {
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

        return true;
    }

    public refreshTokenFromStorage(): Observable<any> {
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

    private _clearCookies() {
        this._coockieService.deleteCookie(this._refreshTokenKey);
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

    // #endregion
}
