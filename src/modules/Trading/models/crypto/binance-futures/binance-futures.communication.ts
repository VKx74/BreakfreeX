import { BrokerRequestMessageBase, BrokerResponseMessageBase } from "../../communication";

export enum BinanceFutureMessageType {
    LoginFuturesUsdt = "LoginFuturesUsdt",
    AccountUpdate = "AccountUpdate",
    FuturesUsdtOrdersHistory = "FuturesUsdtOrdersHistory",
    FuturesUsdtOpenOrders = "FuturesUsdtOpenOrders"
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

export interface IBinanceFutureOrderHistoryResponseData {
    Type: string;
    Orders: IBinanceFutureHistoricalOrder[];
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

export class BinanceFutureOpenOrderRequest extends BrokerRequestMessageBase {
    constructor() {
        super(BinanceFutureMessageType.FuturesUsdtOpenOrders);
    }
}

// Responses
export class BinanceFutureLoginResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureSymbolData[];
}

export class BinanceFutureOrderHistoryResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureOrderHistoryResponseData;
}

export class BinanceFutureOpenOrderResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureOpenOrderResponseData;
}

export class BinanceFutureAccountUpdateResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureAccountUpdatedData;
}