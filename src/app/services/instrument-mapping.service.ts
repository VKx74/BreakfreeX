import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { IBrokerState } from "../interfaces/broker/broker";
import { ISymbolMappingItem, PatchAction, PatchRequest, SymbolMappingStorageService } from "./instrument-mapping-storage.service";

@Injectable()
export class InstrumentMappingService {
    private allItems: { [key: string]: {[key: string]: string}} = {};    
    private _brokerState: IBrokerState;

    constructor(private _symbolMappingStorageService: SymbolMappingStorageService) {        
    }

    public setActiveBroker(brokerState: IBrokerState): void {
        this._brokerState = brokerState;
    }

    public getAllMapping() {
        return this._symbolMappingStorageService.getAllMapping()
        .subscribe((result: ISymbolMappingItem[]) => {            
            console.log('allItems result:');
            console.log(result);
            if (result) {
                result.forEach((value: ISymbolMappingItem) => {
                    let key = this.createKeyFrom(value.brokerName, value.login);                    
                    let mapping: {[key: string]: string} = {};                    
                    let mapKeys = Object.keys(value.mapping);
                    mapKeys.forEach(element => {
                        mapping[element] = value.mapping[element];
                    });
                    this.allItems[key] = mapping;                    
                });                             
            }
            console.log('thisallItems:');
            console.log(this.allItems);   
        });
    }

    public getSymbolMapping(): Observable<{[key: string]: string}> {
        let key = this.createKey();
        let result = this.allItems[key];
        if (!result) result = {};
        return of(result);        
    }

    public addSymbolMapping(feedSymbol: string, brokerSymbol: string): Observable<any> {
        let key = this.createKey();
        let res: Observable<any>;
        if (this.allItems[key]) {
            let patchRequest = new PatchRequest(PatchAction.Add);
            patchRequest.AddMapping(feedSymbol, brokerSymbol);
            res = this._symbolMappingStorageService.patchSymbolMapping(this._brokerState.server, parseInt(this._brokerState.account, 10), patchRequest);            
        } else {
            this.allItems[key] = {};
            let payload = <ISymbolMappingItem> {
                brokerName: this._brokerState.server,
                login: parseInt(this._brokerState.account, 10),
                mapping: {}
            };            
            payload.mapping[feedSymbol] = brokerSymbol;            
            res = this._symbolMappingStorageService.postSymbolMapping(payload);            
        }
        res.subscribe((ress: any) => {
            this.allItems[key][feedSymbol] = brokerSymbol;
        }, (error: any) => {

        });
        return res;
    }

    public removeSymbolMapping(feedSymbol: string): Observable<any> {        
        let key = this.createKey();
        if (this.allItems[key]) {
            let patchRequest = new PatchRequest(PatchAction.Remove);            
            let res = this._symbolMappingStorageService.patchSymbolMapping(this._brokerState.server, parseInt(this._brokerState.account, 10), patchRequest);
            res.subscribe((ress: any) => {
                delete this.allItems[key][feedSymbol];
            });
            return res;
        } else {
            throwError('Not found');
        }        
    }

    private getBrokerMapping() {        
        let key = this.createKey();
        return this.allItems[key];
    }

    tryMapInstrumentToBrokerFormat(symbol: string): string {          
        let mapping = this.getBrokerMapping();       
        for (const i in mapping) {
            const s1 = this._normalizeInstrument(i);
            const s2 = this._normalizeInstrument(symbol);
            if (s1 === s2) {
                return mapping[i];
            }
        }
    }

    tryMapInstrumentToDatafeedFormat(symbol: string): string {        
        let mapping = this.getBrokerMapping();
        for (const i in mapping) {
            const s1 = this._normalizeInstrument(mapping[i]);
            const s2 = this._normalizeInstrument(symbol);
            if (s1 === s2) {
                return i;
            }
        }
    }

    private createKeyFrom(brokerName: string, login: number): string {
        return `${brokerName}_${login}`;
    }

    private createKey(): string {
        if (!this._brokerState) {
            console.log('state is nuull');
            return '';
        }
        let brokerName = this._brokerState.server;
        let login = this._brokerState.account;
        return `${brokerName}_${login}`;
    }

    protected _normalizeInstrument(symbol: string): string {
        return symbol.replace("_", "").replace("/", "").replace("^", "").replace("-", "").toLowerCase();
    }
}
