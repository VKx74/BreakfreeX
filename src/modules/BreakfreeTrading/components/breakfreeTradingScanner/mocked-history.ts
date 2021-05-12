import { IBFTATradeProbability, IBFTATradeType, IBFTATrend, IBFTScannerResponseHistoryItem } from "@app/services/algo.service";

export const mockedHistory: IBFTScannerResponseHistoryItem[] = [
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 6,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 3600,
            "exchange": "Oanda",
            "symbol": "AUD_SGD",
            "entry": 1.03759765625,
            "stop": 1.0345458984375
        },
        "time": 1620659067,
        "avgEntry": 1.03759765625
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.SwingN,
            "tte": 20,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 86400,
            "exchange": "NASDAQ",
            "symbol": "TSLA",
            "entry": 750,
            "stop": 823.5294117647056
        },
        "time": 1620659968,
        "avgEntry": 750
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 6,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "NYSE",
            "symbol": "XOM",
            "entry": 62.5,
            "stop": 61.71875
        },
        "time": 1620659968,
        "avgEntry": 62.5
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 11,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "XAG_EUR",
            "entry": 22.4365234375,
            "stop": 22.3486328125
        },
        "time": 1620660057,
        "avgEntry": 22.4365234375
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 6,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "NASDAQ",
            "symbol": "AAL",
            "entry": 21.875,
            "stop": 21.6796875
        },
        "time": 1620661138,
        "avgEntry": 21.875
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 9,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 14400,
            "exchange": "Binance",
            "symbol": "ada-usdt",
            "entry": 1.5625,
            "stop": 1.3671875
        },
        "time": 1620662656,
        "avgEntry": 1.5625
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 4,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "NASDAQ",
            "symbol": "TSLA",
            "entry": 656.250000000001,
            "stop": 664.062500000001
        },
        "time": 1620663248,
        "avgEntry": 656.250000000001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 4,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "CORN_USD",
            "entry": 7.2021484375,
            "stop": 7.1142578125
        },
        "time": 1620664754,
        "avgEntry": 7.2021484375
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 19,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 900,
            "exchange": "NASDAQ",
            "symbol": "BYND",
            "entry": 112.5,
            "stop": 115.625
        },
        "time": 1620665453,
        "avgEntry": 112.5
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 6,
            "tp": IBFTATradeProbability.High,
            "timeframe": 14400,
            "exchange": "Oanda",
            "symbol": "UK100_GBP",
            "entry": 7031.25000000001,
            "stop": 6992.18750000001
        },
        "time": 1620666151,
        "avgEntry": 7031.25000000001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.SwingExt,
            "tte": 4,
            "tp": IBFTATradeProbability.High,
            "timeframe": 14400,
            "exchange": "Oanda",
            "symbol": "GBP_AUD",
            "entry": 1.8096923828125,
            "stop": 1.8206787109375
        },
        "time": 1620666152,
        "avgEntry": 1.8096923828125
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.SwingExt,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 14400,
            "exchange": "Oanda",
            "symbol": "NAS100_USD",
            "entry": 13398.4375,
            "stop": 13257.8125
        },
        "time": 1620668116,
        "avgEntry": 13398.4375
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 3600,
            "exchange": "Binance",
            "symbol": "xlm-btc",
            "entry": 0.00001192092895507815,
            "stop": 0.000011548399925231962
        },
        "time": 1620669855,
        "avgEntry": 0.00001192092895507815
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "EU50_EUR",
            "entry": 4001.46484375001,
            "stop": 3992.67578125001
        },
        "time": 1620671467,
        "avgEntry": 4001.46484375001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "SPX500_USD",
            "entry": 4196.77734375001,
            "stop": 4187.98828125001
        },
        "time": 1620671467,
        "avgEntry": 4196.77734375001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "EUR_CAD",
            "entry": 1.470947265625,
            "stop": 1.47247314453125
        },
        "time": 1620671467,
        "avgEntry": 1.470947265625
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 5,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "NYSE",
            "symbol": "GE",
            "entry": 13.28125,
            "stop": 13.18359375
        },
        "time": 1620672141,
        "avgEntry": 13.28125
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 4,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Binance",
            "symbol": "ada-btc",
            "entry": 0.000028125941753387505,
            "stop": 0.000027455389499664368
        },
        "time": 1620677057,
        "avgEntry": 0.000028125941753387505
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 3600,
            "exchange": "NASDAQ",
            "symbol": "CSCO",
            "entry": 53.125,
            "stop": 52.34375
        },
        "time": 1620677302,
        "avgEntry": 53.125
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 4,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Binance",
            "symbol": "ltc-btc",
            "entry": 0.0060558319091796875,
            "stop": 0.0058841705322265625
        },
        "time": 1620677994,
        "avgEntry": 0.0060558319091796875
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 5,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Binance",
            "symbol": "yfi-usdt",
            "entry": 49609.3750000001,
            "stop": 48203.1250000001
        },
        "time": 1620678622,
        "avgEntry": 49609.3750000001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Binance",
            "symbol": "xmr-usdt",
            "entry": 433.59374999999994,
            "stop": 419.5312499999997
        },
        "time": 1620678622,
        "avgEntry": 433.59374999999994
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 6,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Binance",
            "symbol": "link-btc",
            "entry": 0.0007510185241699238,
            "stop": 0.0007081031799316426
        },
        "time": 1620678622,
        "avgEntry": 0.0007510185241699238
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 7,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "AUD_SGD",
            "entry": 1.0372161865234375,
            "stop": 1.0358428955078125
        },
        "time": 1620679788,
        "avgEntry": 1.0372161865234375
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 6,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "EUR_SGD",
            "entry": 1.6078948974609375,
            "stop": 1.6065216064453125
        },
        "time": 1620679788,
        "avgEntry": 1.6078948974609375
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 7,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 3600,
            "exchange": "Binance",
            "symbol": "link-btc",
            "entry": 0.0007510185241699238,
            "stop": 0.0007081031799316426
        },
        "time": 1620680529,
        "avgEntry": 0.0007510185241699238
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 3600,
            "exchange": "NASDAQ",
            "symbol": "AAL",
            "entry": 21.875,
            "stop": 21.484375
        },
        "time": 1620680760,
        "avgEntry": 21.875
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 5,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Binance",
            "symbol": "xem-btc",
            "entry": 0.00000633299350738527,
            "stop": 0.000006426125764846818
        },
        "time": 1620683336,
        "avgEntry": 0.00000633299350738527
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 7,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "SPX500_USD",
            "entry": 4174.80468750001,
            "stop": 4157.22656250001
        },
        "time": 1620684222,
        "avgEntry": 4174.80468750001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 25,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "AUD_USD",
            "entry": 0.780487060546876,
            "stop": 0.777740478515626
        },
        "time": 1620684222,
        "avgEntry": 0.780487060546876
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 7,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 3600,
            "exchange": "Oanda",
            "symbol": "GBP_JPY",
            "entry": 153.125,
            "stop": 152.734375
        },
        "time": 1620684222,
        "avgEntry": 153.125
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 4,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 14400,
            "exchange": "Oanda",
            "symbol": "XAG_USD",
            "entry": 26.5625,
            "stop": 26.171875
        },
        "time": 1620684222,
        "avgEntry": 26.5625
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.EXT,
            "tte": 7,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "USD_HUF",
            "entry": 295.0439453125,
            "stop": 295.4833984375
        },
        "time": 1620685201,
        "avgEntry": 295.0439453125
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.EXT,
            "tte": 8,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "USD_SGD",
            "entry": 1.3278961181640625,
            "stop": 1.3292694091796875
        },
        "time": 1620685201,
        "avgEntry": 1.3278961181640625
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 6,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "NZD_USD",
            "entry": 0.7259368896484385,
            "stop": 0.7245635986328135
        },
        "time": 1620685201,
        "avgEntry": 0.7259368896484385
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.EXT,
            "tte": 9,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "USD_SEK",
            "entry": 8.35266113281251,
            "stop": 8.36364746093751
        },
        "time": 1620685201,
        "avgEntry": 8.35266113281251
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.EXT,
            "tte": 10,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "EUR_AUD",
            "entry": 1.551055908203125,
            "stop": 1.553802490234375
        },
        "time": 1620685527,
        "avgEntry": 1.551055908203125
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.SwingN,
            "tte": 2,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 86400,
            "exchange": "Oanda",
            "symbol": "XAU_EUR",
            "entry": 1500,
            "stop": 1426.4705882352941
        },
        "time": 1620687889,
        "avgEntry": 1500
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 14400,
            "exchange": "Binance",
            "symbol": "ltc-btc",
            "entry": 0.006103515625,
            "stop": 0.0057220458984375
        },
        "time": 1620691516,
        "avgEntry": 0.006103515625
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "XAG_USD",
            "entry": 27.294921875,
            "stop": 27.119140625
        },
        "time": 1620693197,
        "avgEntry": 27.294921875
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.EXT,
            "tte": 5,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "USD_CHF",
            "entry": 0.9019851684570322,
            "stop": 0.9026718139648447
        },
        "time": 1620693197,
        "avgEntry": 0.9019851684570322
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 6,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "EUR_USD",
            "entry": 1.2111663818359375,
            "stop": 1.2097930908203125
        },
        "time": 1620694910,
        "avgEntry": 1.2111663818359375
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.EXT,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "USD_MXN",
            "entry": 19.976806640625,
            "stop": 19.998779296875
        },
        "time": 1620694910,
        "avgEntry": 19.976806640625
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 14400,
            "exchange": "Oanda",
            "symbol": "US30_USD",
            "entry": 34375.0000000001,
            "stop": 34179.6875000001
        },
        "time": 1620694910,
        "avgEntry": 34375.0000000001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 4,
            "tp": IBFTATradeProbability.High,
            "timeframe": 14400,
            "exchange": "Oanda",
            "symbol": "USD_HUF",
            "entry": 296.875,
            "stop": 298.828125
        },
        "time": 1620694910,
        "avgEntry": 296.875
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.EXT,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "EUR_SEK",
            "entry": 10.13336181640625,
            "stop": 10.13885498046875
        },
        "time": 1620694910,
        "avgEntry": 10.13336181640625
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 14400,
            "exchange": "Oanda",
            "symbol": "AUD_USD",
            "entry": 0.781250000000001,
            "stop": 0.775146484375001
        },
        "time": 1620694910,
        "avgEntry": 0.781250000000001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 6,
            "tp": IBFTATradeProbability.High,
            "timeframe": 3600,
            "exchange": "Oanda",
            "symbol": "USD_SEK",
            "entry": 8.3984375,
            "stop": 8.4228515625
        },
        "time": 1620694910,
        "avgEntry": 8.3984375
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 5,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "AUD_JPY",
            "entry": 85.1074218750001,
            "stop": 84.9316406250001
        },
        "time": 1620694910,
        "avgEntry": 85.1074218750001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 7,
            "tp": IBFTATradeProbability.High,
            "timeframe": 14400,
            "exchange": "Oanda",
            "symbol": "XAU_USD",
            "entry": 1812.5,
            "stop": 1796.875
        },
        "time": 1620694911,
        "avgEntry": 1812.5
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 5,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Binance",
            "symbol": "yfi-btc",
            "entry": 0.9765625000000006,
            "stop": 0.9277343750000007
        },
        "time": 1620695286,
        "avgEntry": 0.9765625000000006
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 3,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Binance",
            "symbol": "yfi-usdt",
            "entry": 56250.00000000015,
            "stop": 54687.50000000014
        },
        "time": 1620695912,
        "avgEntry": 56250.00000000015
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 6,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "HK33_HKD",
            "entry": 28125.0000000001,
            "stop": 28320.3125000001
        },
        "time": 1620703957,
        "avgEntry": 28125.0000000001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 14400,
            "exchange": "Binance",
            "symbol": "eth-usdt",
            "entry": 3750.000000000005,
            "stop": 3437.5000000000036
        },
        "time": 1620705678,
        "avgEntry": 3750.000000000005
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "SGD_CHF",
            "entry": 0.679016113281251,
            "stop": 0.6793975830078135
        },
        "time": 1620712044,
        "avgEntry": 0.679016113281251
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 11,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "USB05Y_USD",
            "entry": 124.40185546875,
            "stop": 124.35791015625
        },
        "time": 1620713126,
        "avgEntry": 124.40185546875
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 12,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "JP225_USD",
            "entry": 28906.2500000001,
            "stop": 29101.5625000001
        },
        "time": 1620713126,
        "avgEntry": 28906.2500000001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.EXT,
            "tte": 8,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "USD_CHF",
            "entry": 0.9037017822265635,
            "stop": 0.9050750732421885
        },
        "time": 1620716860,
        "avgEntry": 0.9037017822265635
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.EXT,
            "tte": 3,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "SGD_CHF",
            "entry": 0.6807327270507822,
            "stop": 0.6814193725585947
        },
        "time": 1620717522,
        "avgEntry": 0.6807327270507822
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.EXT,
            "tte": 6,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "USD_HUF",
            "entry": 296.0205078125,
            "stop": 296.4599609375
        },
        "time": 1620718512,
        "avgEntry": 296.0205078125
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 5,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Binance",
            "symbol": "yfi-usdt",
            "entry": 62500.00000000015,
            "stop": 59375.00000000014
        },
        "time": 1620722954,
        "avgEntry": 62500.00000000015
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Binance",
            "symbol": "yfi-btc",
            "entry": 1.1718750000000004,
            "stop": 1.1230468750000007
        },
        "time": 1620722954,
        "avgEntry": 1.1718750000000004
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 15,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 14400,
            "exchange": "Oanda",
            "symbol": "USD_CAD",
            "entry": 1.220703125,
            "stop": 1.23291015625
        },
        "time": 1620724649,
        "avgEntry": 1.220703125
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "SGD_JPY",
            "entry": 82.0190429687501,
            "stop": 81.9750976562501
        },
        "time": 1620728696,
        "avgEntry": 82.0190429687501
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.BRC,
            "tte": 4,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "EUR_SGD",
            "entry": 1.611328125,
            "stop": 1.610565185546875
        },
        "time": 1620729028,
        "avgEntry": 1.611328125
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 5,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "CHF_JPY",
            "entry": 120.263671875,
            "stop": 120.087890625
        },
        "time": 1620730018,
        "avgEntry": 120.263671875
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "DE10YB_EUR",
            "entry": 170.703125,
            "stop": 170.80078125
        },
        "time": 1620730018,
        "avgEntry": 170.703125
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 5,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "CAD_JPY",
            "entry": 89.6240234375001,
            "stop": 89.5361328125001
        },
        "time": 1620733732,
        "avgEntry": 89.6240234375001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 6,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "SGD_JPY",
            "entry": 81.8115234375001,
            "stop": 81.7236328125001
        },
        "time": 1620737161,
        "avgEntry": 81.8115234375001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "XAU_EUR",
            "entry": 1507.32421875,
            "stop": 1505.56640625
        },
        "time": 1620737161,
        "avgEntry": 1507.32421875
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.SwingExt,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 14400,
            "exchange": "Oanda",
            "symbol": "SG30_SGD",
            "entry": 350.5859375,
            "stop": 347.0703125
        },
        "time": 1620738248,
        "avgEntry": 350.5859375
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "XAU_EUR",
            "entry": 1499.0234375,
            "stop": 1495.5078125
        },
        "time": 1620738248,
        "avgEntry": 1499.0234375
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "XAU_USD",
            "entry": 1827.1484375,
            "stop": 1823.6328125
        },
        "time": 1620738248,
        "avgEntry": 1827.1484375
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.SwingExt,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 14400,
            "exchange": "Oanda",
            "symbol": "EU50_EUR",
            "entry": 3896.484375,
            "stop": 3861.328125
        },
        "time": 1620738248,
        "avgEntry": 3896.484375
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.EXT,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "EUR_CAD",
            "entry": 1.4743804931640625,
            "stop": 1.4757537841796875
        },
        "time": 1620738923,
        "avgEntry": 1.4743804931640625
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 4,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "CAD_SGD",
            "entry": 1.0921478271484375,
            "stop": 1.0907745361328125
        },
        "time": 1620739265,
        "avgEntry": 1.0921478271484375
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "CAD_JPY",
            "entry": 89.4042968750001,
            "stop": 89.2285156250001
        },
        "time": 1620739265,
        "avgEntry": 89.4042968750001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 3,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "XAU_USD",
            "entry": 1810.546875,
            "stop": 1803.515625
        },
        "time": 1620740270,
        "avgEntry": 1810.546875
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 16,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 900,
            "exchange": "Oanda",
            "symbol": "XAG_EUR",
            "entry": 22.216796875,
            "stop": 22.041015625
        },
        "time": 1620741599,
        "avgEntry": 22.216796875
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 3600,
            "exchange": "Oanda",
            "symbol": "HK33_HKD",
            "entry": 28125.0000000001,
            "stop": 28320.3125000001
        },
        "time": 1620742034,
        "avgEntry": 28125.0000000001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Up,
            "type": IBFTATradeType.EXT,
            "tte": 7,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 3600,
            "exchange": "Oanda",
            "symbol": "SGD_JPY",
            "entry": 81.5917968750001,
            "stop": 81.4160156250001
        },
        "time": 1620742034,
        "avgEntry": 81.5917968750001
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 2,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "NASDAQ",
            "symbol": "BIDU",
            "entry": 187.5,
            "stop": 190.625
        },
        "time": 1620742107,
        "avgEntry": 187.5
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.SwingN,
            "tte": 20,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 86400,
            "exchange": "NASDAQ",
            "symbol": "BIDU",
            "entry": 225,
            "stop": 254.41176470588235
        },
        "time": 1620742107,
        "avgEntry": 225
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 7,
            "tp": IBFTATradeProbability.Mid,
            "timeframe": 14400,
            "exchange": "NASDAQ",
            "symbol": "PTON",
            "entry": 100,
            "stop": 112.5
        },
        "time": 1620742107,
        "avgEntry": 100
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.BRC,
            "tte": 1,
            "tp": IBFTATradeProbability.High,
            "timeframe": 900,
            "exchange": "NASDAQ",
            "symbol": "PLUG",
            "entry": 21.875,
            "stop": 22.65625
        },
        "time": 1620742447,
        "avgEntry": 21.875
    },
    {
        "responseItem": {
            "trend": IBFTATrend.Down,
            "type": IBFTATradeType.SwingN,
            "tte": 8,
            "tp": IBFTATradeProbability.Low,
            "timeframe": 86400,
            "exchange": "NYSE",
            "symbol": "RACE",
            "entry": 200,
            "stop": 214.7058823529412
        },
        "time": 1620743663,
        "avgEntry": 200
    }
];