import { IWatchlistItem } from './watchlist.service';
import { EExchange } from '@app/models/common/exchange';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EMarketType } from '@app/models/common/marketType';

export const CommoditiesWatchlist: IWatchlistItem = {
    id: "defaultCommodities",
    name: "Commodities",
    trackingId: "Commodities",
    isDefault: true,
    data: [{
        "id": "BCO_USD",
        "symbol": "BCOUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "BCO",
        "company": "BCO vs USD",
        "tradable": true,
        "tickSizeCorrect": true
        },
        {
        "id": "CORN_USD",
        "symbol": "CORNUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "CORN",
        "company": "CORN vs USD",
        "tradable": true,
        "tickSizeCorrect": true
        },
        {
        "id": "NATGAS_USD",
        "symbol": "NATGASUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "NATGAS",
        "company": "NATGAS vs USD",
        "tradable": true,
        "tickSizeCorrect": true
        },
        {
        "id": "SOYBN_USD",
        "symbol": "SOYBNUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "SOYBN",
        "company": "SOYBN vs USD",
        "tradable": true,
        "tickSizeCorrect": true
        },
        {
        "id": "SUGAR_USD",
        "symbol": "SUGARUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "SUGAR",
        "company": "SUGAR vs USD",
        "tradable": true,
        "tickSizeCorrect": true
        },
        {
        "id": "WHEAT_USD",
        "symbol": "WHEATUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "WHEAT",
        "company": "WHEAT vs USD",
        "tradable": true,
        "tickSizeCorrect": true
        },
        {
        "id": "WTICO_USD",
        "symbol": "WTICOUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "WTICO",
        "company": "WTICO vs USD",
        "tradable": true,
        "tickSizeCorrect": true
        },
        {
        "id": "XCU_USD",
        "symbol": "XCUUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.CFD,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "XCU",
        "company": "XCU vs USD",
        "tradable": true,
        "tickSizeCorrect": true
        }]
};