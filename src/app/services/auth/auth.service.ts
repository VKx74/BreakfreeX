import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {
    SignInRequestModel,
    ChangePasswordModel,
    ConfirmEnable2FactorAuthRequest,
    Disable2FactorAuthRequest,
    Enable2FactorAuthRequest,
    Enable2FactorAuthResponse,
    ForgotPasswordModel,
    ReconfirmEmailModel,
    RegisterUserModel,
    Restore2FactorAuthRequest,
    RestorePasswordModel,
    UserModel,
    SignInWithThirdPartyRequestModel
} from '../../models/auth/auth.models';
import {AppConfigService} from "../app.config.service";
import {GrantTokenResponse} from "@app/models/auth/auth.models";
import {AuthInterceptorSkipHeader} from "@app/services/auth/constants";

@Injectable()
export class AuthenticationService {
    private readonly _httpOptions = {
        withCredentials: true
    };

    constructor(private _http: HttpClient) {
    }

    public get signInWithGoogleEndpoint(): string {
        return `${AppConfigService.config.apiUrls.identityUrl}Account/signin-with-google`;
    }

    public get signInWithFBEndpoint(): string {
        return `${AppConfigService.config.apiUrls.identityUrl}Account/signin-with-facebook`;
    }

    public changePassword(model: ChangePasswordModel): Observable<any> {
        return this._http.put(`${AppConfigService.config.apiUrls.identityUrl}profile/password/Change`, model, this._httpOptions);
    }

    public restorePassword(model: RestorePasswordModel): Observable<any> {
        return this._http.put(`${AppConfigService.config.apiUrls.identityUrl}profile/password/Restore`, model, this._httpOptions);
    }

    public forgotPassword(model: ForgotPasswordModel): Observable<any> {
        return this._http.put(`${AppConfigService.config.apiUrls.identityUrl}Profile/Password/Forgot`, model, this._httpOptions);
    }

    public signIn(model: SignInRequestModel): Observable<GrantTokenResponse> {
        return this._http.post(`${AppConfigService.config.apiUrls.identityUrl}Account/signin`, model, this._httpOptions) .pipe(
                switchMap((data: any) => { 
                    const isUserCreated = data ? data.isUserCreated : false;
                    return this._getTokens(isUserCreated);
                })
            );
    }

    public signInWithThirdPartyProvider(model: SignInWithThirdPartyRequestModel): Observable<GrantTokenResponse> {
        return this._http.post(`${AppConfigService.config.apiUrls.identityUrl}Account/signin`, model, this._httpOptions)
            .pipe(
                switchMap((data: any) => {
                    const isUserCreated = data ? data.isUserCreated : false;
                    return this._getTokens(isUserCreated);
                })
            );
    }

    public signOut(): Observable<any> {
        return this._http.get(`${AppConfigService.config.apiUrls.identityUrl}Account/signout`, this._httpOptions)
            .pipe(
                catchError(error => {
                    return of(error);
                })
            );
    }

    public registerUser(user: RegisterUserModel): Observable<null> {
        return this._http.post<null>(`${AppConfigService.config.apiUrls.identityUrl}Account/signup`, user, this._httpOptions);
    }

    public refreshTokens(refreshToken: string): Observable<GrantTokenResponse> {
        const httpOptions = {
            withCredentials: true,
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                [AuthInterceptorSkipHeader]: 'true'
            })
        };

        let body = new URLSearchParams();
        body.set('grant_type', 'refresh_token');
        body.set('client_id', 'atp.client');
        body.set('refresh_token', refreshToken);

        return this._http.post<any>(`${AppConfigService.config.apiUrls.identityUrl}connect/token`, body.toString(), httpOptions)
            .pipe(
                map((resp: any) => {
                    return {
                        accessToken: resp.access_token,
                        refreshToken: resp.refresh_token,
                        expireIn: resp.expires_in
                    } as GrantTokenResponse;
                })
            );
    }

    public reconfirmEmail(user: ReconfirmEmailModel): Observable<any> {
        return this._http.post(`${AppConfigService.config.apiUrls.identityUrl}Account/reconfirm`, user, this._httpOptions);
    }

    public resetPassword(user: UserModel): Observable<any> {
        return this._http.patch(`${AppConfigService.config.apiUrls.identityUrl}User/ResetPassword/${user.id}`, null, this._httpOptions);
    }

    public is2FactorAuthEnabled(email: string): Observable<boolean> {
        const params = new HttpParams()
            .append('email', email);

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            withCredentials: true,
            params: params
        };

        return this._http.get<boolean>(`${AppConfigService.config.apiUrls.identityUrl}2fa`, httpOptions);
    }

    public enable2FactorAuth(model: Enable2FactorAuthRequest): Observable<Enable2FactorAuthResponse> {
        return this._http.post<Enable2FactorAuthResponse>(`${AppConfigService.config.apiUrls.identityUrl}2fa/enable`, model, this._httpOptions);
    }

    public confirmEnable2FactorAuth(model: ConfirmEnable2FactorAuthRequest): Observable<boolean> {
        return this._http.patch<boolean>(`${AppConfigService.config.apiUrls.identityUrl}2fa/confirm`, model, this._httpOptions);
    }

    public disable2FactorAuth(model: Disable2FactorAuthRequest): Observable<boolean> {
        return this._http.post<boolean>(`${AppConfigService.config.apiUrls.identityUrl}2fa/disable`, model, this._httpOptions);
    }


    public restore2FactorAuth(model: Restore2FactorAuthRequest): Observable<boolean> {
        return this._http.post<boolean>(`${AppConfigService.config.apiUrls.identityUrl}2fa/restore`, model, this._httpOptions);
    }

    private _getGrant(): Observable<object> {

        const httpOptions = {
            withCredentials: true,
            responseType: "text/html" as 'json'
        };

        let url = 'http%3A%2F%2Flocalhost%3A4200';
        let scopes = "offline_access%20openid";
        scopes += "%20UserDataStore";
        scopes += "%20FileStore";
        scopes += "%20Notification";
        // scopes += "%20EmailSmsNotification";
        // scopes += "%20EventConsolidatorUser";
        // scopes += "%20EventConsolidatorAdmin";
        // scopes += "%20DataConsolidatorUser";
        // scopes += "%20DataConsolidatorAdmin";
        // scopes += "%20SocialChat";
        // scopes += "%20SocialForum";
        // scopes += "%20UserApi";
        scopes += "%20Alerts";
        scopes += "%20Datafeed";
        scopes += "%20Algo";
        scopes += "%20MT_Bridge";
        scopes += "%20Binance_Bridge";
        scopes += "%20Portfolio";
        scopes += "%20Identity";

        return this._http.get(`${AppConfigService.config.apiUrls.identityUrl}connect/authorize?response_type=code%20id_token&state&client_id=atp.client&scope=${scopes}&redirect_uri=${url}&nonce=test&response_mode=form_post`, httpOptions)
            .pipe(
                catchError(error => {
                    return of(error);
                }),
                map((response: string) => {
                    if (typeof (response) === 'string') {
                        let el = document.createElement('html');
                        el.innerHTML = response;

                        let resp = {};
                        let cells = el.getElementsByTagName('input');
                        for (let i = 0; i < cells.length; i++) {
                            let cell = cells[i];
                            let status = cell.getAttribute('name');
                            resp[status] = cell.getAttribute('value');
                        }

                        return resp;
                    }
                })
            );
    }

    private _getTokenByGrant(grantData: any): Observable<GrantTokenResponse> {
        const httpOptions = {
            withCredentials: true,
            headers: new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'})
        };

        let body = new URLSearchParams();
        body.set('grant_type', 'authorization_code');
        body.set('code', grantData.code);
        body.set('id_token', grantData.id_token);
        body.set('session_state', grantData.session_state);
        body.set('scope', grantData.scope);
        body.set('client_id', 'atp.client');
        body.set('redirect_uri', 'http://localhost:4200');

        return this._http.post(`${AppConfigService.config.apiUrls.identityUrl}connect/token`, body.toString(), httpOptions)
            .pipe(
                catchError(error => {
                    return of(error);
                }),
                map((response: any) => {
                    if (!response.access_token || !response.refresh_token) {
                        return null;
                    }

                    return {
                        accessToken: response.access_token,
                        refreshToken: response.refresh_token,
                        expireIn: response.expires_in
                    };
                })
            );
    }

    private _getTokens(isUserCreated?: boolean): Observable<GrantTokenResponse> {
        return this._getGrant()
            .pipe(
                switchMap((value: any) => {
                    if (!value.code) {
                        return throwError('Failed to get token');
                    } else {
                        return this._getTokenByGrant(value)
                            .pipe(map((resp: GrantTokenResponse) => {
                                if (!resp) {
                                    throw new Error('Failed to get token');
                                }

                                resp.isUserCreated = isUserCreated;
                                return resp;
                            }));
                    }
                })
            );
    }
}
