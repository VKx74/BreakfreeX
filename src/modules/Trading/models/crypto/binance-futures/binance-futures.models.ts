import { IOrder, IOrderRisk, IPosition, OrderSide, OrderTypes, TimeInForce } from "../../models";
import { BinanceEnvironment } from "../shared/models.communication";

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

export interface BinanceFuturesPosition extends IPosition, IOrderRisk {
    CurrentPrice?: number;
    LiquidationPrice?: number;
    Leverage?: number;
    Margin?: number;
    MaintMargin?: number;
}

export interface BinanceFuturesTradingAccount {
    APIKey: string;
    FeeTier: number;
    BinanceEnvironment: BinanceEnvironment;
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

export interface BinanceFuturesOrder extends IOrder, IOrderRisk {
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
    SL?: number;
    TP?: number;
    StopPrice?: number;
    TimeInForce?: TimeInForce;
    ReduceOnly?: boolean;
}

export interface IBinanceEditOrderPrice {
    Ticket: any;
    Price?: number;
    SL?: number;
    TP?: number;
    StopPrice?: number;
}