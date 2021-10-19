export enum BrokerConnectivityStatus {
    Connected,
    Pending,
    NoConnection
}

export interface IConnectionData {
    Linker?: string;
}

export enum OrderTypes {
    Market = 'Market',
    Limit = 'Limit',
    Stop = 'Stop',
    StopLimit = 'StopLimit',
    StopLoss = 'StopLoss',
    StopLossLimit = 'StopLossLimit',
    StopMarket = 'StopMarket',
    TakeProfit = 'TakeProfit',
    TakeProfitMarket = 'TakeProfitMarket',
    TakeProfitLimit = 'TakeProfitLimit',
    LimitMaker = 'LimitMaker',
    TrailingStopMarket = 'TrailingStopMarket',
    Liquidation = 'Liquidation'
}

export enum OrderSide {
    Buy = 'Buy',
    Sell = 'Sell'
}

export enum OrderFillPolicy {
    IOC = 'IOC',
    FOK = 'FOK',
    FF = 'FF'
}

export enum OrderExpirationType {
    GTC = 'GTC',
    Today = 'Today',
    Specified = 'Specified'
}

export enum OrderTradeType {
    BRC = 'BRC',
    SWING = 'SWING',
    EXT = 'EXT',
    None = ""
}

export enum RiskClass {
    Calculating = 5,
    Extreme = 4,
    High = 3,
    Medium = 2,
    Low = 1,
    NoRisk = 0
}

export enum RiskType {
    WrongTrend = 'WrongTrend',
    PriceFarFromEntry = 'PriceFarFromEntry',
    HighRisk = 'HighRisk',
    SLNotSet = 'SLNotSet',
    NoRisk = ''
}

export enum RiskObject {
    Positions = 'Positions',
    MarketOrders = 'OpenOrders',
    ActiveOrders = 'ActiveOrders',
    CurrencyRisk = 'CurrencyRisk'
}

export enum TradeManagerTab {
    Positions = 'Positions',
    MarketOrders = 'MarketOrders',
    ActiveOrders = 'ActiveOrders',
    OrderHistory = 'OrderHistory',
    AccountInfo = 'AccountInfo',
    CurrencyRisk = 'CurrencyRisk',
    TradeHistory = 'TradeHistory',
    Funds = 'Funds',
    Assets = 'Assets',
}

export enum TimeInForce {
    GoodTillCancel = 'GoodTillCancel', 
    ImmediateOrCancel = 'ImmediateOrCancel', 
    FillOrKill = 'FillOrKill', 
    GoodTillCrossing = 'GoodTillCrossing', 
    GoodTillExpiredOrCanceled = 'GoodTillExpiredOrCanceled'
}

export enum OrderPlacedFrom {
    Sonar = 'Sonar',
    Manually = 'Manually'
}

export interface ActionResult {
    result: boolean;
    msg?: string;
    data?: object;
}

export enum TradeActionType {
    Place = 'Place',
    Cancel = 'Cancel'
}

export interface IPlaceOrderAction {
    symbol: string;
    side: OrderSide;
    size: number;
    type: OrderTypes;
}

export interface ICancelOrderAction {
    Id: string;
}

export interface ICloseTradeAction {
    Id: string;
}

export interface IOrder {
    Id: number;
    Symbol: string;
    Size: number;
    Price: number;
    CurrentPrice?: number;
    SL?: number;
    TP?: number;
    Side: OrderSide;
    Type: OrderTypes;
    NetPL?: number;
}

export interface IPosition {
    Size: number;
    Symbol: string;
    Price: number;
    NetPL?: number;
    Side: OrderSide;
}

export interface IOrderRisk {
    Risk?: number;
    RiskPercentage?: number;
    RiskClass?: RiskClass;
}

export interface IPlaceOrder {
    Symbol: string;
    Size: number;
    Price?: number;
    Side: OrderSide;
    Type: OrderTypes;
    Timeframe?: number;
    TradeType?: OrderTradeType;
    PlacedFrom?: OrderPlacedFrom;
}