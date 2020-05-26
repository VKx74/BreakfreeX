import {Injectable} from "@angular/core";
import {IInstrument} from "../../models/common/instrument";
import {InstrumentServiceBase} from "../../interfaces/exchange/instrument.service";
import {HttpClient} from "@angular/common/http";
import {EExchange} from "../../models/common/exchange";
import { EMarketType } from '@app/models/common/marketType';
import { AppConfigService } from '../app.config.service';

@Injectable()
export class OandaInstrumentService extends InstrumentServiceBase {

    constructor(protected _http: HttpClient) {
        super(_http);
        this._supportedExchanges = [EExchange.Oanda];
        this._supportedMarkets = [EMarketType.Forex];
        this._endpoint = `${AppConfigService.config.apiUrls.oandabrokerREST}instruments`;
    }

    protected mapResponse(response, exchange?: EExchange, search?: string): IInstrument[] {
        this._cachedSymbols = [];

        if (!response.Data || !response.Data.length) {
            return this._cachedSymbols;
        }

        try {
            const products = response.Data;
            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                const tickSize = this._getTickSize(product.Symbol);
                const instrument: IInstrument = {
                    id: product.Symbol,
                    symbol: product.Symbol.replace("/", "").replace("_", ""),
                    exchange: EExchange.Oanda,
                    type: EMarketType.Forex,
                    tickSize: tickSize,
                    pricePrecision: this._getPricePrecision(tickSize),
                    baseInstrument: this._getBaseInstrument(product.Symbol),
                    dependInstrument: this._getDependInstrument(product.Symbol),
                    company: "",
                    tradable: true
                };

                this._cachedSymbols.push(instrument);
            }

        } catch (ex) {
            console.log('Failed to parse Bitmex API symbols');
            console.log(ex);
        }

        return this._filterResponse(exchange, search);
    }

    private _getTickSize(symbol: string): number {
        return 0.00001;
    }

    private _getDependInstrument(symbol: string): string {
        return symbol.split("_")[0];
    }

    private _getBaseInstrument(symbol: string): string {
        return symbol.split("_")[1];
    }
}
