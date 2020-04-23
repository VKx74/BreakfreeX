import {IBrokerAccount, IBrokerUserInfo, OrderSide} from "../models";
import {EExchange} from "../../../../app/models/common/exchange";
import {EMarketType} from "../../../../app/models/common/marketType";

export interface IStockOrder {
    id: string;
    account: string;
    status: string;
    symbol: string;
    exchange: string;
    averagePrice?: number;
    quantity: number;
    lastPrice?: number;
    createdTime?: number;
    side: OrderSide;
}

export interface IStockTransaction {
    id: string;
    account: string;
    symbol: string;
    exchange: string;
    totalQuantity: number;
    averagePrice: number;
    tradeDate?: number;
    side: OrderSide;
}

export interface IPlaceStockOrderAction {
    symbol: string;
    exchange: EExchange;
    marketType: EMarketType;
    amount: number;
    side: OrderSide;
}

export interface IStockBrokerAccount extends IBrokerAccount {
    name: string;
    currency: string;
    balance: number;
}

export interface IStockBrokerUserInfo extends IBrokerUserInfo {
}