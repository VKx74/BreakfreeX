import { IConnectionData, OrderTypes } from "../../models";

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