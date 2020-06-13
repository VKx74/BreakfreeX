import {Injectable} from "@angular/core";
import {IInstrument} from "../../models/common/instrument";
import {InstrumentServiceBase} from "../../interfaces/exchange/instrument.service";
import {HttpClient} from "@angular/common/http";
import {EExchange} from "../../models/common/exchange";
import { EMarketType } from '@app/models/common/marketType';
import { AppConfigService } from '../app.config.service';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';

@Injectable()
export class OandaInstrumentService extends InstrumentServiceBase {

    get ExchangeInstance(): EExchangeInstance {
        return EExchangeInstance.OandaExchange;
    }


    constructor(protected _http: HttpClient) {
        super(_http);
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
                const tickSize = this._getTickSize(product.PricePrecision);
                const type = this._getType(product.Type);
                let desciption = "";
                let splitedSymbol = product.Symbol.split("_");
                if (splitedSymbol.length === 2) {
                    desciption = splitedSymbol[0] + " vs " + splitedSymbol[1];
                }
                const instrument: IInstrument = {
                    id: product.Symbol,
                    symbol: product.Symbol.replace("/", "").replace("_", ""),
                    exchange: EExchange.Oanda,
                    datafeed: EExchangeInstance.OandaExchange,
                    type: type,
                    tickSize: tickSize,
                    pricePrecision: this._getPricePrecision(tickSize),
                    dependInstrument: this._getDependSymbol(product.Symbol),
                    baseInstrument: this._getBaseSymbol(product.Symbol),
                    company: desciption,
                    tradable: true
                };

                this._cachedSymbols.push(instrument);
            }

        } catch (ex) {
            console.log('Failed to parse Bitmex API symbols');
            console.log(ex);
        }

        return this._cachedSymbols;
    }

    private _getTickSize(pricePrecision: number): number {
        return 1 / (Math.pow(10, pricePrecision));
    } 
    
    private _getType(type: string): EMarketType {
        if (type === "CFD") {
            return EMarketType.CFD;
        }
        if (type === "METAL") {
            return EMarketType.Metals;
        }

        return EMarketType.Forex;
    }

    private _getBaseSymbol(symbol: string): string {
        return symbol.split("_")[0];
    }

    private _getDependSymbol(symbol: string): string {
        return symbol.split("_")[1];
    }
}
