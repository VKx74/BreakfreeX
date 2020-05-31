import { IWatchlistItem } from './watchlist.service';
import { EExchange } from '@app/models/common/exchange';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EMarketType } from '@app/models/common/marketType';

export const MajorForexWatchlist: IWatchlistItem = {
    id: "defaultMajorForex",
    name: "Major Forex Pairs",
    trackingId: "MajorForex",
    isDefault: true,
    data: [{
        "id": "EUR/USD",
        "symbol": "EURUSD",
        "exchange": EExchange.Forex,
        "datafeed": EExchangeInstance.TwelvedataExchange,
        "type": EMarketType.Forex,
        "tickSize": 1E-05,
        "pricePrecision": 5,
        "baseInstrument": "Euro",
        "dependInstrument": "US Dollar",
        "company": "Euro vs US Dollar",
        "tradable": false
    },
    {
        "id": "USD/JPY",
        "symbol": "USDJPY",
        "exchange": EExchange.Forex,
        "datafeed": EExchangeInstance.TwelvedataExchange,
        "type": EMarketType.Forex,
        "tickSize": 1E-05,
        "pricePrecision": 5,
        "baseInstrument": "US Dollar",
        "dependInstrument": "Japanese Yen",
        "company": "US Dollar vs Japanese Yen",
        "tradable": false
    },
    {
        "id": "GBP/USD",
        "symbol": "GBPUSD",
        "exchange": EExchange.Forex,
        "datafeed": EExchangeInstance.TwelvedataExchange,
        "type": EMarketType.Forex,
        "tickSize": 1E-05,
        "pricePrecision": 5,
        "baseInstrument": "British Pound",
        "dependInstrument": "US Dollar",
        "company": "British Pound vs US Dollar",
        "tradable": false
    },
    {
        "id": "USD/CHF",
        "symbol": "USDCHF",
        "exchange": EExchange.Forex,
        "datafeed": EExchangeInstance.TwelvedataExchange,
        "type": EMarketType.Forex,
        "tickSize": 1E-05,
        "pricePrecision": 5,
        "baseInstrument": "US Dollar",
        "dependInstrument": "Swiss Franc",
        "company": "US Dollar vs Swiss Franc",
        "tradable": false
    },
    {
        "id": "AUD/USD",
        "symbol": "AUDUSD",
        "exchange": EExchange.Forex,
        "datafeed": EExchangeInstance.TwelvedataExchange,
        "type": EMarketType.Forex,
        "tickSize": 1E-05,
        "pricePrecision": 5,
        "baseInstrument": "Australian Dollar",
        "dependInstrument": "US Dollar",
        "company": "Australian Dollar vs US Dollar",
        "tradable": false
    },
    {
        "id": "USD/CAD",
        "symbol": "USDCAD",
        "exchange": EExchange.Forex,
        "datafeed": EExchangeInstance.TwelvedataExchange,
        "type": EMarketType.Forex,
        "tickSize": 1E-05,
        "pricePrecision": 5,
        "baseInstrument": "US Dollar",
        "dependInstrument": "Canadian Dollar",
        "company": "US Dollar vs Canadian Dollar",
        "tradable": false
    },
    {
        "id": "NZD/USD",
        "symbol": "NZDUSD",
        "exchange": EExchange.Forex,
        "datafeed": EExchangeInstance.TwelvedataExchange,
        "type": EMarketType.Forex,
        "tickSize": 1E-05,
        "pricePrecision": 5,
        "baseInstrument": "New Zealand Dollar",
        "dependInstrument": "US Dollar",
        "company": "New Zealand Dollar vs US Dollar",
        "tradable": false
    },
    {
        "id": "GBP/EUR",
        "symbol": "GBPEUR",
        "exchange": EExchange.Forex,
        "datafeed": EExchangeInstance.TwelvedataExchange,
        "type": EMarketType.Forex,
        "tickSize": 1E-05,
        "pricePrecision": 5,
        "baseInstrument": "British Pound",
        "dependInstrument": "Euro",
        "company": "British Pound vs Euro",
        "tradable": false
    },
    {
        "id": "EUR/CHF",
        "symbol": "EURCHF",
        "exchange": EExchange.Forex,
        "datafeed": EExchangeInstance.TwelvedataExchange,
        "type": EMarketType.Forex,
        "tickSize": 1E-05,
        "pricePrecision": 5,
        "baseInstrument": "Euro",
        "dependInstrument": "Swiss Franc",
        "company": "Euro vs Swiss Franc",
        "tradable": false
    },
    {
        "id": "EUR/JPY",
        "symbol": "EURJPY",
        "exchange": EExchange.Forex,
        "datafeed": EExchangeInstance.TwelvedataExchange,
        "type": EMarketType.Forex,
        "tickSize": 1E-05,
        "pricePrecision": 5,
        "baseInstrument": "Euro",
        "dependInstrument": "Japanese Yen",
        "company": "Euro vs Japanese Yen",
        "tradable": false
    }]
};