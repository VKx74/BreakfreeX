import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject, throwError } from 'rxjs';
import { map } from "rxjs/operators";
import { IdentityService } from '@app/services/auth/identity.service';
import { AppConfigService } from '@app/services/app.config.service';
import { WatchlistStorageService } from './watchlist-storage.service';
import { EExchange } from '@app/models/common/exchange';
import { IInstrument } from '@app/models/common/instrument';
import { EMarketType } from '@app/models/common/marketType';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';

import {MinorForexWatchlist} from './minorForex';
import {MajorForexWatchlist} from './majorForex';
import {ExoticsForexWatchlist} from './exoticForex';
import {IndicesWatchlist} from './indicaes';
import {EquitiesWatchlist} from './equities';
import {CommoditiesWatchlist} from './commodities';
import {BondsWatchlist} from './bonds';
import {MetalsWatchlist} from './metals';
import { SettingsStorageService } from '@app/services/settings-storage.servic';
import { IFeaturedInstruments, IUserSettings } from '@app/models/settings/user-settings';

export interface IWatchlistItem {
    id: string;
    name: string;
    data: IInstrument[];
    trackingId?: string;
    isDefault?: boolean;
}

@Injectable()
export class WatchlistService {

    private _watchlists: IWatchlistItem[];
    private _subject: Subject<IWatchlistItem[]>;
    private _request: Observable<IWatchlistItem[]>;

    public onWatchlistAdded: Subject<IWatchlistItem> = new Subject<IWatchlistItem>();
    public onWatchlistRemoved: Subject<IWatchlistItem> = new Subject<IWatchlistItem>();
    public onWatchlistUpdated: Subject<IWatchlistItem> = new Subject<IWatchlistItem>();

    public lastActiveWatchlistComponentId: string;
    
    constructor(private _watchlistStorageService: WatchlistStorageService, private _settingsStorageService: SettingsStorageService) { 
    
    }

    public getDefaultWatchlist(): IWatchlistItem[] { 
        return [MajorForexWatchlist, MinorForexWatchlist, ExoticsForexWatchlist, IndicesWatchlist, CommoditiesWatchlist, MetalsWatchlist, BondsWatchlist, EquitiesWatchlist];
    }

    public getWatchlists(): Observable<IWatchlistItem[]> { 
        if (this._watchlists) {
            return of(this._watchlists);
        }

        if (!this._request) {
            this._subject = new Subject<IWatchlistItem[]>();
            this._request = this._watchlistStorageService.allWatchlists();
            this._request.subscribe(value => {
                this._watchlists = value;
                this._subject.next(value);
                this._subject.complete();
                this._request = null;
            }, error => {
                console.log('Failed to load watchlists');
                console.log(error);
                this._subject.next([]);
                this._subject.complete();
                this._request = null;
            });
        }

        return this._subject;
    } 

    public getFeaturedInstruments(): Observable<IFeaturedInstruments[]>  {
        return this._settingsStorageService.getSettings().pipe(
            map((data: IUserSettings) => {
                if (!data) {
                    return [];
                }
                return data.FeaturedInstruments || [];
            }));
    }

    public updateFeaturedInstruments(instruments: IFeaturedInstruments[]): Observable<void>  {
        return this._settingsStorageService.updateFeaturedInstruments(instruments);
    }
    
    public addWatchlist(name: string, data: IInstrument[], trackingId?: string): Observable<IWatchlistItem>  { 
        return this._watchlistStorageService.saveWatchlist(name, data).pipe(map((response: IWatchlistItem) => {
            if (response && response.id) {
                if (!this._watchlists) {
                    this._watchlists = [];
                }

                response.trackingId = trackingId;
                this._watchlists.push(response);
                this.onWatchlistAdded.next(response);
            }
            return response;
        }));
    } 
    
    public deleteWatchlist(id: string): Observable<any>  {
        const existing = this._watchlists.findIndex(watchlist => watchlist.id === id);
        if (existing < 0) {
            return throwError("Watchlist not found");
        }
        
        return this._watchlistStorageService.removeWatchlist(id).pipe(map((data: any) => {
            const watchlist = this._watchlists[existing];
            this._watchlists.splice(existing, 1);
            this.onWatchlistRemoved.next(watchlist);
            return data;
        }));
    }
    
    public editWatchlist(id: string, newData: IInstrument[], name: string): Observable<any> {
        const existing = this._watchlists.find(watchlist => watchlist.id === id);
        if (!existing) {
            return throwError("Watchlist not found");
        }
        
        return this._watchlistStorageService.editWatchlist(id, newData, name).pipe(map((data: any) => {
            existing.data = newData;
            existing.name = name;
            this.onWatchlistUpdated.next(existing);
            return data;
        }));
    }
}