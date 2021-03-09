import { IOrder, OrderSide, TimeInForce } from "../../models";

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

export interface BinanceFuturesPosition {
    CurrentPrice?: number;
    Size: number;
    Symbol: string;
    Price: number;
    Leverage: number;
    Margin: number;
    MaintMargin: number;
    PNL: number;
    Side: OrderSide;
}

export interface BinanceFuturesTradingAccount {
    APIKey: string;
    FeeTier: number;
    TotalInitialMargin: number;
    TotalMaintMargin: number;
    TotalMarginBalance: number;
    TotalOpenOrderInitialMargin: number;
    TotalPositionInitialMargin: number;
    TotalUnrealizedProfit: number;
    TotalWalletBalance: number;
    TotalCrossWalletBalance: number;
    TotalCrossUnPnl: number;
    AvailableBalance: number;
}

export interface BinanceFuturesHistoricalOrder extends IOrder {
    Status: string;
    Time: number;
    ExecutedSize: number;
    ExecutedPrice: number;
    TIF: string;
}

export interface BinanceFuturesOrder extends IOrder {
    Status: string;
    Time: number;
    ExecutedSize: number;
    ExecutedPrice: number;
    TIF: string;
}