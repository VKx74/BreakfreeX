import { BrokerRequestMessageBase, BrokerResponseMessageBase } from "../../communication";

export enum BinanceFutureMessageType {
    LoginFuturesUsdt = "LoginFuturesUsdt",
    AccountUpdate = "AccountUpdate",
    FuturesUsdtOrdersHistory = "FuturesUsdtOrdersHistory",
    FuturesUsdtSymbolTradeHistory = "FuturesUsdtSymbolTradeHistory",
    FuturesUsdtOpenOrders = "FuturesUsdtOpenOrders",
    FuturesUsdtSymbolMyTrades = "FuturesUsdtSymbolMyTrades",
    CloseFuturesUsdtOrder = "CloseFuturesUsdtOrder",
    FuturesUsdtSymbolOrderInfo = "FuturesUsdtSymbolOrderInfo",
    PlaceFuturesUsdtOrder = "PlaceFuturesUsdtOrder"
}

export interface IBinanceFutureLoginData {
    ApiKey: string;
    ApiSecret: string;
}

export interface IBinanceFutureGetOrdersData {
    Symbol: string;
    From: number;
    To: number;
}

export interface IBinanceFutureGetTradesData {
    Symbol: string;
    From: number;
    To: number;
}

export interface IBinanceFutureGetMarketTradesData {
    Symbol: string;
}

export interface IBinanceFutureCloseOrderData {
    Symbol: string;
    OrderId: any;
}

export interface IBinanceFutureOrderInfoData {
    Symbol: string;
    OrderId: any;
}

export interface IBinanceFutureSymbolData {
    Type: string;
    Name: string;
    BaseAsset: string;
    QuoteAsset: string;
    QuoteAssetPrecision: number;
    BaseCommissionPrecision: number;
    QuoteCommissionPrecision: number;
    IceBergAllowed: boolean;
    IsSpotTradingAllowed: boolean;
    IsMarginTradingAllowed: boolean;
    OCOAllowed: boolean;
    Pair: string;
    DeliveryDate: string;
    ListingDate: string;
}

export interface IBinanceFutureAsset {
    Asset: string;
    InitialMargin: number;
    MaintMargin: number;
    MarginBalance: number;
    MaxWithdrawAmount: number;
    OpenOrderInitialMargin: number;
    PositionInitialMargin: number;
    UnrealizedProfit: number;
    WalletBalance: number;
    CrossWalletBalance: number;
    CrossUnPnl: number;
    AvailableBalance: number;
}

export interface IBinanceFuturePosition {
    MaxNotional: number;
    positionAmt: number;
    InitialMargin: number;
    MaintMargin: number;
    PositionInitialMargin: number;
    OpenOrderInitialMargin: number;
    Isolated: boolean;
    Symbol: string;
    EntryPrice: number;
    Leverage: number;
    UnrealizedProfit: number;
    PositionSide: string;
}

export interface IBinanceFutureAccountUpdatedData {
    CanDeposit: true;
    CanTrade: true;
    CanWithdraw: true;
    FeeTier: number;
    MaxWithdrawAmount: number;
    TotalInitialMargin: number;
    TotalMaintMargin: number;
    TotalMarginBalance: number;
    TotalOpenOrderInitialMargin: number;
    TotalPositionInitialMargin: number;
    TotalUnrealizedProfit: number;
    TotalWalletBalance: number;
    TotalCrossWalletBalance: number;
    TotalCrossUnPnl: number;
    AvailableBalance: number;
    updateTime: number;
    Assets: IBinanceFutureAsset[];
    Positions: IBinanceFuturePosition[];
}

export interface IBinanceFutureHistoricalOrder {
    symbol: string;
    orderId: any;
    clientOrderId: string;
    price: number;
    avgPrice: number;
    cumQty: number;
    cumQuote: number;
    executedQty: number;
    origQty: number;
    reduceOnly: boolean;
    closePosition: boolean;
    side: string;
    status: string;
    stopPrice: number;
    timeInForce: string;
    origType: string;
    type: string;
    activatePrice?: any;
    priceRate?: any;
    updateTime: number;
    time: number;
    workingType: string;
    positionSide: string;
}

export interface IBinanceFutureOrder {
    symbol: string;
    orderId: number;
    clientOrderId: string;
    price: number;
    avgPrice: number;
    cumQty: number;
    cumQuote: number;
    executedQty: number;
    origQty: number;
    reduceOnly: boolean;
    closePosition: boolean;
    side: string;
    status: string;
    stopPrice: number;
    timeInForce: string;
    origType: string;
    type: string;
    activatePrice?: any;
    priceRate?: any;
    updateTime: number;
    time: number;
    workingType: string;
    positionSide: string;
}

export interface IBinanceFutureTrade {
    quoteQty: number;
    Symbol: string;
    Buyer: boolean;
    Commission: number;
    CommissionAsset: string;
    Id: number;
    Maker: boolean;
    OrderId: any;
    Price: number;
    qty: number;
    RealizedPnl: number;
    Side: string;
    PositionSide: string;
    time: number;
}

export interface IBinanceFutureMarketTradeHistory {
    quoteQty: number;
    qty: number;
    id: number;
    Price: number;
    Time: any;
    isBuyerMaker: boolean;
    IsBestMatch: boolean;
}

export interface IBinanceFutureOrderHistoryResponseData {
    Type: string;
    Orders: IBinanceFutureHistoricalOrder[];
}

export interface IBinanceFutureTradeHistoryResponseData {
    Type: string;
    Trades: IBinanceFutureTrade[];
}

export interface IBinanceFutureMarketTradeResponseData {
    Type: string;
    History: IBinanceFutureMarketTradeHistory[];
}

export interface IBinanceFutureOpenOrderResponseData {
    Type: string;
    Orders: IBinanceFutureOrder[];
}

// Requests
export class BinanceFutureLoginRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureLoginData;

    constructor() {
        super(BinanceFutureMessageType.LoginFuturesUsdt);
    }
}

export class BinanceOrderHistoryRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureGetOrdersData;

    constructor() {
        super(BinanceFutureMessageType.FuturesUsdtOrdersHistory);
    }
}

export class BinanceFutureTradeHistoryRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureGetTradesData;

    constructor() {
        super(BinanceFutureMessageType.FuturesUsdtSymbolMyTrades);
    }
}

export class BinanceFutureMarketTradesRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureGetMarketTradesData;

    constructor() {
        super(BinanceFutureMessageType.FuturesUsdtSymbolTradeHistory);
    }
}

export class BinanceFutureOpenOrderRequest extends BrokerRequestMessageBase {
    constructor() {
        super(BinanceFutureMessageType.FuturesUsdtOpenOrders);
    }
}

export class BinanceFutureCloseOrderRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureCloseOrderData;

    constructor() {
        super(BinanceFutureMessageType.CloseFuturesUsdtOrder);
    }
}

export class BinanceFutureOrderInfoRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureOrderInfoData;

    constructor() {
        super(BinanceFutureMessageType.FuturesUsdtSymbolOrderInfo);
    }
}

export class BinanceFuturePlaceOrderRequest extends BrokerRequestMessageBase {
    public Data: any;

    constructor() {
        super(BinanceFutureMessageType.PlaceFuturesUsdtOrder);
    }
}

// Responses
export class BinanceFutureLoginResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureSymbolData[];
}

export class BinanceFutureOrderHistoryResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureOrderHistoryResponseData;
}

export class BinanceFutureTradeHistoryResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureTradeHistoryResponseData;
}

export class BinanceFutureMarketTradeResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureMarketTradeResponseData;
}

export class BinanceFutureOpenOrderResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureOpenOrderResponseData;
}

export class BinanceFutureAccountUpdateResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureAccountUpdatedData;
}

export class BinanceFutureCloseOrderResponse extends BrokerResponseMessageBase {
    public Data: any;
}

export class BinanceFutureOrderInfoResponse extends BrokerResponseMessageBase {
    public Data: any;
}

export class BinanceFuturePlaceOrderResponse extends BrokerResponseMessageBase {
    public Data: any;
}