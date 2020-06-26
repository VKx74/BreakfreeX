import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, Observer} from 'rxjs';
import {catchError, map, tap} from "rxjs/operators";
import {IdentityService} from './auth/identity.service';
import {AppConfigService} from './app.config.service';
import { IUserSettings, IFeaturedInstruments } from '@app/models/settings/user-settings';

@Injectable()
export class SettingsStorageService {

    private _settings: IUserSettings;

    constructor(private http: HttpClient,
                private _identity: IdentityService) {
    }

    private get _url(): string {
        return `${AppConfigService.config.apiUrls.userDataStoreREST}UserSettings`;
    }

    getSettings(): Observable<IUserSettings> {
        if (this._settings) {
            return of(this._settings);
        }
        
        return this.http.get<IUserSettings>(this._url).pipe(
            map((data: any) => {
                this._settings = JSON.parse(data);
                return this._settings;
            }));
    }

    public updateFeaturedInstruments(instruments: IFeaturedInstruments[]): Observable<void>  {
        return new Observable((observer: Observer<void>) => {
            this.getSettings().subscribe((data: IUserSettings) => {
                let existingData = data;
                if (!existingData) {
                    existingData = {};
                }
                
                if (instruments && instruments.length) {
                    existingData.FeaturedInstruments = instruments.slice();
                    this.saveSettings(existingData).subscribe();
                }

                observer.next();
                observer.complete();
            });
        });
    }

    saveSettings(state: IUserSettings): Observable<any> {
        this._settings = state;
        return this.http.put(this._url, state);
    }

    removeSettings() {
        this._settings = null;
        return this.http.delete(this._url);
    }

}
