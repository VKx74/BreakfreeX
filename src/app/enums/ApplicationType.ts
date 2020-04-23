import {EBrokerInstance} from "../interfaces/broker/broker";
import {EExchangeInstance} from "../interfaces/exchange/exchange";

export enum ApplicationType {
    Crypto = 'Crypto',
    Stock = 'Stock',
    Forex = 'Forex',
}

export const APP_TYPE_EXCHANGES: {[index: string]: EExchangeInstance[]} = {};

APP_TYPE_EXCHANGES[ApplicationType.Crypto] = [
    // EExchangeInstance.CoinbaseExchange,
    EExchangeInstance.BitmexExchange,
    // EExchangeInstance.OKExExchange,
    // EExchangeInstance.BinanceExchange
];

APP_TYPE_EXCHANGES[ApplicationType.Stock]  = [EExchangeInstance.ZenithExchange];
APP_TYPE_EXCHANGES[ApplicationType.Forex] = [EExchangeInstance.OandaExchange];

export const APP_TYPE_BROKERS: {[index: string]: EBrokerInstance[]} = {};

APP_TYPE_BROKERS[ApplicationType.Crypto] = [
    EBrokerInstance.BitmexBroker,
    // EBrokerInstance.OKExBroker,
    // EBrokerInstance.BinanceBroker
];


APP_TYPE_BROKERS[ApplicationType.Stock]  = [EBrokerInstance.ZenithBroker];
APP_TYPE_BROKERS[ApplicationType.Forex]  = [EBrokerInstance.OandaBroker];
