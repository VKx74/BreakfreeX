import { forkJoin, Observable, of } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { IInstrument } from "../models/common/instrument";
import { EExchange } from "../models/common/exchange";
import { JsUtil } from "../../utils/jsUtil";
import { IHealthable } from "../interfaces/healthcheck/healthable";
import { ExchangeFactory } from "../factories/exchange.factory";
import { APP_TYPE_EXCHANGES } from "../enums/ApplicationType";
import { InstrumentServiceBase } from "@app/interfaces/exchange/instrument.service";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { InstrumentMappingService } from "./instrument-mapping.service";
import { TradingHelper } from "./mt/mt.helper";

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
        private _instrumentMappingService: InstrumentMappingService) {
        this._init();
    }

    private _init() {
        setTimeout(() => {
            APP_TYPE_EXCHANGES.forEach(value => {
                this.exchangeFactory.tryCreateInstrumentServiceInstance(value).subscribe(result => {
                    if (result.serviceInstance && result.result) {
                        this.services.push(result.serviceInstance);
                    }
                }, error => {
                    console.table(error);
                });
            });
        });
    }

    instrumentToDatafeedFormat(instrument: string): Observable<IInstrument> {
        let searchingString = this._instrumentMappingService.tryMapInstrumentToDatafeedFormat(instrument);
        let isMapped = !!(searchingString);
        if (!searchingString) {
            searchingString = TradingHelper.normalizeInstrument(instrument);
        }

        let exchanges = ["oanda", "nasdaq", "nyse", "nse", "binance"];

        const observables: Observable<IInstrument[]>[] = this.services.map(s => s.getInstruments(undefined, searchingString));

        return forkJoin(observables).pipe(
            catchError(error => of(null)),
            map((responses: IInstrument[][]) => {
                if (!responses || !responses.length) {
                    return null;
                }

                let instruments = JsUtil.flattenArray<IInstrument>(responses);
                let foundInstruments: IInstrument[] = [];
                for (const i of instruments) {
                    if (!isMapped) {
                        let instrumentID = TradingHelper.normalizeInstrument(i.id);
                        let instrumentSymbol = TradingHelper.normalizeInstrument(i.symbol);
                        if (searchingString === instrumentID || searchingString === instrumentSymbol) {
                            foundInstruments.push(i);
                        }
                    } else {
                        if (searchingString === i.id || searchingString === i.symbol) {
                            foundInstruments.push(i);
                        }
                    }
                }

                if (!foundInstruments.length) {
                    return null;
                }

                let bestRes = foundInstruments.find(_ => exchanges.indexOf(_.exchange.toLowerCase()) !== -1);
                return bestRes || foundInstruments[0];
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

    getInstrumentsBySymbolOrId(symbol: string): Observable<IInstrument[]> {
        return forkJoin(this.services.map(s => s.getInstruments(undefined, symbol)))
            .pipe(
                catchError(() => of([])),
                map((responses: IInstrument[][]) => {
                    return JsUtil.flattenArray<IInstrument>(responses).filter(i => i.symbol === symbol || i.id === symbol);
                })
            );
    }

    private _getServiceByDatafeed(datafeed: EExchangeInstance): InstrumentServiceBase {
        if (datafeed === EExchangeInstance.KaikoExchange) {
            datafeed = EExchangeInstance.BinanceExchange;
        }
        
        for (let i = 0; i < this.services.length; i++) {
            if (this.services[i].ExchangeInstance === datafeed) {
                return this.services[i];
            }
        }
        return this.services[0];
    }
}

export class InstrumentHelper {
    public static KaikoToBinanceConverter(instrument: IInstrument) {
        if (instrument.datafeed === EExchangeInstance.KaikoExchange) {
            instrument.datafeed = EExchangeInstance.BinanceExchange;
            instrument.id = instrument.symbol;
        }
    }
}