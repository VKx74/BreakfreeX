import {Injectable} from "@angular/core";
import {InstrumentServiceBase} from "../../interfaces/exchange/instrument.service";
import {HttpClient} from "@angular/common/http";
import {EExchange} from "../../models/common/exchange";
import {EMarketType} from "../../models/common/marketType";
import {AppConfigService} from "../app.config.service";
import {IInstrument} from "@app/models/common/instrument";
import { Observable, Subject, of } from 'rxjs';
import {map} from "rxjs/operators";
import {ApplicationTypeService} from "@app/services/application-type.service";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';

@Injectable()
export class KaikoInstrumentService extends InstrumentServiceBase {
    private _cacheBySearch: { [symbol: string]: IInstrument[]; } = {};


    get ExchangeInstance(): EExchangeInstance {
        return EExchangeInstance.KaikoExchange;
    }

    constructor(protected _http: HttpClient, private _applicationTypeService: ApplicationTypeService) {
        super(_http);
        this._supportedMarkets = [EMarketType.Crypto];
        this._endpoint = `${AppConfigService.config.apiUrls.kaikoREST}instruments/extended`;
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
                const type = EMarketType.Crypto;
                const tickSize = this._getTickSize(product.Symbol);
                const description = this._getDescription(product);
        
                const instrument: IInstrument = {
                    id: product.Symbol,
                    symbol: product.Symbol.replace("-", "").toUpperCase(),
                    exchange: product.Exchange as EExchange,
                    datafeed: EExchangeInstance.KaikoExchange,
                    type: type,
                    tickSize: tickSize,
                    pricePrecision: this._getPricePrecision(tickSize),
                    baseInstrument: product.CurrencyBase ?  product.CurrencyBase.toUpperCase() : "",
                    dependInstrument: product.CurrencyQuote ?  product.CurrencyQuote.toUpperCase() : "",
                    company: description,
                    tradable: false
                };
        
                this._cachedSymbols.push(instrument);
            }

        } catch (ex) {
            console.log('Failed to parse Kaiko API symbols');
            console.log(ex);
        }

        if (search !== undefined && this._cachedSymbols.length) {
            this._cacheBySearch[search] = this._cachedSymbols.slice();
        }
        return this._filterResponse(exchange, search);
    }

    protected _requestInstrumentsWithSearch(search: string = ""): Observable<any[]> {
        let takeAmount = 300;
        if (!search) {
            takeAmount = 100;
        }
        return this._http.get<any[]>(`${this._endpoint}?Take=${takeAmount}&Search=${search}`);
    }

    private _getTickSize(currency: string): number {
        
        const c = currency.toLowerCase();
        const currencies = [
            "usd", "usdt", "usdc", "eur", "jpy", "gbp", "aud", "cad", "chf"
        ];

        for (const i of currencies) {
            if (c.indexOf(i) !== -1) {
                return 0.01;
            }
        }

        const satoshiAble = [
            "xrp", "bsv", "ada", "xtz", "cro", "xlm", "trx", "leo", "vet", "iota", "lend", "ont", "xem",
            "hedg", "snx", "btt", 'doge', 'dgb', 'dai', 'bat', 'ewt', 'algo', 'knc', 'okb', 'zrx', 'theta', 
            'ftt', 'band', 'erd', 'hyn', 'zil', 'qtum', 'hbar', 'icx', 'pax', 'ren', 'ampl', 'omg', 'waves',
            'sxp', 'luna', 'tusd', 'lsk', 'busd', 'enj', 'ant', 'ckb', 'lrc', 'bnt', 'stx', 'bal', 'rvn', 'kava',
            'bcd', 'nano', 'hot', 'mana', 'ocean', 'fxc', 'divi', 'sc', 'rlc', 'husd', 'rune', 'btm', 'mona', 'xvg',
            'ksm', 'tmtg', 'jst', 'zb', 'dx', 'zen', 'iris', 'snt', 'bts', 'iost', 'kmd'
        ];

        for (const i of satoshiAble) {
            if (c.startsWith(i) || c.endsWith(i)) {
                return 0.00000001;
            }
        }
        
        return 0.000001;
    }
    
    private _getDescription(product: any): string {
        const base = product.CurrencyBase ?  product.CurrencyBase.toUpperCase() : "";
        const quoted = product.CurrencyQuote ?  product.CurrencyQuote.toUpperCase() : "";

        if (base && quoted) {       
            return `${base} vs ${quoted}`;
        }

        if (base) {
            return base;
        }

        if (quoted) {
            return quoted;
        }

        return "";
        
    }
}