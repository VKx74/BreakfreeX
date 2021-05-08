import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from "rxjs";
import { AppConfigService } from "./app.config.service";
import { IdentityService } from "./auth/identity.service";

export interface ISymbolMappingItem {
    id: string;
    userID: string;
    brokerName: string;
    login: number;
    mapping: {[key: string]: string};
}

export enum PatchAction {
    Add = 0,
    Edit = 1,
    Remove = 2
  }

export class PatchRequest {
    constructor(patchAction: PatchAction) {
        this.Action = patchAction;
        this.jObject = {};
    }
    public Action: PatchAction;
    public jObject: {[key: string]: string};

    public AddMapping(feedSymbol: string, brokerSymbol: string): void {
        this.jObject[feedSymbol] = brokerSymbol;
    }    
}

@Injectable()
export class SymbolMappingStorageService {

    private get _templatesURL(): string {        
        return `${AppConfigService.config.apiUrls.userDataStoreREST}SymbolMapping`; 
    }

    constructor(private http: HttpClient, private _identity: IdentityService) { }

    public getAllMapping(): Observable<ISymbolMappingItem[]> {
        if (this._identity.isGuestMode) {
            return of([]);
        }

        return this.http.get<ISymbolMappingItem[]>(this._templatesURL + '/GetAll');        
    }

    public getSymbolMapping(brokerName: string, login: number): Observable<ISymbolMappingItem> {  
        if (this._identity.isGuestMode) {
            return of(null);
        }

        let params = new HttpParams();
        params = params.append("brokerName", brokerName);
        params = params.append("login", login.toString());
        return this.http.get<ISymbolMappingItem>(this._templatesURL, { params: params });
    }

    public patchSymbolMapping(brokerName: string, login: number, patchRequest: PatchRequest): Observable<any> {
        if (this._identity.isGuestMode) {
            return of();
        }

        let params = new HttpParams();
        params = params.append("brokerName", brokerName);
        params = params.append("login", login.toString());
        return this.http.patch(this._templatesURL, patchRequest, { params: params });
    }

    public postSymbolMapping(symbolMappingItems: ISymbolMappingItem): Observable<any> {
        if (this._identity.isGuestMode) {
            return of();
        }
        
        return this.http.post(this._templatesURL, symbolMappingItems);
    }
}