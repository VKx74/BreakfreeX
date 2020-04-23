import {Injectable} from "@angular/core";
import {InstrumentServiceBase} from "../../interfaces/exchange/instrument.service";
import {HttpClient} from "@angular/common/http";
import {EExchange} from "../../models/common/exchange";
import {EMarketType} from "../../models/common/marketType";
import {AppConfigService} from "../app.config.service";
import {IInstrument} from "@app/models/common/instrument";

@Injectable()
export class BitmexInstrumentService extends InstrumentServiceBase {

    constructor(protected _http: HttpClient) {
        super(_http);
        this._supportedExchanges = [EExchange.Bitmex];
        this._supportedMarkets = [EMarketType.Crypto];
        this._endpoint = `${AppConfigService.config.apiUrls.bitmexREST}instruments/extended`;
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
                const instrument: IInstrument = {
                    id: product.symbol,
                    symbol: product.symbol,
                    exchange: EExchange.Bitmex,
                    type: EMarketType.Crypto,
                    tickSize: this._getTickSize(product.tickSize),
                    pricePrecision: this._getPricePrecision(product.tickSize),
                    baseInstrument: product.currency,
                    dependInstrument: product.rootSymbol,
                    company: product.description,
                    tradable: (product.positionCurrency !== '' && product.positionCurrency !== undefined)
                };

                this._cachedSymbols.push(instrument);
            }

        } catch (ex) {
            console.log('Failed to parse Bitmex API symbols');
            console.log(ex);
        }

        return this._filterResponse(exchange, search);
    }

    private _getTickSize(tickSize: string): number {
        let size = Number(tickSize);
        if (Number.isNaN(size)) {
            size = 0.00001;
        }

        if (size > 0.01) {
            size = 0.01;
        }

        // if (size < 0.000001) {
        //     size = 0.000001;
        // }

        return size;
    }
}
