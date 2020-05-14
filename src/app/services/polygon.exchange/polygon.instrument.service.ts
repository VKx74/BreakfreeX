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
import { ApplicationType } from '@app/enums/ApplicationType';

@Injectable()
export class PolygonInstrumentService extends InstrumentServiceBase {
    private _cacheBySearch: { [symbol: string]: IInstrument[]; } = {};

    constructor(protected _http: HttpClient, private _applicationTypeService: ApplicationTypeService) {
        super(_http);
        this._supportedExchanges = [EExchange.Polygon];
        this._supportedMarkets = [EMarketType.Crypto, EMarketType.Forex, EMarketType.Stocks];
        this._endpoint = `${AppConfigService.config.apiUrls.polygonREST}instruments/extended`;
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
                const type = this._getMarketType(product.Market);
                const tickSize = this._getTickSize(product.Currency, type);
                const instrument: IInstrument = {
                    id: product.Symbol,
                    symbol: product.Symbol,
                    exchange: EExchange.Polygon,
                    type: type,
                    tickSize: tickSize,
                    pricePrecision: this._getPricePrecision(tickSize),
                    baseInstrument: product.Currency,
                    dependInstrument: "",
                    company: product.Name,
                    tradable: false
                };

                this._cachedSymbols.push(instrument);
            }

        } catch (ex) {
            console.log('Failed to parse Polygon API symbols');
            console.log(ex);
        }

        if (search !== undefined && this._cachedSymbols.length) {
            this._cacheBySearch[search] = this._cachedSymbols.slice();
        }
        return this._filterResponse(exchange, search);
    }

    protected _requestInstrumentsWithSearch(search: string = ""): Observable<any[]> {
        let market = "";
        const appType = this._applicationTypeService.applicationType;
        switch (appType) {
            case ApplicationType.Crypto: market = "&Market=CRYPTO"; break;
            case ApplicationType.Forex: market = "&Market=FX"; break;
            case ApplicationType.Stock: market = "&Market=STOCKS"; break;
        }

        return this._http.get<any[]>(`${this._endpoint}?Search=${search}${market}`);
    }

    private _getMarketType(market: string): EMarketType {
        switch (market.toLowerCase()) {
            case "crypto": return EMarketType.Crypto;
            case "fx": return EMarketType.Forex;
            case "stocks": return EMarketType.Stocks;
            default: return EMarketType.unknown;
        }
    }

    private _getTickSize(currency: string, type: EMarketType): number {
        if (type === EMarketType.Forex) {
            return 0.00001;
        }
        
        const c = currency.toLowerCase();
        if (type === EMarketType.Crypto || type === EMarketType.Stocks) {
            if (c === "usd" || c === "eur" || c === "jpy" || c === "gbp" || c === "aud" || c === "cad" || c === "chf") {
                return 0.01;
            }
        }
        
        return 0.00001;
    }
}
