import { BrokerRequestMessageBase, BrokerResponseMessageBase } from "../../communication";

export enum MTMessageType {
    GetBrokers = "GetBrokers",
    Login = "Login",
    Logout = "Logout",
    SubscribeQuote = "SubscribeQuote",
    GetQuote = "GetQuote",
    SymbolTradeInfo = "SymbolTradeInfo",
    OrdersHistory = "OrdersHistory",
    Quote = "Quote",
    AccountUpdate = "AccountUpdate",
    OrdersUpdate = "OrdersUpdate",
    PlaceOrder = "PlaceOrder",
    CloseOrder = "CloseOrder",
    EditOrder = "EditOrder",
}

export interface IMTServer {
    BrokerName: string;
    Servers: string[];
}

export interface IMTSymbolData {
    Digits: number;
    ContractSize?: number;
    Name: string;
    CalculatioType: string;
    ProfitMode?: string;
    Description: string;
}

export interface IMTLoginData {
    User: number;
    Password: string;
    ServerName: string;
}

export interface IMTSubscriptionData {
    Subscribe: boolean;
    Symbol: string;
}


export interface IMTGetQuoteDate {
    Symbol: string;
}

export interface IMTSymbolTradeInfoData {
    Symbol: string;
    ContractSize: number;
    CVaR: number;
    Rate: number;
    Bid: number;
    Ask: number;
}

export interface IMTQuoteData {
    Symbol: string;
    Bid: number;
    Ask: number;
    Last: number;
    Volume: number;
    Time: number;
}

export interface IMTAccountUpdatedData {
    Currency: string;
    CompanyName: string;
    Profit: number;
    Margin: number;
    FreeMargin: number;
    Equity: number;
    Balance: number;
}

export interface IMTOrderData {
    Ticket: number;
    Profit: number;
    Swap: number;
    Commission: number;
    CurrentPrice: number;
    CloseTime: number;
    CloseVolume: number;
    OpenPrice: number;
    OpenTime: number;
    Lots: number;
    ContractSize: number;
    ExpertId: number;
    Side: string;
    Type: string;
    Symbol: string;
    Comment: string;
    State: string;
    StopLoss: number;
    VarRisk?: number;
    TakeProfit: number;
    Digits: number;
    ProfitRate: number;
    StopLimitPrice: number;
    FillPolicy: string;
    ExpirationType: string;
    ExpirationDate: number;
    ClosePrice?: number;
}

export interface IMTPlaceOrderData {
    Symbol: string;
    Lots: number;
    Price?: number;
    Side: string;
    Type: string;
    StopLoss?: number;
    TakeProfit?: number;
    Deviation?: number;
    Comment: string;
    ExpertID?: number;
    FillPolicy?: string;
    StopLimit?: number;
    ExpirationType?: string;
    ExpirationDate?: number;
    CloseByTicket?: number;
    Timeframe: number;
    TradeType: string;
    PlacedFrom: string;
}

export interface IMTCloseOrderData {
    Ticket: number;
    Symbol: string;
    Price: number;
    Lots: number;
    Side: string;
    Type: string;
    Deviation?: number;
    FillPolicy?: string;
    ExpertID?: number;
    Comment: string;
    CloseByTicket?: number;
}

export interface IMTEditOrderData {
    Ticket: number;
    Symbol: string;
    Lots: number;
    Price?: number;
    Side: string;
    Type: string;
    StopLoss?: number;
    TakeProfit?: number;
    ExpertId?: number;
    StopLimitPrice?: number;
    ExpirationType?: string;
    ExpirationDate?: number;
    Comment: string;
}

export interface IMTDateRangeData {
    From: number;
    To: number;
}

// Responses

export class MTGetServersResponse extends BrokerResponseMessageBase {
    public Data: IMTServer[];
}

export class MTQuoteResponse extends BrokerResponseMessageBase {
    public Data: IMTQuoteData;
}

export class MTSymbolTradeInfoResponse extends BrokerResponseMessageBase {
    public Data: IMTSymbolTradeInfoData;
}

export class MTAccountUpdateResponse extends BrokerResponseMessageBase {
    public Data: IMTAccountUpdatedData;
}

export class MTOrdersUpdateResponse extends BrokerResponseMessageBase {
    public Data: IMTOrderData[];
}

export class MTLoginResponse extends BrokerResponseMessageBase {
    public Data: IMTSymbolData[];
}

export class MTPlaceOrderResponse extends BrokerResponseMessageBase {
    public Data: IMTOrderData;
}

export class MTEditOrderResponse extends BrokerResponseMessageBase {
    public Data: IMTOrderData;
}

export class MTCloseOrderResponse extends BrokerResponseMessageBase {
    public Data: IMTOrderData;
}

export class MTGetOrderHistoryResponse extends BrokerResponseMessageBase {
    public Data: IMTOrderData[];
}

// Requests

export class MTLoginRequest extends BrokerRequestMessageBase {
    public Data: IMTLoginData;

    constructor() {
        super(MTMessageType.Login);
    }
}

export class MTGetServersRequest extends BrokerRequestMessageBase {
    constructor() {
        super(MTMessageType.GetBrokers);
    }
}

export class MTLogoutRequest extends BrokerRequestMessageBase {
    constructor() {
        super(MTMessageType.Logout);
    }
}

export class SubscribeQuote extends BrokerRequestMessageBase {
    public Data: IMTSubscriptionData;

    constructor() {
        super(MTMessageType.SubscribeQuote);
    }
}

export class GetQuote extends BrokerRequestMessageBase {
    public Data: IMTGetQuoteDate;

    constructor() {
        super(MTMessageType.GetQuote);
    }
}

export class GetSymbolTradeInfo extends BrokerRequestMessageBase {
    public Data: string;

    constructor() {
        super(MTMessageType.SymbolTradeInfo);
    }
}

export class MTPlaceOrderRequest extends BrokerRequestMessageBase {
    public Data: IMTPlaceOrderData;

    constructor() {
        super(MTMessageType.PlaceOrder);
    }
}

export class MTCloseOrderRequest extends BrokerRequestMessageBase {
    public Data: IMTCloseOrderData;

    constructor() {
        super(MTMessageType.CloseOrder);
    }
}

export class MTEditOrderRequest extends BrokerRequestMessageBase {
    public Data: IMTEditOrderData;

    constructor() {
        super(MTMessageType.EditOrder);
    }
}

export class MTGetOrderHistoryRequest extends BrokerRequestMessageBase {
    public Data: IMTDateRangeData;

    constructor() {
        super(MTMessageType.OrdersHistory);
    }
}