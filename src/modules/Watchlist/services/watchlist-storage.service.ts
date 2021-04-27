import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from "rxjs/operators";
import { IWatchlistItem } from './watchlist.service';
import { AppConfigService } from '@app/services/app.config.service';
import { IInstrument } from '@app/models/common/instrument';
import { IdentityService } from '@app/services/auth/identity.service';

@Injectable()
export class WatchlistStorageService {

    private get _templatesURL(): string {
        return `${AppConfigService.config.apiUrls.userDataStoreREST}Watchlists`;        
    }

    constructor(private http: HttpClient, private _identity: IdentityService) { }

    public allWatchlists(): Observable<IWatchlistItem[]> {
        if (this._identity.isGuestMode) {
            return of([]);
        }
        
        return this.http.get<IWatchlistItem[]>(`${this._templatesURL}/all`)
            .pipe(map((data: any) => {
                return data.map((value: any) => {
                    return {
                        id: value.id,
                        name: value.name,
                        data: JSON.parse(value.data)
                    } as IWatchlistItem;
                });
            }));
    }

    public saveWatchlist(name: string, data: IInstrument[]): Observable<IWatchlistItem> {
        if (this._identity.isGuestMode) {
            return of(null);
        }

        let postData = {
            Name: name,
            Data: data,
        };

        return this.http.post<IWatchlistItem>(this._templatesURL, postData).pipe(map((response: any) => {
            return {
                id: response.id,
                name: response.name,
                data: JSON.parse(response.data)
            } as IWatchlistItem;
        }));
    }

    public editWatchlistName(id: string, name: string): Observable<any> {
        if (this._identity.isGuestMode) {
            return of(null);
        }

        let patchData = {
            Id: id,
            PropertyName: "Name",
            NewValue: name
        };

        return this.http.patch(this._templatesURL, patchData);
    }
    
    public editWatchlist(id: string, newData: IInstrument[], name: string): Observable<any> {
        if (this._identity.isGuestMode) {
            return of(null);
        }

        let patchData = {
            Id: id,
            Name: name,
            Data: newData
        };

        return this.http.patch(this._templatesURL, patchData);
    }

    public removeWatchlist(id: string): Observable<any> {
        if (this._identity.isGuestMode) {
            return of(null);
        }

        let params = new HttpParams();
        params = params.append("id", id);
        return this.http.delete(this._templatesURL, { params: params });
    }
}