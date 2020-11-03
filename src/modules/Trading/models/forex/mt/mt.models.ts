import { OrderSide, OrderTypes, OrderFillPolicy, OrderExpirationType } from 'modules/Trading/models/models';
import { EOrderStatus } from 'modules/Trading/models/crypto/crypto.models';

export enum MTStatus {
    Connected,
    Pending,
    NoConnection
}

export interface MTTradingAccount {
    Account: string;
    Currency: string;
    CompanyName: string;
    Balance: number;
    Margin: number;
    FreeMargin: number;
    Pl: number;
    Equity: number;
    Risk?: number;
    RiskPercentage?: number;
}

export interface MTOrder {
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
    ProfitRate?: number;
    ContractSize?: number;
    Risk?: number;
    RiskPercentage?: number;
    PipPL?: number;
    Side: OrderSide;
    Type: OrderTypes;
    Status: string;
    Time: number;
    Comment: string;
    ExpirationType?: OrderExpirationType;
    ExpirationDate?: number;
}

export interface MTPlaceOrder {
    Symbol: string;
    Size: number;
    Price: number;
    SL: number;
    TP: number;
    Side: OrderSide;
    Type: OrderTypes;
    Comment: string;
    FillPolicy?: OrderFillPolicy;
    ExpirationType?: OrderExpirationType;
    ExpirationDate: number;
}

export interface MTEditOrder {
    Ticket: any;
    Symbol: string;
    Size: number;
    Price: number;
    SL: number;
    TP: number;
    Side: OrderSide;
    Type: OrderTypes;
    Comment: string;
    ExpirationType?: OrderExpirationType;
    ExpirationDate: number;
}

export interface MTEditOrderPrice {
    Ticket: any;
    Price: number;
    SL: number;
    TP: number;
}

export interface MTPosition {
    Symbol: string;
    Size: number;
    Price: number;
    CurrentPrice?: number;
    NetPL?: number;
    PipPL?: number;
    Swap?: number;
    Commission?: number;
    Risk?: number;
    RiskPercentage?: number;
    Side: OrderSide;
}

export interface MTCurrencyRisk {
    Currency: string;
    OrdersCount: number;
    Risk?: number;
    RiskPercentage?: number;
}

export interface MTServer {
    Broker: string;
    Name: string;
    IsDemo: boolean;
}

export interface MTConnectionData {
    ServerName: string;
    Login: number;
    Password: string;
    Linker?: string;
}