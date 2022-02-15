import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { map } from "rxjs/operators";
import { IdentityService } from './auth/identity.service';
import { AppConfigService } from './app.config.service';
import { IUserSettings } from '@app/models/settings/user-settings';

@Injectable()
export class ChartOptionsStorageService {
    private _loadingSubject: Subject<any>;

    constructor(private http: HttpClient,
        private _identity: IdentityService) {
    }

    private get _url(): string {
        return `${AppConfigService.config.apiUrls.userDataStoreREST}ChartOptions`;
    }

    getOptions(): Observable<any> {
        if (this._identity.isGuestMode) {
            return of(null);
        }

        if (this._loadingSubject) {
            return this._loadingSubject;
        }

        this._loadingSubject = new Subject<IUserSettings>();

        this.http.get<IUserSettings>(this._url).pipe(
            map((data: any) => {
                return JSON.parse(data);
            })).subscribe((data: any) => {
                this._loadingSubject.next(data);
                this._loadingSubject.complete();
                this._loadingSubject = null;
            }, error => {
                console.log('Failed to load  featured instruments');
                this._loadingSubject.next(null);
                this._loadingSubject.complete();
                this._loadingSubject = null;
            });

        return this._loadingSubject;
    }

    saveSettings(state: any): Observable<any> {
        if (this._identity.isGuestMode) {
            return of();
        }
        return this.http.put(this._url, state);
    }

    removeSettings() {
        if (this._identity.isGuestMode) {
            return of();
        }

        return this.http.delete(this._url);
    }

}
