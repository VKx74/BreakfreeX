import {EExchange} from "./exchange";
import {EMarketType} from "./marketType";

export interface IInstrument {
    id: string;
    symbol: string;
    exchange: EExchange;
    type: EMarketType;
    tickSize: number;
    baseInstrument: string;
    dependInstrument: string;
    pricePrecision: number;
    company?: string;
    tradable?: boolean;
}

export interface IZenithInstrument extends IInstrument {
    tradingMarkets: string[];
    underlyingType: string;
}
