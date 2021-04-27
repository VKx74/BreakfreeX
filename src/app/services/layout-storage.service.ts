import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from "rxjs/operators";
import {IdentityService} from './auth/identity.service';
import {AppConfigService} from './app.config.service';
import {IGoldenLayoutComponentState} from "angular-golden-layout";

@Injectable()
export class LayoutStorageService {
    private _layoutExistsRemotely: boolean = false;

    constructor(private http: HttpClient,
                private _identity: IdentityService) {
    }

    private get _dashboardURL(): string {
        return `${AppConfigService.config.apiUrls.userDataStoreREST}Dashboard`;
    }

    private get _isGuest(): boolean {
        return this._identity.isGuestMode;
    }

    private _saveLayoutStateSync(state: IGoldenLayoutComponentState) {
        let payload = JSON.stringify(state);
        let method = this._layoutExistsRemotely ? "PUT" : "POST";
        this._sendHttpRequestSync(method, payload);
    }

    private _sendHttpRequestSync(method: string, body: string) {
        if (this._isGuest) {
            return;
        }

        let httpRequest = new XMLHttpRequest();
        httpRequest.onerror = (e) => {
            console.log(e);
        };
        httpRequest.open(method, this._dashboardURL, false);
        httpRequest.setRequestHeader('Authorization', 'Bearer ' + this._identity.token);
        httpRequest.setRequestHeader('Content-Type', 'application/json');
        if (body !== null)
            httpRequest.send(body);
        else
            httpRequest.send();
    }

    private _saveLayoutStateAsync(state: IGoldenLayoutComponentState): Observable<any> {
        if (this._isGuest) {
            return;
        }

        if (this._layoutExistsRemotely) {
            return this.http.put(this._dashboardURL, state);
        } else {
            return this.http.post(this._dashboardURL, state)
                .pipe(
                    tap(() => this._layoutExistsRemotely = true),
                    catchError(e => {
                        if (e.status === 409) {
                            return this.http.put(this._dashboardURL, state);
                        }

                        this._layoutExistsRemotely = false;
                        throw Error(e);
                    })
                );
        }
    }

    getLayoutState(): Observable<IGoldenLayoutComponentState> {
        if (this._isGuest) {
            return throwError("");
        }

        return this.http.get<IGoldenLayoutComponentState>(this._dashboardURL).pipe(
            tap((data) => {
                    if (data) {
                        this._layoutExistsRemotely = true;
                    } else {
                        this._layoutExistsRemotely = false;
                    }
                },
                (error) => {
                    this._layoutExistsRemotely = false;
                }),
            map((data: any) => {
                return JSON.parse(data);
            }));
    }

    saveLayoutState(state: IGoldenLayoutComponentState, async: boolean = true): Observable<any> {
        if (this._isGuest) {
            return;
        }
        
        if (async) {
            return this._saveLayoutStateAsync(state);
        } else {
            this._saveLayoutStateSync(state);
        }
    }

    removeLayoutState(): Observable<any> {
        if (this._isGuest) {
            return;
        }

        return this.http.delete(this._dashboardURL, {});
    }

    removeUserLayoutState(userId: string): Observable<any> {
        if (this._isGuest) {
            return;
        }

        return this.http.delete(`${AppConfigService.config.apiUrls.userDataStoreREST}Dashboard/${userId}`);
    }

}
