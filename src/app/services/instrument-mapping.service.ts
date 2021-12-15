import { Injectable } from "@angular/core";
import { Observable, of, Subject, throwError } from "rxjs";
import { map } from "rxjs/operators";
import { IBrokerState } from "../interfaces/broker/broker";
import { IBFTTradingAccount } from "./broker.service";
import { ISymbolMappingItem, PatchAction, PatchRequest, SymbolMappingStorageService } from "./instrument-mapping-storage.service";

@Injectable()
export class InstrumentMappingService {
    private allItems: { [key: string]: { [key: string]: string } } = {};
    private _brokerState: IBrokerState;
    private _defaultAccounts: IBFTTradingAccount[];

    public mappingChanged: Subject<void> = new Subject();
    public mappingLoaded: Subject<void> = new Subject();
    public isMappingLoaded: boolean;

    constructor(private _symbolMappingStorageService: SymbolMappingStorageService) {
    }

    public setActiveBroker(brokerState: IBrokerState): void {
        this._brokerState = brokerState;
    }

    public getAllMapping() {
        const demo = this._getDemoAccountIDs();
        const stage1 = this._getStage1AccountIDs();
        const live = this._getLiveAccountIDs();

        return this._symbolMappingStorageService.getAllMapping(demo, stage1, live)
            .subscribe((result: ISymbolMappingItem[]) => {
                if (result) {
                    result.forEach((value: ISymbolMappingItem) => {
                        let key = this.createKeyFrom(value.brokerName, value.login);
                        let mapping: { [key: string]: string } = {};
                        let mapKeys = Object.keys(value.mapping);
                        mapKeys.forEach(element => {
                            mapping[element] = value.mapping[element];
                        });
                        this.allItems[key] = mapping;
                    });
                }

                this.mappingLoaded.next();
                this.isMappingLoaded = true;
            });
    }

    public getSymbolMapping(): Observable<{ [key: string]: string }> {
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
            res = this._symbolMappingStorageService.patchSymbolMapping(this._brokerState.server, parseInt(this._brokerState.account, 10), patchRequest).pipe(map((ress: any) => {
                this.allItems[key][feedSymbol] = brokerSymbol;
                this.mappingChanged.next();
                return ress;
            }));
        } else {
            this.allItems[key] = {};
            let payload = <ISymbolMappingItem>{
                brokerName: this._brokerState.server,
                login: parseInt(this._brokerState.account, 10),
                mapping: {}
            };
            payload.mapping[feedSymbol] = brokerSymbol;
            res = this._symbolMappingStorageService.postSymbolMapping(payload).pipe(map((ress: any) => {
                this.allItems[key][feedSymbol] = brokerSymbol;
                this.mappingChanged.next();
                return ress;
            }));
        }
        return res;
    }

    public removeSymbolMapping(feedSymbol: string): Observable<any> {
        let key = this.createKey();
        if (this.allItems[key]) {
            let patchRequest = new PatchRequest(PatchAction.Remove);
            patchRequest.AddMapping(feedSymbol, '');
            let res = this._symbolMappingStorageService.patchSymbolMapping(this._brokerState.server, parseInt(this._brokerState.account, 10), patchRequest).pipe(map((ress: any) => {
                delete this.allItems[key][feedSymbol];
                this.mappingChanged.next();
                return ress;
            }));
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

    setDefaultAccounts(defaultAccounts: IBFTTradingAccount[]) {
        this._defaultAccounts = defaultAccounts;
        this.getAllMapping();
    }

    private createKeyFrom(brokerName: string, login: number): string {
        return `${brokerName}_${login}`;
    }

    private createKey(): string {
        if (!this._brokerState) {
            return '';
        }
        let brokerName = this._brokerState.server;
        let login = this._brokerState.account;
        return `${brokerName}_${login}`;
    }

    protected _normalizeInstrument(symbol: string): string {
        return symbol.replace("_", "").replace("/", "").replace("^", "").replace("-", "").toLowerCase();
    }

    protected _getDemoAccountIDs(): string[] {
        let res: string[] = [];

        for (const i of this._defaultAccounts) {
            if (!i.isLive && !i.isFunded) {
                res.push(i.id);
            }
        }

        return res;
    }

    protected _getStage1AccountIDs(): string[] {
        let res: string[] = [];

        for (const i of this._defaultAccounts) {
            if (!i.isLive && i.isFunded) {
                res.push(i.id);
            }
        }

        return res;
    }

    protected _getLiveAccountIDs(): string[] {
        let res: string[] = [];

        for (const i of this._defaultAccounts) {
            if (i.isLive) {
                res.push(i.id);
            }
        }

        return res;
    }
}
