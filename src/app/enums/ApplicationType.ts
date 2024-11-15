import {EBrokerInstance} from "../interfaces/broker/broker";
import {EExchangeInstance} from "../interfaces/exchange/exchange";

// export enum ApplicationType {
//     Crypto = 'Crypto',
//     Stock = 'Stock',
//     Forex = 'Forex',
//     All = 'All'
// }

// export const APP_TYPE_EXCHANGES: {[index: string]: EExchangeInstance[]} = {};

// APP_TYPE_EXCHANGES[ApplicationType.Crypto] = [
//     EExchangeInstance.TwelvedataExchange
// ];

// APP_TYPE_EXCHANGES[ApplicationType.Stock]  = [EExchangeInstance.TwelvedataExchange];
// APP_TYPE_EXCHANGES[ApplicationType.Forex] = [EExchangeInstance.OandaExchange, EExchangeInstance.TwelvedataExchange];
export const APP_TYPE_EXCHANGES = [EExchangeInstance.OandaExchange, EExchangeInstance.BinanceExchange, EExchangeInstance.TwelvedataExchange];
export const APP_TYPE_BROKERS = [EBrokerInstance.MT4, EBrokerInstance.MT5, EBrokerInstance.Binance, EBrokerInstance.BinanceFuturesUSD, EBrokerInstance.BinanceFuturesCOIN];

// APP_TYPE_BROKERS[ApplicationType.Crypto] = [];
// APP_TYPE_BROKERS[ApplicationType.All] = [EBrokerInstance.MT5, EBrokerInstance.MT4];
// APP_TYPE_BROKERS[ApplicationType.Stock]  = [];
// APP_TYPE_BROKERS[ApplicationType.Forex]  = [EBrokerInstance.MT5, EBrokerInstance.MT4];
