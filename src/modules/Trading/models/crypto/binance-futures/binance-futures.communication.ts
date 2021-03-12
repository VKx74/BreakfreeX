import { BrokerRequestMessageBase, BrokerResponseMessageBase } from "../../communication";

export enum BinanceFutureUsdtMessageType {
    LoginFuturesUsdt = "LoginFuturesUsdt",
    FuturesUsdtOrdersHistory = "FuturesUsdtOrdersHistory",
    FuturesUsdtSymbolTradeHistory = "FuturesUsdtSymbolTradeHistory",
    GetFuturesUsdtBookPrice = "GetFuturesUsdtBookPrice",
    SubscribeFuturesUsdtQuote = "SubscribeFuturesUsdtQuote",
    SubscribeFuturesUsdtBookTicker = "SubscribeFuturesUsdtBookTicker",
    FuturesUsdtOpenOrders = "FuturesUsdtOpenOrders",
    FuturesUsdtSymbolMyTrades = "FuturesUsdtSymbolMyTrades",
    CloseFuturesUsdtOrder = "CloseFuturesUsdtOrder",
    FuturesUsdtSymbolOrderInfo = "FuturesUsdtSymbolOrderInfo",
    PlaceFuturesUsdtOrder = "PlaceFuturesUsdtOrder",
    SubscribeFuturesUsdtMarkPrice = "SubscribeFuturesUsdtMarkPrice"
}

export enum BinanceFutureCoinMessageType {
    LoginFuturesCoin = "LoginFuturesCoin",
    FuturesCoinOrdersHistory = "FuturesCoinOrdersHistory",
    FuturesCoinSymbolTradeHistory = "FuturesCoinSymbolTradeHistory",
    GetFuturesCoinBookPrice = "GetFuturesCoinBookPrice",
    SubscribeFuturesCoinQuote = "SubscribeFuturesCoinQuote",
    SubscribeFuturesCoinBookTicker = "SubscribeFuturesCoinBookTicker",
    FuturesCoinOpenOrders = "FuturesCoinOpenOrders",
    FuturesCoinSymbolMyTrades = "FuturesCoinSymbolMyTrades",
    CloseFuturesCoinOrder = "CloseFuturesCoinOrder",
    FuturesCoinSymbolOrderInfo = "FuturesCoinSymbolOrderInfo",
    PlaceFuturesCoinOrder = "PlaceFuturesCoinOrder",
    SubscribeFuturesCoinMarkPrice = "SubscribeFuturesCoinMarkPrice"
}

export enum BinanceFutureBrokerType {
    USDT = "USDT",
    COIN = "COIN"
}

export interface IBinanceFutureSymbolBasedData {
    Symbol: string;
}

export interface IBinanceFutureLoginData {
    ApiKey: string;
    ApiSecret: string;
}

export interface IBinanceLastPrice {
    Price: number;
    Symbol: string;
}

export interface IBinanceFutureGetOrdersData extends IBinanceFutureSymbolBasedData {
    From: number;
    To: number;
}

export interface IBinanceFutureGetTradesData extends IBinanceFutureSymbolBasedData {
    From: number;
    To: number;
}

export interface IBinanceFutureCloseOrderData extends IBinanceFutureSymbolBasedData {
    OrderId: any;
}

export interface IBinanceFutureOrderInfoData extends IBinanceFutureSymbolBasedData {
    OrderId: any;
}

export interface IBinanceFutureQuoteSubscriptionData extends IBinanceFutureSymbolBasedData {
    Subscribe: boolean;
}

export interface IBinanceFutureMarketPriceSubscriptionData extends IBinanceFutureSymbolBasedData {
    Subscribe: boolean;
}

export interface IBinanceFutureOrderBookSubscriptionData extends IBinanceFutureSymbolBasedData {
    Subscribe: boolean;
}

export interface IBinanceFutureSymbolData {
    Type: string;
    Name: string;
    BaseAsset: string;
    QuoteAsset: string;
    QuoteAssetPrecision: number;
    BaseCommissionPrecision: number;
    QuoteCommissionPrecision: number;
    ContractSize?: number;
    PricePrecision?: number;
    IceBergAllowed: boolean;
    IsSpotTradingAllowed: boolean;
    IsMarginTradingAllowed: boolean;
    OCOAllowed: boolean;
    Pair: string;
    DeliveryDate: string;
    ListingDate: string;
}

export interface IBinanceFutureMarketPrice {
    MarkPrice: number;
    Symbol: string;
}

export interface IBinanceFutureTick {
    BaseVolume: number;
    QuoteVolume: number;
    Symbol: string;
    PriceChange: number;
    PriceChangePercent: number;
    WeightedAveragePrice: number;
    PrevDayClosePrice: number;
    LastPrice: number;
    LastQuantity: number;
    BidPrice: number;
    BidQuantity: number;
    AskPrice: number;
    AskQuantity: number;
    OpenPrice: number;
    HighPrice: number;
    LowPrice: number;
    FirstTradeId: number;
    LastTradeId: number;
    TotalTrades: number;
    OpenTime: number;
    CloseTime: number;
    Event: string;
    EventTime: number;
}

export interface IBinanceFutureOrderBookItem {
    TransactionTime: number;
    EventTime: number;
    Event: string;
    UpdateId: number;
    Symbol: string;
    BestBidPrice: number;
    BestBidQuantity: number;
    BestAskPrice: number;
    BestAskQuantity: number;
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
    positionAmt: number;
    InitialMargin: number;
    MaintMargin: number;
    PositionInitialMargin: number;
    OpenOrderInitialMargin: number;
    Symbol: string;
    EntryPrice: number;
    Leverage: number;
    UnrealizedProfit: number;
    PositionSide: string;
}

export interface IBinanceFutureAccountInfoData {
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

export interface IBinanceFutureBookPrice {
    Symbol: string;
    bidPrice: number;
    bidQty: number;
    askPrice: number;
    askQty: number;
    time: number;
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

export interface IBinanceFutureBookPriceResponseData {
    Type: string;
    BookPrice: IBinanceFutureBookPrice;
}

export interface IBinanceFutureOpenOrderResponseData {
    Type: string;
    Orders: IBinanceFutureOrder[];
}

// Requests
export class BinanceFutureLoginRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureLoginData;

    constructor(type: BinanceFutureBrokerType) {
        super(type === BinanceFutureBrokerType.USDT ? BinanceFutureUsdtMessageType.LoginFuturesUsdt : BinanceFutureCoinMessageType.LoginFuturesCoin);
    }
}

export class BinanceOrderHistoryRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureGetOrdersData;

    constructor(type: BinanceFutureBrokerType) {
        super(type === BinanceFutureBrokerType.USDT ? BinanceFutureUsdtMessageType.FuturesUsdtOrdersHistory : BinanceFutureCoinMessageType.FuturesCoinOrdersHistory);
    }
}

export class BinanceFutureTradeHistoryRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureGetTradesData;

    constructor(type: BinanceFutureBrokerType) {
        super(type === BinanceFutureBrokerType.USDT ? BinanceFutureUsdtMessageType.FuturesUsdtSymbolMyTrades : BinanceFutureCoinMessageType.FuturesCoinSymbolMyTrades);
    }
}

export class BinanceFutureMarketTradesRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureSymbolBasedData;

    constructor(type: BinanceFutureBrokerType) {
        super(type === BinanceFutureBrokerType.USDT ? BinanceFutureUsdtMessageType.FuturesUsdtSymbolTradeHistory : BinanceFutureCoinMessageType.FuturesCoinSymbolTradeHistory);
    }
}

export class BinanceFutureBookPriceRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureSymbolBasedData;

    constructor(type: BinanceFutureBrokerType) {
        super(type === BinanceFutureBrokerType.USDT ? BinanceFutureUsdtMessageType.GetFuturesUsdtBookPrice : BinanceFutureCoinMessageType.GetFuturesCoinBookPrice);
    }
}

export class BinanceFutureSubscribeQuoteRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureQuoteSubscriptionData;

    constructor(type: BinanceFutureBrokerType) {
        super(type === BinanceFutureBrokerType.USDT ? BinanceFutureUsdtMessageType.SubscribeFuturesUsdtQuote : BinanceFutureCoinMessageType.SubscribeFuturesCoinQuote);
    }
}

export class BinanceFutureSubscribeMarketPriceRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureMarketPriceSubscriptionData;

    constructor(type: BinanceFutureBrokerType) {
        super(type === BinanceFutureBrokerType.USDT ? BinanceFutureUsdtMessageType.SubscribeFuturesUsdtMarkPrice : BinanceFutureCoinMessageType.SubscribeFuturesCoinMarkPrice);
    }
}

export class BinanceFutureSubscribeOrderBookRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureOrderBookSubscriptionData;

    constructor(type: BinanceFutureBrokerType) {
        super(type === BinanceFutureBrokerType.USDT ? BinanceFutureUsdtMessageType.SubscribeFuturesUsdtBookTicker : BinanceFutureCoinMessageType.SubscribeFuturesCoinBookTicker);
    }
}

export class BinanceFutureOpenOrderRequest extends BrokerRequestMessageBase {
    constructor(type: BinanceFutureBrokerType) {
        super(type === BinanceFutureBrokerType.USDT ? BinanceFutureUsdtMessageType.FuturesUsdtOpenOrders : BinanceFutureCoinMessageType.FuturesCoinOpenOrders);
    }
}

export class BinanceFutureCloseOrderRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureCloseOrderData;

    constructor(type: BinanceFutureBrokerType) {
        super(type === BinanceFutureBrokerType.USDT ? BinanceFutureUsdtMessageType.CloseFuturesUsdtOrder : BinanceFutureCoinMessageType.CloseFuturesCoinOrder);
    }
}

export class BinanceFutureOrderInfoRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureOrderInfoData;

    constructor(type: BinanceFutureBrokerType) {
        super(type === BinanceFutureBrokerType.USDT ? BinanceFutureUsdtMessageType.FuturesUsdtSymbolOrderInfo : BinanceFutureCoinMessageType.FuturesCoinSymbolOrderInfo);
    }
}

export class BinanceFuturePlaceOrderRequest extends BrokerRequestMessageBase {
    public Data: any;

    constructor(type: BinanceFutureBrokerType) {
        super(type === BinanceFutureBrokerType.USDT ? BinanceFutureUsdtMessageType.PlaceFuturesUsdtOrder : BinanceFutureCoinMessageType.PlaceFuturesCoinOrder);
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

export class BinanceFutureBookPriceResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureBookPriceResponseData;
}

export class BinanceFutureOpenOrderResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureOpenOrderResponseData;
}

export class BinanceFutureAccountInfoResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureAccountInfoData;
}

export class BinanceFuturePositionDetailsResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFuturePosition[];
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

export class BinanceFutureSubscribeQuoteResponse extends BrokerResponseMessageBase {
    public Data: any;
}

export class BinanceFutureSubscribeMarketPriceResponse extends BrokerResponseMessageBase {
    public Data: any;
}

export class BinanceFutureTickResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureTick;
}

export class BinanceFutureMarketPriceResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureMarketPrice;
}

export class BinanceFutureOrderBookItemResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureOrderBookItem;
}

export class BinanceFutureSubscribeOrderBookResponse extends BrokerResponseMessageBase {
    public Data: any;
}

export class BinanceFutureOrderUpdateResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureOrderUpdate;
}

export class BinanceFutureAccountUpdateResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFuturesAccountUpdate;
}

// events

export enum FuturesOrderStatus {
    NEW = "NEW",
    PARTIALLY_FILLED = "PARTIALLY_FILLED",
    FILLED = "FILLED",
    CANCELED = "CANCELED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}
export interface IBinanceFuturesOrderUpdateData {
    Symbol: string;
    ClientOrderId: string;
    Side: string;
    Type: string;
    TimeInForce: string;
    Quantity: number;
    Price: number;
    AveragePrice: number;
    StopPrice: number;
    ExecutionType: string;
    Status: FuturesOrderStatus;
    OrderId: number;
    QuantityOfLastFilledTrade: number;
    AccumulatedQuantityOfFilledTrades: number;
    PriceLastFilledTrade: number;
    Commission: number;
    CommissionAsset: string;
    CreateTime: number;
    TradeId: number;
    BidNotional: number;
    AskNotional: number;
    BuyerIsMaker: boolean;
    IsReduce: boolean;
    StopPriceWorking: string;
    OriginalType: string;
    PositionSide: string;
    PushedConditionalOrder: boolean;
    ActivationPrice: number;
    CallbackRate: number;
}

export interface IBinanceFutureOrderUpdate {
    UpdateData: IBinanceFuturesOrderUpdateData;
    TransactionTime: number;
    Event: string;
    EventTime: number;
}

export interface IBinanceFuturesBalanceUpdateData {
    Asset: string;
    WalletBalance: number;
    CrossBalance: number;
}

export interface IBinanceFuturesPositionUpdateData {
    Symbol: string;
    PositionAmount: number;
    EntryPrice: number;
    RealizedPnL: number;
    UnrealizedPnl: number;
    MarginType: string;
    IsolatedWallet: number;
    PositionSide: string;
}

export interface IBinanceFuturesAccountUpdateData {
    Reason: string;
    Balances: IBinanceFuturesBalanceUpdateData[];
    Positions: IBinanceFuturesPositionUpdateData[];
}

export interface IBinanceFuturesAccountUpdate {
    UpdateData: IBinanceFuturesAccountUpdateData;
    TransactionTime: number;
    Event: string;
    EventTime: number;
}