import { OrderSide, OrderTypes, OrderFillPolicy, OrderExpirationType, OrderTradeType, OrderPlacedFrom, RiskClass, RiskType } from 'modules/Trading/models/models';
import { EOrderStatus } from 'modules/Trading/models/crypto/crypto.models';
import { IBFTATrend } from '@app/services/algo.service';

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
    VAR: number;
    Comment: string;
    ExpirationType?: OrderExpirationType;
    ExpirationDate?: number;
    Recommendations?: MTOrderRecommendation;
    RiskClass: RiskClass;
}

export interface MTHistoricalOrder extends MTOrder {
    CloseTime: number;
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
    Timeframe?: number;
    TradeType?: OrderTradeType;
    PlacedFrom?: OrderPlacedFrom;
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
    VAR: number;
    RiskClass: RiskClass;
}

export enum MTCurrencyRiskType {
    Actual = "Actual",
    Pending = "Pending"
}

export interface MTCurrencyRisk {
    Currency: string;
    Type: MTCurrencyRiskType;
    OrdersCount: number;
    Risk?: number;
    RiskPercentage?: number;
    Side: OrderSide;
    RiskClass: RiskClass;
    // PendingOrdersCount: number;
    // PendingRisk?: number;
    // PendingRiskPercentage?: number;
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

export interface MTCurrencyVarRisk {
    Currency: string;
    Risk: number;
    Type: MTCurrencyRiskType;
    OrdersCount: number;
}

export interface MTOrderValidationChecklistInput {
    Symbol: string;
    Side: OrderSide;
    Size: number;
    Price?: number;
    SL?: number;
}

export interface MTOrderValidationChecklist {
    GlobalRTD?: boolean;
    LocalRTD?: boolean;
    Levels?: boolean;

    GlobalRTDValue?: IBFTATrend;
    LocalRTDValue?: IBFTATrend;
    LocalRTDSpread?: number;
    GlobalRTDSpread?: number;
    LocalRTDTrendStrength?: RTDTrendStrength;
    GlobalRTDTrendStrength?: RTDTrendStrength;
    RiskValue?: number;
    SpreadRiskValue?: number;
    CorrelatedRiskValue?: number;
}

export enum RTDTrendStrength {
    Strong = "Strong",
    Medium = "Medium",
    Low = "Low",
    Weak = "Weak"
}

export enum MTOrderRecommendationType {
    Active,
    Pending
}

export interface MTOrderChecklistItem {
    Issue: string;
    Recommendation: string;
    RiskClass: RiskClass;
    RiskType: RiskType;
}

export interface MTOrderRecommendation {
    Type: MTOrderRecommendationType;
    GlobalRTD: boolean;
    LocalRTD: boolean;
    GlobalRTDValue: IBFTATrend;
    LocalRTDValue: IBFTATrend;
    LocalRTDSpread: number;
    GlobalRTDSpread: number;
    LocalRTDTrendStrength: RTDTrendStrength;
    GlobalRTDTrendStrength: RTDTrendStrength;
    OrderTradeType: OrderTradeType;
    Timeframe: number;
}

export interface MTPendingOrderRecommendation extends MTOrderRecommendation {
    FailedChecks: MTOrderChecklistItem[];
}

export interface MTMarketOrderRecommendation extends MTOrderRecommendation {
    FailedChecks: MTOrderChecklistItem[];
}