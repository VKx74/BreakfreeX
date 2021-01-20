import {EBrokerInstance} from "../../../app/interfaces/broker/broker";

export interface IBrokerAccount {
    id: string;
}

export interface IBrokerUserInfo {
    username: string;
}

export enum OrderTypes {
    Market = 'Market',
    Limit = 'Limit',
    Stop = 'Stop',
    StopLimit = 'StopLimit'
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
    EXT = 'EXT'
}

export enum RiskClass {
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
    CurrencyRisk = 'CurrencyRisk'
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
