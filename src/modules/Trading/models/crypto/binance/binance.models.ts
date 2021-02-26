import { IConnectionData } from "../../models";

export interface BinanceConnectionData extends IConnectionData {
    APIKey: string;
}

export interface BinanceTradingAccount {
    Account: string;
}

export interface BinanceFund {
    Account: string;
}