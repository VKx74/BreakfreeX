import {IInstrument} from "@app/models/common/instrument";

export enum HistoryRequestKind {
    DateRange = 0,
    BarsCount = 1,
    BarsBack = 2
}

export enum OrderAction {
    Buy = 0,
    Sell = 1,
}


export enum OrderKind {
    Unknown = 0,
    Market = 1,
    Stop = 2,
    Limit = 3,
    StopLimit = 4
}


export interface IHistoryParameters {
    kind: HistoryRequestKind;
    granularity: number;
    barsCount?: number;
    from?: number;
    to?: number;
}

export interface IWallet {
    currency: string;
    currentAmount: number;
    initialAmount: number;
}

export interface IBacktestScriptProperties {
    [propertyName: string]: any;
}

export interface IRunBacktestRequestDTO {
    userId: string;
    scriptName: string;
    symbol: string;
    exchange: string;
    datafeed: string;
    email: string;
    phone: string;
    historyParameters: IHistoryParameters;

    tradingParameters?: any;
    properties?: IBacktestScriptProperties;
    wallets: IWallet[];
}

export interface IRunBacktestResponseDTO {
    runningId: string;
    scriptName: string;
    startTimestamp: string;
}

export interface ISignal {
    action: OrderAction;
    kind: OrderKind;
    instrument: {
        symbol: string;
        datafeed: string;
        exchange: string;
        tickSize: number;
        pointValue: number;
        pipValue: number;
        digits: number;
    };
    quantity: number;
    price: number;
    timestamp: string;
    performancePersent?: number;
    performanceValue?: number;
}

export interface IRunningBacktestMetadata {
    runningId: string;
    scriptName: string;
    startTimestamp: number;
}

export interface IBacktestSignals {
    [symbol: string]: ISignal[];
}

export interface IOrder {
    action: OrderAction;
    kind: OrderKind;
    quantity: number;
    averageFillPrice: number;

    timestamp: string;
    instrument: {
        symbol: string;
        datafeed: string;
        exchange: string;
        tickSize: number;
        pointValue: number;
        pipValue: number;
        digits: number;
    };
}

export interface IBacktestOrders {
    [symbol: string]: IOrder[];
}

export interface IBacktestResultDTO {
    id: string;
    instrument: IInstrument;
    signals: IBacktestSignals;
    orders: IBacktestOrders;
    historyParameters: IHistoryParameters;
    wallets: IWallet[];
}

export interface IStopBacktestRequestDTO {
    runningId: string;
    userId: string;
}
