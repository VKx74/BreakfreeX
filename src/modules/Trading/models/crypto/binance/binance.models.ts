import { IConnectionData, IOrder, OrderSide, OrderTypes } from "../../models";

export interface BinanceConnectionData extends IConnectionData {
    APIKey: string;
    APISecret: string;
}

export interface BinanceSpotTradingAccount {
    APIKey: string;
    FeeTier: number;
}

export interface BinanceFund {
    Coin: string;
    AvailableBalance: number;
    LockedBalance: number;
}

export interface BinanceOrder extends IOrder {
    Status: string;
    Time: number;
    ExecutedSize: number;
    ExecutedPrice: number;
    StopPrice: number;
    TIF: string;
    IcebergSize?: number;
}

export interface BinanceHistoricalOrder extends BinanceOrder {
}

export interface BinanceHistoricalTrade {
    Id: any;
    Symbol: string;
    Time: number;
    Commission: number;
    CommissionAsset: string;
    Price: number;
    Size: number;
    QuoteSize: number;
    Side: OrderSide;
}