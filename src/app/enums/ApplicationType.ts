import {EBrokerInstance} from "../interfaces/broker/broker";
import {EExchangeInstance} from "../interfaces/exchange/exchange";

export enum ApplicationType {
    Crypto = 'Crypto',
    Stock = 'Stock',
    Forex = 'Forex',
    All = 'All'
}

export const APP_TYPE_EXCHANGES: {[index: string]: EExchangeInstance[]} = {};

APP_TYPE_EXCHANGES[ApplicationType.Crypto] = [
    EExchangeInstance.TwelvedataExchange
];

APP_TYPE_EXCHANGES[ApplicationType.Stock]  = [EExchangeInstance.TwelvedataExchange];
APP_TYPE_EXCHANGES[ApplicationType.Forex] = [EExchangeInstance.TwelvedataExchange, EExchangeInstance.OandaExchange];
APP_TYPE_EXCHANGES[ApplicationType.All]  = [EExchangeInstance.TwelvedataExchange, EExchangeInstance.OandaExchange];

export const APP_TYPE_BROKERS: {[index: string]: EBrokerInstance[]} = {};

APP_TYPE_BROKERS[ApplicationType.Crypto] = [];
APP_TYPE_BROKERS[ApplicationType.All] = [];
APP_TYPE_BROKERS[ApplicationType.Stock]  = [];
APP_TYPE_BROKERS[ApplicationType.Forex]  = [];
