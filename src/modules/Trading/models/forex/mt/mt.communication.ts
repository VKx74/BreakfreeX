export enum EMTMessageType {
    GetBrokers = "GetBrokers",
    Auth = "Auth",
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

export abstract class MTRequestMessageBase {
    private static counter = 1;

    public MessageId: string;
    public Type: EMTMessageType;

    constructor(type: EMTMessageType) {
        this.Type = type;
        this.MessageId = `${new Date().getTime()}_${MTRequestMessageBase.counter++}`;
    }
}

export abstract class MTResponseMessageBase {
    public MessageId: string;
    public IsSuccess: boolean;
    public Data?: any;
    public ErrorMessage?: string;
    public Type?: string;
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

export interface IMTAuth {
    Token: string;
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

export class MTGetServersResponse extends MTResponseMessageBase {
    public Data: IMTServer[];
}

export class MTQuoteResponse extends MTResponseMessageBase {
    public Data: IMTQuoteData;
}

export class MTSymbolTradeInfoResponse extends MTResponseMessageBase {
    public Data: IMTSymbolTradeInfoData;
}

export class MTAccountUpdateResponse extends MTResponseMessageBase {
    public Data: IMTAccountUpdatedData;
}

export class MTOrdersUpdateResponse extends MTResponseMessageBase {
    public Data: IMTOrderData[];
}

export class MTLoginResponse extends MTResponseMessageBase {
    public Data: IMTSymbolData[];
}

export class MTPlaceOrderResponse extends MTResponseMessageBase {
    public Data: IMTOrderData;
}

export class MTEditOrderResponse extends MTResponseMessageBase {
    public Data: IMTOrderData;
}

export class MTCloseOrderResponse extends MTResponseMessageBase {
    public Data: IMTOrderData;
}

export class MTGetOrderHistoryResponse extends MTResponseMessageBase {
    public Data: IMTOrderData[];
}

// Requests

export class MTLoginRequest extends MTRequestMessageBase {
    public Data: IMTLoginData;

    constructor() {
        super(EMTMessageType.Login);
    }
}

export class MTAuthRequest extends MTRequestMessageBase {
    public Data: IMTAuth;

    constructor() {
        super(EMTMessageType.Auth);
    }
}

export class MTGetServersRequest extends MTRequestMessageBase {
    constructor() {
        super(EMTMessageType.GetBrokers);
    }
}

export class MTLogoutRequest extends MTRequestMessageBase {
    constructor() {
        super(EMTMessageType.Logout);
    }
}

export class SubscribeQuote extends MTRequestMessageBase {
    public Data: IMTSubscriptionData;

    constructor() {
        super(EMTMessageType.SubscribeQuote);
    }
}

export class GetQuote extends MTRequestMessageBase {
    public Data: IMTGetQuoteDate;

    constructor() {
        super(EMTMessageType.GetQuote);
    }
}

export class GetSymbolTradeInfo extends MTRequestMessageBase {
    public Data: string;

    constructor() {
        super(EMTMessageType.SymbolTradeInfo);
    }
}

export class MTPlaceOrderRequest extends MTRequestMessageBase {
    public Data: IMTPlaceOrderData;

    constructor() {
        super(EMTMessageType.PlaceOrder);
    }
}

export class MTCloseOrderRequest extends MTRequestMessageBase {
    public Data: IMTCloseOrderData;

    constructor() {
        super(EMTMessageType.CloseOrder);
    }
}

export class MTEditOrderRequest extends MTRequestMessageBase {
    public Data: IMTEditOrderData;

    constructor() {
        super(EMTMessageType.EditOrder);
    }
}

export class MTGetOrderHistoryRequest extends MTRequestMessageBase {
    public Data: IMTDateRangeData;

    constructor() {
        super(EMTMessageType.OrdersHistory);
    }
}