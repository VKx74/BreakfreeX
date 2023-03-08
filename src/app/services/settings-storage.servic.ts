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

        if (this._identity.isGuestMode) {
            this._settings = {
                FeaturedInstruments: []
            };
            return of(this._settings);
        }

        if (this._loadingSubject) {
            return this._loadingSubject;
        }
        
        this._loadingSubject = new Subject<IUserSettings>();

        this.http.get<IUserSettings>(this._url).pipe(
            map((data: any) => {
                this._settings = {};
                try {
                    let settings = JSON.parse(data);
                    if (settings.FeaturedInstruments) {
                        this._settings.FeaturedInstruments = settings.FeaturedInstruments;
                    } else {
                        this._settings.FeaturedInstruments = [];
                    }

                    if (settings.UseTradeGuard) {
                        this._settings.UseTradeGuard = settings.UseTradeGuard;
                    } else {
                        this._settings.UseTradeGuard = false;
                    }

                    if (settings.ActiveTradingFeedback) {
                        this._settings.ActiveTradingFeedback = settings.ActiveTradingFeedback;
                    } else {
                        this._settings.ActiveTradingFeedback = false;
                    }
                } catch (ex) {}

                if (!this._settings.FeaturedInstruments) {
                    this._settings.FeaturedInstruments = [];
                }
                if (!this._settings.UseTradeGuard) {
                    this._settings.UseTradeGuard = false;
                }
                if (!this._settings.ActiveTradingFeedback) {
                    this._settings.ActiveTradingFeedback = false;
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
                if (instruments && instruments.length >= 0) {
                    this._settings.FeaturedInstruments = instruments;
                    this.saveSettings(this._settings).subscribe();
                }

                observer.next();
                observer.complete();
            });
        });
    }

    public updateUseTradeGuard(useTradeGuard: boolean): Observable<void>  {
        return new Observable((observer: Observer<void>) => {
            this.getSettings().subscribe((data: IUserSettings) => {
                this._settings.UseTradeGuard = useTradeGuard;
                this.saveSettings(this._settings).subscribe();

                observer.next();
                observer.complete();
            });
        });
    }

    public updateActiveTradingFeedback(activeTradingFeedback: boolean): Observable<void>  {
        return new Observable((observer: Observer<void>) => {
            this.getSettings().subscribe((data: IUserSettings) => {
                this._settings.ActiveTradingFeedback = activeTradingFeedback;
                this.saveSettings(this._settings).subscribe();

                observer.next();
                observer.complete();
            });
        });
    }

    saveSettings(state: IUserSettings): Observable<any> {
        if (this._identity.isGuestMode) {
            return of();
        }

        this._settings = state;
        return this.http.put(this._url, state);
    }

    removeSettings() {
        if (this._identity.isGuestMode) {
            return of();
        }

        this._settings = null;
        return this.http.delete(this._url);
    }

}
