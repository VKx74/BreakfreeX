import { BrokerRequestMessageBase, BrokerResponseMessageBase } from "../../communication";

export enum BinanceFutureMessageType {
    LoginFuturesUsdt = "LoginFuturesUsdt",
    AccountUpdate = "AccountUpdate",
}

export interface IBinanceFutureLoginData {
    ApiKey: string;
    ApiSecret: string;
}

export interface IBinanceFutureSymbolData {
    Type: string;
    Name: string;
    BaseAsset: string;
    QuoteAsset: string;
    QuoteAssetPrecision: number;
    BaseCommissionPrecision: number;
    QuoteCommissionPrecision: number;
    IceBergAllowed: boolean;
    IsSpotTradingAllowed: boolean;
    IsMarginTradingAllowed: boolean;
    OCOAllowed: boolean;
    Pair: string;
    DeliveryDate: string;
    ListingDate: string;
}

export interface IBinanceFutureAsset {
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

export interface IBinanceFuturePosition {
    MaxNotionalValue: number;
    MarginType: string;
    IsAutoAddMargin: boolean;
    IsolatedMargin: number;
    LiquidationPrice: number;
    MarkPrice: number;
    positionAmt: number;
    Symbol: string;
    EntryPrice: number;
    Leverage: number;
    UnrealizedProfit: number;
    PositionSide: string;
}

export interface IBinanceFutureAccountUpdatedData {
    CanDeposit: true;
    CanTrade: true;
    CanWithdraw: true;
    FeeTier: number;
    MaxWithdrawAmount: number;
    TotalInitialMargin: number;
    TotalMaintMargin: number;
    TotalMarginBalance: number;
    TotalOpenOrderInitialMargin: number;
    TotalPositionInitialMargin: number;
    TotalUnrealizedProfit: number;
    TotalWalletBalance: number;
    TotalCrossWalletBalance: number;
    TotalCrossUnPnl: number;
    AvailableBalance: number;
    updateTime: number;
    Assets: IBinanceFutureAsset[];
    Positions: IBinanceFuturePosition[];
}

// Requests
export class BinanceFutureLoginRequest extends BrokerRequestMessageBase {
    public Data: IBinanceFutureLoginData;

    constructor() {
        super(BinanceFutureMessageType.LoginFuturesUsdt);
    }
}

// Responses
export class BinanceFutureLoginResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureSymbolData[];
}

export class BinanceFutureAccountUpdateResponse extends BrokerResponseMessageBase {
    public Data: IBinanceFutureAccountUpdatedData;
}