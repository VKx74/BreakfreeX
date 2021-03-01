import { IConnectionData } from "../../models";

export interface BinanceFuturesConnectionData extends IConnectionData {
    APIKey: string;
}

export interface BinanceFuturesTradingAccount {
    Account: string;
}