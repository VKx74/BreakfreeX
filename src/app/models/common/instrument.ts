import {EExchange} from "./exchange";
import {EMarketType} from "./marketType";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EMarketSpecific } from "./marketSpecific";

export interface IInstrument {
    id: string;
    symbol: string;
    exchange: EExchange;
    datafeed: EExchangeInstance;
    type: EMarketType;
    specific?: EMarketSpecific;
    tickSize: number;
    baseInstrument: string;
    dependInstrument: string;
    pricePrecision: number;
    company?: string;
    tradable?: boolean;
    tickSizeCorrect?: boolean;
}

export interface IZenithInstrument extends IInstrument {
    tradingMarkets: string[];
    underlyingType: string;
}
