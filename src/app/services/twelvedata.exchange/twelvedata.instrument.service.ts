import {Injectable} from "@angular/core";
import {InstrumentServiceBase} from "../../interfaces/exchange/instrument.service";
import {HttpClient} from "@angular/common/http";
import {EExchange} from "../../models/common/exchange";
import {EMarketType} from "../../models/common/marketType";
import {AppConfigService} from "../app.config.service";
import {IInstrument} from "@app/models/common/instrument";
import { Observable, Subject, of, forkJoin } from 'rxjs';
import {map} from "rxjs/operators";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EMarketSpecific } from "@app/models/common/marketSpecific";
import { ForexTypeHelper } from "../instrument.type.helper/forex.types.helper";

@Injectable()
export class TwelvedataInstrumentService extends InstrumentServiceBase {
    private _cacheBySearch: { [symbol: string]: IInstrument[]; } = {};


    get ExchangeInstance(): EExchangeInstance {
        return EExchangeInstance.TwelvedataExchange;
    }

    constructor(protected _http: HttpClient) {
        super(_http);
        this._supportedMarkets = [EMarketType.Crypto, EMarketType.Forex, EMarketType.Stocks, EMarketType.Indices];
        this._endpoint = `${AppConfigService.config.apiUrls.twelvedataREST}instruments/extended`;
    }

    getInstruments(exchange?: EExchange, search?: string): Observable<IInstrument[]> {
        if (search) {
            search = search.toLowerCase();
        }

        if (this._cacheBySearch && search !== undefined && this._cacheBySearch[search]) {
            this._cachedSymbols = this._cacheBySearch[search];
            return of(this._filterResponse(exchange, search));
        }

        if (!this.isHealthy) {
            return of([]);
        }

        const subject = new Subject<IInstrument[]>();
        const request = this._requestInstrumentsWithSearch(search).pipe(map(response => this.mapResponse(response, exchange, search)));
        request.subscribe(value => {
            subject.next(value);
            subject.complete();
        }, error => {
            console.log('Failed to load symbol from ' + this._http);
            console.log(error);
            subject.next([]);
            subject.complete();
        });

        return subject;
    }

    protected mapResponse(response, exchange?: EExchange, search?: string): IInstrument[] {
        this._cachedSymbols = [];

        if (!response || !response.Data) {
            return this._cachedSymbols;
        }

        try {
            const products = response.Data;
            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                const type = this._getMarketType(product.Kind);

                if (type === EMarketType.Crypto) {
                    for (const availableExchange of product.AvailableExchanges) {
                        this._addInstrument(product, type, availableExchange as EExchange);
                    }
                } 
                
                if (type === EMarketType.Forex) {
                    this._addInstrument(product, type, EExchange.Forex);
                }  
                
                if (type === EMarketType.Stocks) {
                    this._addInstrument(product, type, product.Exchange as EExchange);
                } 
                
                if (type === EMarketType.Indices) {
                    this._addInstrument(product, type, product.Exchange as EExchange);
                } 
            }

        } catch (ex) {
            console.log('Failed to parse Twelvedata API symbols');
            console.log(ex);
        }

        if (search !== undefined) {
            this._cacheBySearch[search] = this._cachedSymbols.slice();
        }
        return this._filterResponse(exchange, search);
    }

    protected _addInstrument(product: any, type: EMarketType, exchange: EExchange) {
        const tickSize = this._getTickSize(product.Symbol, type);
        const description = this._getDescription(product, type);

        if (exchange === EExchange.Binance) {
            return;
        }

        const instrument: IInstrument = {
            id: product.Symbol,
            symbol: product.Symbol.replace("/", ""),
            exchange: exchange || EExchange.Unknown,
            datafeed: EExchangeInstance.TwelvedataExchange,
            type: type,
            tickSize: tickSize,
            pricePrecision: this._getPricePrecision(tickSize),
            baseInstrument: product.CurrencyBase,
            dependInstrument: product.CurrencyQuote,
            company: description,
            tradable: false,
            tickSizeCorrect: type === EMarketType.Stocks || type === EMarketType.Indices
        };

        instrument.specific = this._marketSpecific(type, instrument.symbol);

        let existing = this._cachedSymbols.find(i => i.id === instrument.id && i.exchange === instrument.exchange);
        if (!existing) {
            this._cachedSymbols.push(instrument);
        }
    }
    
    protected _marketSpecific(type: EMarketType, symbol: string): EMarketSpecific {
        if (type === EMarketType.Forex) {
            return ForexTypeHelper.GetTypeSpecific(symbol);
        }

        if (type === EMarketType.Stocks) {
            return EMarketSpecific.Stocks;
        }

        if (type === EMarketType.Crypto) {
            return EMarketSpecific.Crypto;
        }

        if (type === EMarketType.Indices) {
            return EMarketSpecific.Indices;
        }

        return null;
    }

    protected _requestInstrumentsWithSearch(search: string = ""): Observable<any> {
        let market = "";
        let exchange = "";
        let takeAmount = 200;
        let requests: Observable<any>[] = [];
        if (!search) {
            search = "A";
            exchange = "&Exchange=NASDAQ";
            const request1 = this._http.get<any>(`${this._endpoint}?Take=${takeAmount}&Search=${search}${market}&Kind=crypto`);
            const request2 = this._http.get<any>(`${this._endpoint}?Take=${takeAmount}&Search=${search}${market}&Kind=forex`);
            const request3 = this._http.get<any>(`${this._endpoint}?Take=${takeAmount}&Search=${search}${market}&Kind=stock${exchange}`);
            requests.push(request1);
            requests.push(request2);
            requests.push(request3);
        } else {
            requests.push(this._http.get<any>(`${this._endpoint}?Take=500&Search=${search}${market}`));
        }

        return forkJoin(requests).pipe(map((values) => {
            let res = {
                Data: []
            };
            
            for (const v of values) {
                if (v.Data) {
                    res.Data = res.Data.concat(v.Data);
                }
            }

            return res;
        }));
    }

    private _getMarketType(market: string): EMarketType {
        switch (market.toLowerCase()) {
            case "crypto": return EMarketType.Crypto;
            case "forex": return EMarketType.Forex;
            case "stock": return EMarketType.Stocks;
            case "indices": return EMarketType.Indices;
            default: return EMarketType.unknown;
        }
    }

    private _getTickSize(currency: string, type: EMarketType): number {
        if (type === EMarketType.Forex) {  
            return 0.00001;
        }
        
        if (type === EMarketType.Stocks || type === EMarketType.Indices) {  
            return 0.01;
        }
        
        const c = currency.toLowerCase();
        if (type === EMarketType.Crypto) {
            if (c.endsWith("usd") || c.endsWith("usdt") || c.endsWith("usdc") || c.endsWith("eur") || c.endsWith("jpy") || c.endsWith("gbp") || c.endsWith("aud") || c.endsWith("cad") || c.endsWith("chf")) {
                return 0.01;
            }
        }
        
        return 0.00001;
    }
    
    private _getDescription(product: any, type: EMarketType): string {
        if (product.Name) {
            return product.Name;
        }
        
        if (type === EMarketType.Crypto) {
            return `${product.CurrencyBase} vs ${product.CurrencyQuote}`;
        }
        
        return `${product.CurrencyBase} vs ${product.CurrencyQuote}`;
    }
}
