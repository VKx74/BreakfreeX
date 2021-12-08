import { CurrencyRiskType, IConnectionData, IOrder, IOrderRisk, OrderSide, OrderTypes, RiskClass } from "../../models";
import { BinanceEnvironment } from "../shared/models.communication";

export interface BinanceConnectionData extends IConnectionData {
    APIKey: string;
    APISecret: string;
    BinanceEnvironment: BinanceEnvironment;
}

export interface BinanceSpotTradingAccount {
    APIKey: string;
    FeeTier: number;
    BinanceEnvironment: BinanceEnvironment;
}

export interface BinanceFund {
    Coin: string;
    AvailableBalance: number;
    LockedBalance: number;
}

export interface BinanceOrder extends IOrder, IOrderRisk {
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

export interface CoinRisk {
    Coin: string;
    RelatedCoin: string;
    Type: CurrencyRiskType;
    OrdersCount: number;
    Risk?: number;
    RiskPercentage?: number;
    Side: OrderSide;
    RiskClass: RiskClass;
}