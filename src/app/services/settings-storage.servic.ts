import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, Observer, Subject} from 'rxjs';
import {catchError, map, tap} from "rxjs/operators";
import {IdentityService} from './auth/identity.service';
import {AppConfigService} from './app.config.service';
import { IUserSettings, IFeaturedInstruments } from '@app/models/settings/user-settings';

@Injectable()
export class SettingsStorageService {

    private _settings: IUserSettings;
    private _loadingSubject: Subject<IUserSettings>;

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

        if (this._loadingSubject) {
            return this._loadingSubject;
        }
        
        this._loadingSubject = new Subject<IUserSettings>();

        this.http.get<IUserSettings>(this._url).pipe(
            map((data: any) => {
                this._settings = JSON.parse(data);
                if (!this._settings) {
                    this._settings = {
                        FeaturedInstruments: []
                    };
                }
                return this._settings;
            })).subscribe((data: IUserSettings) => {
                this._loadingSubject.next( this._settings);
                this._loadingSubject.complete();
                this._loadingSubject = null;
            }, error => {
                console.log('Failed to load  featured instruments');
                this._settings = {
                    FeaturedInstruments: []
                };
                this._loadingSubject.next( this._settings);
                this._loadingSubject.complete();
                this._loadingSubject = null;
            });

        return this._loadingSubject;
    }

    public updateFeaturedInstruments(instruments: IFeaturedInstruments[]): Observable<void>  {
        return new Observable((observer: Observer<void>) => {
            this.getSettings().subscribe((data: IUserSettings) => {
                let existingData = data;
                if (!existingData) {
                    existingData = {};
                }
                
                if (instruments && instruments.length) {
                    existingData.FeaturedInstruments = instruments;
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
