import { IWatchlistItem } from './watchlist.service';
import { EExchange } from '@app/models/common/exchange';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EMarketType } from '@app/models/common/marketType';

export const CryptoWatchlist: IWatchlistItem = {
    id: "defaultCrypto",
    name:  EMarketType.Crypto,
    trackingId:  EMarketType.Crypto,
    isDefault: true,
    data: [ {
        "id": "ETHBTC",
        "symbol": "ETHBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-7,
        "pricePrecision": 7,
        "baseInstrument": "ETH",
        "dependInstrument": "BTC",
        "company": "ETH vs BTC",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "XRPBTC",
        "symbol": "XRPBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "XRP",
        "dependInstrument": "BTC",
        "company": "XRP vs BTC",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "XLMBTC",
        "symbol": "XLMBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "XLM",
        "dependInstrument": "BTC",
        "company": "XLM vs BTC",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "LTCBTC",
        "symbol": "LTCBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-7,
        "pricePrecision": 7,
        "baseInstrument": "LTC",
        "dependInstrument": "BTC",
        "company": "LTC vs BTC",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "LINKBTC",
        "symbol": "LINKBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-7,
        "pricePrecision": 7,
        "baseInstrument": "LINK",
        "dependInstrument": "BTC",
        "company": "LINK vs BTC",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "YFIBTC",
        "symbol": "YFIBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "YFI",
        "dependInstrument": "BTC",
        "company": "YFI vs BTC",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "ADABTC",
        "symbol": "ADABTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "ADA",
        "dependInstrument": "BTC",
        "company": "ADA vs BTC",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "XEMBTC",
        "symbol": "XEMBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "XEM",
        "dependInstrument": "BTC",
        "company": "XEM vs BTC",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "XMRBTC",
        "symbol": "XMRBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-5,
        "pricePrecision": 5,
        "baseInstrument": "XMR",
        "dependInstrument": "BTC",
        "company": "XMR vs BTC",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "BCHBTC",
        "symbol": "BCHBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-5,
        "pricePrecision": 5,
        "baseInstrument": "BCH",
        "dependInstrument": "BTC",
        "company": "BCH vs BTC",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "EOSBTC",
        "symbol": "EOSBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-7,
        "pricePrecision": 7,
        "baseInstrument": "EOS",
        "dependInstrument": "BTC",
        "company": "EOS vs BTC",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "TRXBTC",
        "symbol": "TRXBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "TRX",
        "dependInstrument": "BTC",
        "company": "TRX vs BTC",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "ETHUSDT",
        "symbol": "ETHUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.01,
        "pricePrecision": 2,
        "baseInstrument": "ETH",
        "dependInstrument": "USDT",
        "company": "ETH vs USDT",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "BTCUSDT",
        "symbol": "BTCUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.01,
        "pricePrecision": 2,
        "baseInstrument": "BTC",
        "dependInstrument": "USDT",
        "company": "BTC vs USDT",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "BCHUSDT",
        "symbol": "BCHUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.01,
        "pricePrecision": 2,
        "baseInstrument": "BCH",
        "dependInstrument": "USDT",
        "company": "BCH vs USDT",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "XRPUSDT",
        "symbol": "XRPUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "XRP",
        "dependInstrument": "USDT",
        "company": "XRP vs USDT",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "LTCUSDT",
        "symbol": "LTCUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.01,
        "pricePrecision": 2,
        "baseInstrument": "LTC",
        "dependInstrument": "USDT",
        "company": "LTC vs USDT",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "LINKUSDT",
        "symbol": "LINKUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.01,
        "pricePrecision": 2,
        "baseInstrument": "LINK",
        "dependInstrument": "USDT",
        "company": "LINK vs USDT",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "ADAUSDT",
        "symbol": "ADAUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "ADA",
        "dependInstrument": "USDT",
        "company": "ADA vs USDT",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "YFIUSDT",
        "symbol": "YFIUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.01,
        "pricePrecision": 2,
        "baseInstrument": "YFI",
        "dependInstrument": "USDT",
        "company": "YFI vs USDT",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "XMRUSDT",
        "symbol": "XMRUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.01,
        "pricePrecision": 2,
        "baseInstrument": "XMR",
        "dependInstrument": "USDT",
        "company": "XMR vs USDT",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "TRXUSDT",
        "symbol": "TRXUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "TRX",
        "dependInstrument": "USDT",
        "company": "TRX vs USDT",
        "tradable": false,
        "tickSizeCorrect": true
     },
     {
        "id": "EOSUSDT",
        "symbol": "EOSUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.BinanceExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "EOS",
        "dependInstrument": "USDT",
        "company": "EOS vs USDT",
        "tradable": false,
        "tickSizeCorrect": true
     }]
};