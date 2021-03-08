import { IConnectionData, OrderTypes } from "../../models";

export interface BinanceConnectionData extends IConnectionData {
    APIKey: string;
    APISecret: string;
}

export interface BinanceTradingAccount {
    Account: string;
    Funds: BinanceFund[];
}

export interface BinanceFund {
    Coin: string;
    AvailableBalance: number;
    FreezedBalance: number;
}