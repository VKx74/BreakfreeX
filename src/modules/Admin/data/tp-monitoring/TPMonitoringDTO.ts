import { Grouping, Periods } from "./TPMonitoringData";

export class MTAccountDTO {
    public number: number;
    public name: string;
    public mtPlatform: string;
}

export class UserMTAccounts {
    public userId: string;
    public name: string;
    public email: string;
    public accounts: Array<MTAccountDTO>;
}

export class UserOrdersResponse {
    public period: Periods;
    public grouping: Grouping;
    public ordersHistory: { [key: number]: number };
}

export class UserBalanceResponse {
    public period: Periods;
    public balanceHistory: { [key: number]: number };
}

export class Trade {
    public userName: string;
    public ticket: string;
    public openTime: number;
    public type: string;
    public size: string;
    public symbol: string;
    public openPrice: number;
    public sl: string;
    public tp: string;
    public closeTime: number;
    public closePrice: number;
    public commision: string;
    public swap: string;
    public profit: string;
    public setupType: string;
    public timeFrame: number;    
}

export class MTAccountPerformanceData {
    number: number;
    type: string;
    currency: string;
    age: string;

    balance: number;
    profit: number;
    totalTrades: number;
    totalInstruments: number;

    profitability: string;
    avgLoss: number;
    avgWin: number;
    avgTradeLength: string;
}

export class GeneralData {
    generalDistribution: DistributionData;
    generalTradingData: TradingData;
    algoTradingData: AlgoTradingData;
    tradedVolume: { [key: number]: number };
}

export class DistributionData {
    accountCurrencies: { [key: string]: number };
    accountTypes: { [key: string]: number };
    brokers: { [key: string]: number };
    countries: { [key: string]: number };
}

export class TradingData {
    bestTrades: Array<TradeSimpleData>;
    worstTrades: Array<TradeSimpleData>;
    topWinners: Array<TraderData>;
    topLosers: Array<TraderData>;
}

export class AlgoTradingData {
    algoTradesByTF: { [key: string]: number };
    algoTradesByType: { [key: string]: number };
    algoTradesByResult: { [key: string]: number };
}

export class TradeSimpleData {
    ticket: number;
    userName: string;
    symbol: string;
    lots: number;
    profit: number;
}

export class TraderData {
    userName: string;
    brokerName: string;
    totalProfit: number;
}