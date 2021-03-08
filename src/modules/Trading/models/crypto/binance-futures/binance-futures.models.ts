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
    LiquidationPrice: number;
    MarkPrice: number;
    PositionAmt: number;
    Symbol: string;
    EntryPrice: number;
    Leverage: number;
    UnrealizedProfit: number;
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