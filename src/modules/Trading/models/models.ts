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
