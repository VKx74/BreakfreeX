import { Injectable } from '@angular/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import { map } from "rxjs/operators";
import { WatchlistStorageService } from './watchlist-storage.service';
import { IInstrument } from '@app/models/common/instrument';

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
    isFeatured?: boolean;
}

@Injectable()
export class WatchlistService {

    private _watchlists: IWatchlistItem[];
    private _subject: Subject<IWatchlistItem[]>;
    private _request: Observable<IWatchlistItem[]>;

    public onWatchlistAdded: Subject<IWatchlistItem> = new Subject<IWatchlistItem>();
    public onWatchlistRemoved: Subject<IWatchlistItem> = new Subject<IWatchlistItem>();
    public onWatchlistUpdated: Subject<IWatchlistItem> = new Subject<IWatchlistItem>();
    public onFeaturedListChanged: Subject<IFeaturedInstruments[]> = new Subject<IFeaturedInstruments[]>();

    private featuredWatchlists: IWatchlistItem[] = [];

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
                const instruments = data.FeaturedInstruments || [];
                for (let i = 0; i < instruments.length; i++) {
                    if (!instruments[i].instrument || !instruments[i].instrument.id) {
                        instruments.splice(i, 1);
                        i--;
                    }
                }
                return instruments;
            }));
    }

    public updateFeaturedWatchlist(featuredInstruments: IFeaturedInstruments[]): IWatchlistItem[] {
        this.featuredWatchlists = [];
        const getWatchlistByGroup = (groupName: string) => {
            for (const w of this.featuredWatchlists) {
                if (w.id === groupName) {
                    return w;
                }
            }
        }; 
        
        const getFeaturedGroup = (instrument: IInstrument) => {
            for (const i of featuredInstruments) {
                if (i.instrument.id === instrument.id && i.instrument.exchange === instrument.exchange) {
                    return i;
                }
            }
        };  
        
        const generateName = (instruments: IInstrument[]) => {
            let name = "";
            for (const i of instruments) {
                if (!name) {
                    name += `${i.symbol}:${i.exchange}`;
                } else {
                    name += `, ${i.symbol}:${i.exchange}`;
                }

                if (name.length > 30) {
                    break;
                }
            }
            return name;
        };

        for (let i = 0; i < featuredInstruments.length; i++) {
            const instrument = featuredInstruments[i];
            let existingWatchlist = getWatchlistByGroup(instrument.group);
            if (!existingWatchlist) {
                existingWatchlist = {
                    data: [],
                    id: instrument.group,
                    name: "",
                    isDefault: true,
                    isFeatured: true,
                    trackingId: "Featured Watchlist " + instrument.group
                };
                this.featuredWatchlists.push(existingWatchlist);
            }

            const watchlistInstrument = instrument.instrument;
            if (watchlistInstrument) {
                let exists = false;
                for (const existingInstrument of existingWatchlist.data) {
                    if (existingInstrument.id === watchlistInstrument.id && existingInstrument.exchange === watchlistInstrument.exchange) {
                        exists = true;
                    }
                }

                if (!exists) {
                    existingWatchlist.data.push(watchlistInstrument);
                }
            }
        }

        for (let i = 0; i < this.featuredWatchlists.length; i++) {
            let item = this.featuredWatchlists[i];
            for (let j = 0; j < item.data.length; j++) {
                const instrument = item.data[j];
                const group = getFeaturedGroup(instrument);
                if (!group || group.group !== item.id) {
                    item.data.splice(j, 1);
                    j--;
                }
            }

            if (item.data.length) {
                item.name = generateName(item.data);
            } else {
                this.featuredWatchlists.splice(i, 1);
                i--;
            }
        }

        return this.featuredWatchlists;
    }

    public updateFeaturedInstruments(instruments: IFeaturedInstruments[]): Observable<void>  {
        return this._settingsStorageService.updateFeaturedInstruments(instruments).pipe(map(() => {
            this.onFeaturedListChanged.next(instruments);
        }));
    }
    
    public addWatchlist(name: string, data: IInstrument[], trackingId?: string): Observable<IWatchlistItem>  { 
        if (this._watchlists && this._watchlists.length >= 20) {
            return throwError(new Error('Maximum amount of watchlists reached.'));
        }

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