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
        "id": "eth-btc",
        "symbol": "ETHBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "ETH",
        "dependInstrument": "BTC",
        "company": "ETH vs BTC",
        "tradable": false
     },
     {
        "id": "xrp-btc",
        "symbol": "XRPBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "XRP",
        "dependInstrument": "BTC",
        "company": "XRP vs BTC",
        "tradable": false
     },
     {
        "id": "xlm-btc",
        "symbol": "XLMBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "XLM",
        "dependInstrument": "BTC",
        "company": "XLM vs BTC",
        "tradable": false
     },
     {
        "id": "ltc-btc",
        "symbol": "LTCBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "LTC",
        "dependInstrument": "BTC",
        "company": "LTC vs BTC",
        "tradable": false
     },
     {
        "id": "link-btc",
        "symbol": "LINKBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "LINK",
        "dependInstrument": "BTC",
        "company": "LINK vs BTC",
        "tradable": false
     },
     {
        "id": "yfi-btc",
        "symbol": "YFIBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "YFI",
        "dependInstrument": "BTC",
        "company": "YFI vs BTC",
        "tradable": false
     },
     {
        "id": "ada-btc",
        "symbol": "ADABTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "ADA",
        "dependInstrument": "BTC",
        "company": "ADA vs BTC",
        "tradable": false
     },
     {
        "id": "xem-btc",
        "symbol": "XEMBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "XEM",
        "dependInstrument": "BTC",
        "company": "XEM vs BTC",
        "tradable": false
     },
     {
        "id": "xmr-btc",
        "symbol": "XMRBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "XMR",
        "dependInstrument": "BTC",
        "company": "XMR vs BTC",
        "tradable": false
     },
     {
        "id": "bch-btc",
        "symbol": "BCHBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "BCH",
        "dependInstrument": "BTC",
        "company": "BCH vs BTC",
        "tradable": false
     },
     {
        "id": "eos-btc",
        "symbol": "EOSBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "EOS",
        "dependInstrument": "BTC",
        "company": "EOS vs BTC",
        "tradable": false
     },
     {
        "id": "trx-btc",
        "symbol": "TRXBTC",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 1e-8,
        "pricePrecision": 8,
        "baseInstrument": "TRX",
        "dependInstrument": "BTC",
        "company": "TRX vs BTC",
        "tradable": false
     },
     {
        "id": "eth-usdt",
        "symbol": "ETHUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "ETH",
        "dependInstrument": "USDT",
        "company": "ETH vs USDT",
        "tradable": false
     },
     {
        "id": "btc-usdt",
        "symbol": "BTCUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "BTC",
        "dependInstrument": "USDT",
        "company": "BTC vs USDT",
        "tradable": false
     },
     {
        "id": "bch-usdt",
        "symbol": "BCHUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "BCH",
        "dependInstrument": "USDT",
        "company": "BCH vs USDT",
        "tradable": false
     },
     {
        "id": "xrp-usdt",
        "symbol": "XRPUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "XRP",
        "dependInstrument": "USDT",
        "company": "XRP vs USDT",
        "tradable": false
     },
     {
        "id": "ltc-usdt",
        "symbol": "LTCUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "LTC",
        "dependInstrument": "USDT",
        "company": "LTC vs USDT",
        "tradable": false
     },
     {
        "id": "link-usdt",
        "symbol": "LINKUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "LINK",
        "dependInstrument": "USDT",
        "company": "LINK vs USDT",
        "tradable": false
     },
     {
        "id": "ada-usdt",
        "symbol": "ADAUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "ADA",
        "dependInstrument": "USDT",
        "company": "ADA vs USDT",
        "tradable": false
     },
     {
        "id": "yfi-usdt",
        "symbol": "YFIUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "YFI",
        "dependInstrument": "USDT",
        "company": "YFI vs USDT",
        "tradable": false
     },
     {
        "id": "xmr-usdt",
        "symbol": "XMRUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "XMR",
        "dependInstrument": "USDT",
        "company": "XMR vs USDT",
        "tradable": false
     },
     {
        "id": "trx-usdt",
        "symbol": "TRXUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "TRX",
        "dependInstrument": "USDT",
        "company": "TRX vs USDT",
        "tradable": false
     },
     {
        "id": "eos-usdt",
        "symbol": "EOSUSDT",
        "exchange": EExchange.Binance,
        "datafeed": EExchangeInstance.KaikoExchange,
        "type": EMarketType.Crypto,
        "tickSize": 0.0001,
        "pricePrecision": 4,
        "baseInstrument": "EOS",
        "dependInstrument": "USDT",
        "company": "EOS vs USDT",
        "tradable": false
     }]
};