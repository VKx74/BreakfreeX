import { IWatchlistItem } from './watchlist.service';
import { EExchange } from '@app/models/common/exchange';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EMarketType } from '@app/models/common/marketType';

export const MajorForexWatchlist: IWatchlistItem = {
    id: "defaultMajorForex",
    name: "Forex Majors",
    trackingId: "MajorForex",
    isDefault: true,
    data: [{
        "id": "AUD_USD",
        "symbol": "AUDUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "USD",
        "dependInstrument": "AUD",
        "company": "AUD vs USD",
        "tradable": true
        },
        {
        "id": "EUR_CHF",
        "symbol": "EURCHF",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "CHF",
        "dependInstrument": "EUR",
        "company": "EUR vs CHF",
        "tradable": true
        },
        {
        "id": "EUR_JPY",
        "symbol": "EURJPY",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "JPY",
        "dependInstrument": "EUR",
        "company": "EUR vs JPY",
        "tradable": true
        },
        {
        "id": "EUR_USD",
        "symbol": "EURUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "USD",
        "dependInstrument": "EUR",
        "company": "EUR vs USD",
        "tradable": true
        },
        {
        "id": "GBP_JPY",
        "symbol": "GBPJPY",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "JPY",
        "dependInstrument": "GBP",
        "company": "GBP vs JPY",
        "tradable": true
        },
        {
        "id": "GBP_USD",
        "symbol": "GBPUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "USD",
        "dependInstrument": "GBP",
        "company": "GBP vs USD",
        "tradable": true
        },
        {
        "id": "NZD_USD",
        "symbol": "NZDUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "USD",
        "dependInstrument": "NZD",
        "company": "NZD vs USD",
        "tradable": true
        },
        {
        "id": "USD_CAD",
        "symbol": "USDCAD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "CAD",
        "dependInstrument": "USD",
        "company": "USD vs CAD",
        "tradable": true
        },
        {
        "id": "USD_CHF",
        "symbol": "USDCHF",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "CHF",
        "dependInstrument": "USD",
        "company": "USD vs CHF",
        "tradable": true
        },
        {
        "id": "USD_JPY",
        "symbol": "USDJPY",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "JPY",
        "dependInstrument": "USD",
        "company": "USD vs JPY",
        "tradable": true
        }]
};