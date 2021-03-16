export interface IBinanceSymbolBasedData {
    Symbol: string;
}

export interface IBinanceLoginData {
    ApiKey: string;
    ApiSecret: string;
}

export interface IBinancePrice {
    Price: number;
    Symbol: string;
}

export interface IBinanceGetOrdersData extends IBinanceSymbolBasedData {
    From: number;
    To: number;
}

export interface IBinanceGetTradesData extends IBinanceSymbolBasedData {
    From: number;
    To: number;
}

export interface IBinanceCloseOrderData extends IBinanceSymbolBasedData {
    OrderId: any;
}

export interface IBinanceOrderInfoData extends IBinanceSymbolBasedData {
    OrderId: any;
}

export interface IBinanceSubscriptionRequestData extends IBinanceSymbolBasedData {
    Subscribe: boolean;
}

export interface IBinanceSymbolData {
    Type: string;
    Name: string;
    BaseAsset: string;
    QuoteAsset: string;
    ContractSize?: number;
    PricePrecision?: number;
    Pair: string;
}

export interface IBinanceMarketPrice {
    MarkPrice: number;
    Symbol: string;
}

export interface IBinanceMarketTradeHistory {
    quoteQty: number;
    qty: number;
    Price: number;
    Time: any;
}

export interface IBinanceBookPrice {
    Symbol: string;
    bidPrice: number;
    bidQty: number;
    askPrice: number;
    askQty: number;
    time: number;
}

export enum BinanceEnvironment {
    Real = "Real",
    Testnet = "Testnet"
}