import { IOrder, IPosition, OrderSide, OrderTypes, TimeInForce } from "../../models";

export interface BinanceFuturesAsset {
    Asset: string;
    InitialMargin: number;
    MaintMargin: number;
    MarginBalance: number;
    MaxWithdrawAmount: number;
    OpenOrderInitialMargin: number;
    PositionInitialMargin: number;
    UnrealizedProfit: number;
    WalletBalance: number;
    CrossWalletBalance: number;
    CrossUnPnl: number;
    AvailableBalance: number;
}

export interface BinanceFuturesPosition extends IPosition {
    CurrentPrice?: number;
    Leverage?: number;
    Margin?: number;
    MaintMargin?: number;
}

export interface BinanceFuturesTradingAccount {
    APIKey: string;
    FeeTier: number;
}

export interface BinanceFuturesHistoricalTrade {
    Id: any;
    Symbol: string;
    Time: number;
    Commission: number;
    CommissionAsset: string;
    Price: number;
    Size: number;
    QuoteSize: number;
    PNL: number;
    Side: OrderSide;
}

export interface BinanceFuturesHistoricalOrder extends IOrder {
    Status: string;
    Time: number;
    ExecutedSize: number;
    ExecutedPrice: number;
    StopPrice: number;
    TIF: string;
}

export interface BinanceFuturesOrder extends IOrder {
    Status: string;
    Time: number;
    ExecutedSize: number;
    ExecutedPrice: number;
    StopPrice: number;
    TIF: string;
}

export interface IBinanceFuturesPlaceOrderData {
    Side: OrderSide;
    Size: number;
    Symbol: string;
    Type: OrderTypes;
    Price?: number;
    StopPrice?: number;
    TimeInForce?: TimeInForce;
}