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

export interface IWatchlistItem {
    id: string;
    name: string;
    data: IInstrument[];
    trackingId?: string;
}

@Injectable()
export class WatchlistService {

    private _watchlists: IWatchlistItem[];
    private _subject: Subject<IWatchlistItem[]>;
    private _request: Observable<IWatchlistItem[]>;

    public onWatchlistAdded: Subject<IWatchlistItem> = new Subject<IWatchlistItem>();
    public onWatchlistRemoved: Subject<IWatchlistItem> = new Subject<IWatchlistItem>();
    public onWatchlistUpdated: Subject<IWatchlistItem> = new Subject<IWatchlistItem>();

    constructor(private _watchlistStorageService: WatchlistStorageService) { }

    public getDefaultWatchlist(): IWatchlistItem { 
        const baseinfo = {
            exchange: EExchange.Bitmex,
            baseInstrument: "",
            dependInstrument: "",
            pricePrecision: 2, 
            tickSize: 0.01,
            type: EMarketType.Crypto
        };
        return {
            id: null,
            name: "Default",
            trackingId: "Default",
            data: [{
                id: "XRPM20",
                symbol: "XRPM20",
                ...baseinfo
            }, {
                id: "BCHM20",
                symbol: "BCHM20",
                ...baseinfo
            }, {
                id: "ADAM20",
                symbol: "ADAM20",
                ...baseinfo
            }, {
                id: "EOSM20",
                symbol: "EOSM20",
                ...baseinfo
            }, {
                id: "TRXM20",
                symbol: "TRXM20",
                ...baseinfo
            }, {
                id: "XRPUSD",
                symbol: "XRPUSD",
                ...baseinfo
            }, {
                id: "XBTUSD",
                symbol: "XBTUSD",
                ...baseinfo
            }, {
                id: "XBTM20",
                symbol: "XBTM20",
                ...baseinfo
            }, {
                id: "XBTU20",
                symbol: "XBTU20",
                ...baseinfo
            }, {
                id: "ETHUSD",
                symbol: "ETHUSD",
                ...baseinfo
            }, {
                id: "ETHM20",
                symbol: "ETHM20",
                ...baseinfo
            }]
        };
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