import { IBrokerUserInfo, OrderSide, OrderTypes } from 'modules/Trading/models/models';
import { EOrderStatus } from 'modules/Trading/models/crypto/crypto.models';

export interface MT5TradingAccount {
    Account: string;
    Currency: string;
    Balance: number;
    MarginUsed: number;
    MarginUsable: number;
    Pl: number;
    Equity: number;
}

export interface MT5Order {
    Id: string;
    Account: string;
    Symbol: string;
    Size: number;
    Price: number;
    CurrentPrice?: number;
    SL?: number;
    TP?: number;
    NetPL?: number;
    PipPL?: number;
    Side: OrderSide;
    Type: OrderTypes;
    Status: EOrderStatus;
    Time: number;
    Comment: string;
}

export interface MT5HistoricalOrder {
    Id: string;
    Account: string;
    Symbol: string;
    Size: number;
    Price: number;
    ClosePrice?: number;
    NetPL?: number;
    PipPL?: number;
    Side: OrderSide;
    Type: OrderTypes;
    Status: EOrderStatus;
    Time: number;
    CloseTime: number;
    Comment: string;
}

export interface MT5PlaceOrder {
    Symbol: string;
    Size: number;
    Price?: number;
    SL?: number;
    TP?: number;
    Side: OrderSide;
    Type: OrderTypes;
    Comment: string;
}

export interface MT5EditOrder {
    Id: string;
    Price?: number;
    SL?: number;
    TP?: number;
}

export interface MT5Position {
    Account: string;
    Symbol: string;
    Size: number;
    Price: number;
    CurrentPrice?: number;
    SL?: number;
    TP?: number;
    NetPL?: number;
    PipPL?: number;
    Side: OrderSide;
}
