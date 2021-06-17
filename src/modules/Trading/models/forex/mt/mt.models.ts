import { OrderSide, OrderTypes, OrderFillPolicy, OrderExpirationType, OrderTradeType, OrderPlacedFrom, RiskClass, RiskType, IConnectionData, IOrder, IOrderRisk, IPlaceOrder } from 'modules/Trading/models/models';
import { IBFTATrend } from '@app/services/algo.service';

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

export interface MTOrder extends IOrder, IOrderRisk {
    Commission?: number;
    Swap?: number;
    ProfitRate?: number;
    ContractSize?: number;
    PipPL?: number;
    Status: string;
    Time: number;
    VAR: number;
    Comment: string;
    ExpirationType?: OrderExpirationType;
    ExpirationDate?: number;
    Recommendations?: MTOrderRecommendation;
}

export interface MTHistoricalOrder extends MTOrder {
    CloseTime: number;
    ClosePrice: number;
}

export interface MTPlaceOrder extends IPlaceOrder {
    SL: number;
    TP: number;
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
    VAR: number;
    RiskClass: RiskClass;
    Recommendations?: MTOrderRecommendation;
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

export interface MTConnectionData extends IConnectionData {
    ServerName: string;
    Login: number;
    Password: string;
}

export interface MTCurrencyVarRisk {
    Currency: string;
    Risk: number;
    Type: MTCurrencyRiskType;
    OrdersCount: number;
}

export interface MTOrderValidationChecklistInput {
    Symbol: string;
    Timeframe?: number;
    LastPrice?: number;
    Side: OrderSide;
    Size: number;
    Price?: number;
    SL?: number;
    ExistingOrderID?: number;
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
    OrderRiskValue?: number;
    PositionRiskValue?: number;
    SpreadRiskValue?: number;
    FeedBrokerSpread?: number;
    FeedBrokerSpreadValue?: number;
    CorrelatedRiskValue?: number;
    cVar?: number;
    isSLReversed?: boolean;
    isSLToClose?: boolean;
    isSLToFare?: boolean;
}

export enum RTDTrendStrength {
    Strong = "Strong",
    Average = "Average",
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
    IsRTDOverhit: boolean;
    LocalRTDSpread: number;
    GlobalRTDSpread: number;
    LocalRTDTrendStrength: RTDTrendStrength;
    GlobalRTDTrendStrength: RTDTrendStrength;
    OrderTradeType: OrderTradeType;
    Timeframe: number;
}

export interface MTPositionRecommendation extends MTOrderRecommendation {
    FailedChecks: MTOrderChecklistItem[];
}

export interface MTPendingOrderRecommendation extends MTOrderRecommendation {
    FailedChecks: MTOrderChecklistItem[];
}

export interface MTMarketOrderRecommendation extends MTOrderRecommendation {
    FailedChecks: MTOrderChecklistItem[];
}