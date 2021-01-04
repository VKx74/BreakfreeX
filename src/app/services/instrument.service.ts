import { forkJoin, Observable, of } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { IInstrument } from "../models/common/instrument";
import { EExchange } from "../models/common/exchange";
import { JsUtil } from "../../utils/jsUtil";
import { IHealthable } from "../interfaces/healthcheck/healthable";
import { ApplicationTypeService } from "./application-type.service";
import { ExchangeFactory } from "../factories/exchange.factory";
import { APP_TYPE_EXCHANGES } from "../enums/ApplicationType";
import { InstrumentServiceBase } from "@app/interfaces/exchange/instrument.service";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { InstrumentMappingService } from "./instrument-mapping.service";

@Injectable()
export class InstrumentService implements IHealthable {
    private services: InstrumentServiceBase[] = [];

    public get isHealthy(): boolean {
        let _isHealthy = true;

        for (let i = 0; i < this.services.length; i++) {
            if (!this.services[i].isHealthy) {
                _isHealthy = false;
                break;
            }
        }

        return _isHealthy;
    }

    constructor(private exchangeFactory: ExchangeFactory,
        private applicationTypeService: ApplicationTypeService,
        private _instrumentMappingService: InstrumentMappingService) {
        this._init();
    }

    private _init() {
        setTimeout(() => {
            let exchanges = APP_TYPE_EXCHANGES[this.applicationTypeService.applicationType];

            if (exchanges) {
                exchanges.forEach(value => {
                    this.exchangeFactory.tryCreateInstrumentServiceInstance(value).subscribe(result => {
                        if (result.serviceInstance && result.result) {
                            this.services.push(result.serviceInstance);
                        }
                    }, error => {
                        console.table(error);
                    });
                });
            }
        });
    }

    instrumentToDatafeedFormat(instrument: string): Observable<IInstrument> {
        let searchingString = this._instrumentMappingService.tryMapInstrumentToDatafeedFormat(instrument);
        let isMapped = !!(searchingString);
        if (!searchingString) {
            searchingString = this._normalizeInstrument(instrument);
        }

        const observables: Observable<IInstrument[]>[] = this.services.map(s => s.getInstruments(undefined, searchingString));

        return forkJoin(observables).pipe(
            catchError(error => of(null)),
            map((responses: IInstrument[][]) => {
                if (!responses || !responses.length) {
                    return null;
                }

                let instruments = JsUtil.flattenArray<IInstrument>(responses);
                for (const i of instruments) {
                    if (!isMapped) {
                        let instrumentID = this._normalizeInstrument(i.id);
                        let instrumentSymbol = this._normalizeInstrument(i.symbol);
                        if (searchingString === instrumentID || searchingString === instrumentSymbol) {
                            return i;
                        }
                    } else {
                        if (searchingString === i.id || searchingString === i.symbol) {
                            return i;
                        }
                    }
                }
                
                if (isMapped) {
                    return null;
                }

                for (const i of instruments) {
                    let instrumentID = this._normalizeInstrument(i.id);
                    let instrumentSymbol = this._normalizeInstrument(i.symbol);
                    if (searchingString.startsWith(instrumentID) || searchingString.startsWith(instrumentSymbol)) {
                        return i;
                    }
                }
                
                return null;
            })
        );
    } 
    
    getInstruments(datafeed?: EExchangeInstance, search?: string): Observable<IInstrument[]> {
        const observables: Observable<IInstrument[]>[] = [] = datafeed
            ? [this._getServiceByDatafeed(datafeed).getInstruments(undefined, search)]
            : this.services.map(s => s.getInstruments(undefined, search));

        return forkJoin(observables).pipe(
            catchError(error => of([])),
            map((responses: IInstrument[][]) => {
                if (!responses || !responses.length) {
                    return [];
                }

                return JsUtil.flattenArray<IInstrument>(responses);
            })
        );
    }

    getInstrumentBySymbol(symbol: string, datafeed: EExchangeInstance, exchange: EExchange): Observable<IInstrument> {
        return this._getServiceByDatafeed(datafeed).getInstruments(exchange, symbol)
            .pipe(
                map((instruments: IInstrument[]) => instruments.find(i => i.symbol === symbol))
            );
    }

    getInstrumentsBySymbol(symbol: string): Observable<IInstrument[]> {
        return forkJoin(this.services.map(s => s.getInstruments(undefined, symbol)))
            .pipe(
                catchError(() => of([])),
                map((responses: IInstrument[][]) => {
                    return JsUtil.flattenArray<IInstrument>(responses).filter(i => i.symbol === symbol);
                })
            );
    }


    protected _normalizeInstrument(symbol: string): string {
        let s = symbol;
        if (s.length > 6 && s[s.length - 2] === '-') {
            s = s.slice(0, s.length - 2);
        }
        s = s.replace("_", "").replace("/", "").replace("^", "").replace("-", "").toLowerCase();
        return s;
    }

    private _getServiceByDatafeed(datafeed: EExchangeInstance): InstrumentServiceBase {
        for (let i = 0; i < this.services.length; i++) {
            if (this.services[i].ExchangeInstance === datafeed) {
                return this.services[i];
            }
        }
        return this.services[0];
    }
}
