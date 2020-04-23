import {IPlaceStockOrderAction, IStockBrokerAccount, IStockOrder, IStockTransaction} from "../stock.models";

export enum EZenithTIF {
    UntilCancel = 'UntilCancel',
    FillAndKill = 'FillAndKill',
    FillOrKill = 'FillOrKill',
    AllOrNone = 'AllOrNone'
}

export enum EZenithOrderStyle {
    Equity = 'Equity',
    Option = 'Option',
    ManagedFund = 'ManagedFund'
}

export enum EZenithPriceTypes {
    Limit = "Limit",
    Best = "Best",
    Market = "Market",
    MarketToLimit = "MarketToLimit"
}

export enum EZenithUnitTypes {
    Currency = "Currency",
    Units = "Units"
}

export enum EZenithOrderStatus {
    Rejected = "Rejected",
    Closed = "Closed",
    OnMarket = "OnMarket",
    DoneForDay = "DoneForDay",
    Canceled = "Canceled",
    Suspended = "Suspended",
    Filled = "Filled",
}

export interface IZenitDetails {
    style: string;
    side: string;
    exchange: string;
    code: string;
    type: string;
    limitPrice: number;
    quantity: number;
    validity: string;
}

export interface IZenitRoute {
    algorithm: string;
    market: string;
}

// https://paritech.gitbook.io/zenith-websockets-api/api-controllers/trading/orders
export interface IZenithOrder extends IStockOrder {
    style: string;
    externalID: string;
    depthOrderID: string;
    currency: string;
    currentBrokerage: number;
    estimatedBrokerage: number;
    currentTax: number;
    estimatedTax: number;
    currentValue: number;
    estimatedValue: number;
    updatedDate: Date;
    createdDate: Date;
    executedQuantity: number;
    details: IZenitDetails;
    route: IZenitRoute;
}

// https://paritech.gitbook.io/zenith-websockets-api/api-controllers/trading/transactions
export interface IZenithTransaction extends IStockTransaction {
    tradingMarket: string;
    settlementDate: Date;
    grossAmount: number;
    netAmount: number;
    settlementAmount: number;
    orderID: string;
    style: number;
}

export interface IZenithPlaceOrderAction extends IPlaceStockOrderAction {
    activeValidity: EZenithTIF;
    activePriceType: EZenithPriceTypes;
    style: EZenithOrderStyle;
    price?: number;
    activeUnitType?: EZenithUnitTypes;
    expiration?: Date;
    accountId: string;
    route: string;
}

export interface IZenithLoginAction {
    username: string;
    password: string;
}

export interface IZenithBrokerAccount extends IStockBrokerAccount {
    feed: string;
    provider: string;
}