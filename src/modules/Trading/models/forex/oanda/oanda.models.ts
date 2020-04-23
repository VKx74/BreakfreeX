import { IBrokerUserInfo, OrderSide, OrderTypes } from 'modules/Trading/models/models';
import { EOrderStatus } from 'modules/Trading/models/crypto/crypto.models';

export interface OandaTradingAccount extends IBrokerUserInfo {
    Id: string;
    Currency: string;
    Balance: number;
    UnrealizedPL: number;
    MarginUsed: number;
    MarginAvailable: number;
    Pl: number;
    MarginRate: number;
}

export class OandaPosition {
    closePrice: number;
    ordersIds: number[];
    pl: number;
    side: OrderSide;
    symbol: string;
    totalClosedUnits: number;
    units: number;
    upl: number;
    avgPrice: number;
}

export interface OandaOrder {
    id: string;
    filledTradeId?: string;
    symbol: string;
    size: number;
    price: number;
    marketPrice?: number;
    side: OrderSide;
    type: OrderTypes;
    status: EOrderStatus;
    time: number;
}

export interface ICloseOandaPositionAction {
    Symbol: string;
}