import { IWatchlistItem } from './watchlist.service';
import { EExchange } from '@app/models/common/exchange';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EMarketType } from '@app/models/common/marketType';

export const BondsWatchlist: IWatchlistItem = {
    id: "defaultBonds",
    name: "Bonds",
    trackingId: "Bonds",
    isDefault: true,
    data: [{
        "id": "DE10YB_EUR",
        "symbol": "DE10YBEUR",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "EUR",
        "dependInstrument": "DE10YB",
        "company": "DE10YB vs EUR",
        "tradable": true
        },
        {
        "id": "UK10YB_GBP",
        "symbol": "UK10YBGBP",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "GBP",
        "dependInstrument": "UK10YB",
        "company": "UK10YB vs GBP",
        "tradable": true
        },
        {
        "id": "UK100_GBP",
        "symbol": "UK100GBP",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "GBP",
        "dependInstrument": "UK100",
        "company": "UK100 vs GBP",
        "tradable": true
        },
        {
        "id": "USB02Y_USD",
        "symbol": "USB02YUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "USD",
        "dependInstrument": "USB02Y",
        "company": "USB02Y vs USD",
        "tradable": true
        },
        {
        "id": "USB05Y_USD",
        "symbol": "USB05YUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "USD",
        "dependInstrument": "USB05Y",
        "company": "USB05Y vs USD",
        "tradable": true
        },
        {
        "id": "USB30Y_USD",
        "symbol": "USB30YUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Forex,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "USD",
        "dependInstrument": "USB30Y",
        "company": "USB30Y vs USD",
        "tradable": true
        }]
};