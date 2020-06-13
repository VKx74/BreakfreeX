import { IWatchlistItem } from './watchlist.service';
import { EExchange } from '@app/models/common/exchange';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EMarketType } from '@app/models/common/marketType';

export const IndicesWatchlist: IWatchlistItem = {
    id: "defaultIndices",
    name: "Indices",
    trackingId: "Indices",
    isDefault: true,
    data: [{
        "id": "AU200_AUD",
        "symbol": "AU200AUD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "AUD",
        "dependInstrument": "AU200",
        "company": "AU200 vs AUD",
        "tradable": true
        },
        {
        "id": "CN50_USD",
        "symbol": "CN50USD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "CN50",
        "company": "CN50 vs USD",
        "tradable": true
        },
        {
        "id": "EU50_EUR",
        "symbol": "EU50EUR",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "EUR",
        "dependInstrument": "EU50",
        "company": "EU50 vs EUR",
        "tradable": true
        },
        {
        "id": "FR40_EUR",
        "symbol": "FR40EUR",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "EUR",
        "dependInstrument": "FR40",
        "company": "FR40 vs EUR",
        "tradable": true
        },
        {
        "id": "DE30_EUR",
        "symbol": "DE30EUR",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "EUR",
        "dependInstrument": "DE30",
        "company": "DE30 vs EUR",
        "tradable": true
        },
        {
        "id": "HK33_HKD",
        "symbol": "HK33HKD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "HKD",
        "dependInstrument": "HK33",
        "company": "HK33 vs HKD",
        "tradable": true
        },
        {
        "id": "IN50_USD",
        "symbol": "IN50USD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "IN50",
        "company": "IN50 vs USD",
        "tradable": true
        },
        {
        "id": "JP225_USD",
        "symbol": "JP225USD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "JP225",
        "company": "JP225 vs USD",
        "tradable": true
        },
        {
        "id": "NL25_EUR",
        "symbol": "NL25EUR",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "EUR",
        "dependInstrument": "NL25",
        "company": "NL25 vs EUR",
        "tradable": true
        },
        {
        "id": "SG30_SGD",
        "symbol": "SG30SGD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "SGD",
        "dependInstrument": "SG30",
        "company": "SG30 vs SGD",
        "tradable": true
        },
        {
        "id": "TWIX_USD",
        "symbol": "TWIXUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "TWIX",
        "company": "TWIX vs USD",
        "tradable": true
        },
        {
        "id": "UK100_GBP",
        "symbol": "UK100GBP",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "GBP",
        "dependInstrument": "UK100",
        "company": "UK100 vs GBP",
        "tradable": true
        },
        {
        "id": "NAS100_USD",
        "symbol": "NAS100USD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "NAS100",
        "company": "NAS100 vs USD",
        "tradable": true
        },
        {
        "id": "US2000_USD",
        "symbol": "US2000USD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "US2000",
        "company": "US2000 vs USD",
        "tradable": true
        },
        {
        "id": "SPX500_USD",
        "symbol": "SPX500USD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "SPX500",
        "company": "SPX500 vs USD",
        "tradable": true
        },
        {
        "id": "US30_USD",
        "symbol": "US30USD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "US30",
        "company": "US30 vs USD",
        "tradable": true
        }]
};