import { IWatchlistItem } from './watchlist.service';
import { EExchange } from '@app/models/common/exchange';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EMarketType } from '@app/models/common/marketType';

export const MetalsWatchlist: IWatchlistItem = {
    id: "defaultMetals",
    name: "Metals",
    trackingId: "Metals",
    isDefault: true,
    data: [
        {
        "id": "XAG_USD",
        "symbol": "XAGUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Metals,
        "tickSize": 0.00001,
        "pricePrecision": 5,
        "baseInstrument": "USD",
        "dependInstrument": "XAG",
        "company": "XAG vs USD",
        "tradable": true,
        "tickSizeCorrect": true
        },
        {
        "id": "XAU_USD",
        "symbol": "XAUUSD",
        "exchange": EExchange.Oanda,
        "datafeed": EExchangeInstance.OandaExchange,
        "type": EMarketType.Metals,
        "tickSize": 0.001,
        "pricePrecision": 3,
        "baseInstrument": "USD",
        "dependInstrument": "XAU",
        "company": "XAU vs USD",
        "tradable": true,
        "tickSizeCorrect": true
        }]
};