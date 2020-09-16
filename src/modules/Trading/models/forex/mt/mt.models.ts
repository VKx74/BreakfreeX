import { OrderSide, OrderTypes, OrderFillPolicy, OrderExpirationType } from 'modules/Trading/models/models';
import { EOrderStatus } from 'modules/Trading/models/crypto/crypto.models';

export interface MT5TradingAccount {
    Account: string;
    Currency: string;
    CompanyName: string;
    Balance: number;
    Margin: number;
    FreeMargin: number;
    Pl: number;
    Equity: number;
}

export interface MT5Order {
    Id: number;
    Symbol: string;
    Size: number;
    Price: number;
    CurrentPrice?: number;
    Commission?: number;
    Swap?: number;
    SL?: number;
    TP?: number;
    NetPL?: number;
    PipPL?: number;
    Side: OrderSide;
    Type: OrderTypes;
    Status: string;
    Time: number;
    Comment: string;
    ExpirationType: OrderExpirationType;
    ExpirationDate?: number;
}

export interface MT5PlaceOrder {
    Symbol: string;
    Size: number;
    Price: number;
    SL: number;
    TP: number;
    Side: OrderSide;
    Type: OrderTypes;
    Comment: string;
    FillPolicy: OrderFillPolicy;
    ExpirationType: OrderExpirationType;
    ExpirationDate: number;
}

export interface MT5EditOrder {
    Ticket: any;
    Symbol: string;
    Size: number;
    Price: number;
    SL: number;
    TP: number;
    Side: OrderSide;
    Type: OrderTypes;
    Comment: string;
    ExpirationType: OrderExpirationType;
    ExpirationDate: number;
}

export interface MT5Position {
    Symbol: string;
    Size: number;
    Price: number;
    CurrentPrice?: number;
    NetPL?: number;
    PipPL?: number;
    Swap?: number;
    Commission?: number;
    Side: OrderSide;
}

export interface MT5Server {
    Broker: string;
    Name: string;
    IsDemo: boolean;
}

export interface MT5ConnectionData {
    ServerName: string;
    Login: number;
    Password: string;
}