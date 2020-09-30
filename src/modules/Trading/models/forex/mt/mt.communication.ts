export enum EMT5MessageType {
    GetBrokers = "GetBrokers",
    Auth = "Auth",
    Login = "Login",
    Logout = "Logout",
    SubscribeQuote = "SubscribeQuote",
    GetQuote = "GetQuote",
    OrdersHistory = "OrdersHistory",
    Quote = "Quote",
    AccountUpdate = "AccountUpdate",
    OrdersUpdate = "OrdersUpdate",
    PlaceOrder = "PlaceOrder",
    CloseOrder = "CloseOrder",
    EditOrder = "EditOrder",
}

export abstract class MT5RequestMessageBase {
    private static counter = 1;

    public MessageId: string;
    public Type: EMT5MessageType;

    constructor(type: EMT5MessageType) {
        this.Type = type;
        this.MessageId = `${new Date().getTime()}_${MT5RequestMessageBase.counter++}`;
    }
}

export abstract class MT5ResponseMessageBase {
    public MessageId: string;
    public IsSuccess: boolean;
    public Data?: any;
    public ErrorMessage?: string;
    public Type?: string;
}

export interface IMT5Server {
    BrokerName: string;
    Servers: string[];
}

export interface IMT5SymbolData {
    Digits: number;
    Name: string;
    CalculatioType: string;
    Description: string;
}

export interface IMT5LoginData {
    User: number;
    Password: string;
    ServerName: string;
}

export interface IMT5Auth {
    Token: string;
}

export interface IMT5SubscriptionData {
    Subscribe: boolean;
    Symbol: string;
}


export interface IMT5GetQuoteDate {
    Symbol: string;
}

export interface IMT5QuoteData {
    Symbol: string;
    Bid: number;
    Ask: number;
    Last: number;
    Volume: number;
    Time: number;
}

export interface IMT5AccountUpdatedData {
    Currency: string;
    CompanyName: string;
    Profit: number;
    Margin: number;
    FreeMargin: number;
    Equity: number;
    Balance: number;
}

export interface IMT5OrderData {
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
    TakeProfit: number;
    Digits: number;
    ProfitRate: number;
    StopLimitPrice: number;
    FillPolicy: string;
    ExpirationType: string;
    ExpirationDate: number;
}

export interface IMT5PlaceOrderData {
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
    FillPolicy: string;
    StopLimit?: number;
    ExpirationType: string;
    ExpirationDate?: number;
    CloseByTicket?: number;
}

export interface IMT5CloseOrderData {
    Ticket: number;
    Symbol: string;
    Price: number;
    Lots: number;
    Side: string;
    Type: string;
    Deviation?: number;
    FillPolicy: string;
    ExpertID?: number;
    Comment: string;
    CloseByTicket?: number;
}

export interface IMT5EditOrderData {
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
    ExpirationType: string;
    ExpirationDate?: number;
    Comment: string;
}

export interface IMT5DateRangeData {
    From: number;
    To: number;
}

// Responses

export class MT5GetServersResponse extends MT5ResponseMessageBase {
    public Data: IMT5Server[];
}

export class MT5QuoteResponse extends MT5ResponseMessageBase {
    public Data: IMT5QuoteData;
}

export class MT5AccountUpdateResponse extends MT5ResponseMessageBase {
    public Data: IMT5AccountUpdatedData;
}

export class MT5OrdersUpdateResponse extends MT5ResponseMessageBase {
    public Data: IMT5OrderData[];
}

export class MT5LoginResponse extends MT5ResponseMessageBase {
    public Data: IMT5SymbolData[];
}

export class MT5PlaceOrderResponse extends MT5ResponseMessageBase {
    public Data: IMT5OrderData;
}

export class MT5EditOrderResponse extends MT5ResponseMessageBase {
    public Data: IMT5OrderData;
}

export class MT5CloseOrderResponse extends MT5ResponseMessageBase {
    public Data: IMT5OrderData;
}

export class MT5GetOrderHistoryResponse extends MT5ResponseMessageBase {
    public Data: IMT5OrderData[];
}

// Requests

export class MT5LoginRequest extends MT5RequestMessageBase {
    public Data: IMT5LoginData;

    constructor() {
        super(EMT5MessageType.Login);
    }
}

export class MT5AuthRequest extends MT5RequestMessageBase {
    public Data: IMT5Auth;

    constructor() {
        super(EMT5MessageType.Auth);
    }
}

export class MT5GetServersRequest extends MT5RequestMessageBase {
    constructor() {
        super(EMT5MessageType.GetBrokers);
    }
}

export class MT5LogoutRequest extends MT5RequestMessageBase {
    constructor() {
        super(EMT5MessageType.Logout);
    }
}

export class SubscribeQuote extends MT5RequestMessageBase {
    public Data: IMT5SubscriptionData;

    constructor() {
        super(EMT5MessageType.SubscribeQuote);
    }
}

export class GetQuote extends MT5RequestMessageBase {
    public Data: IMT5GetQuoteDate;

    constructor() {
        super(EMT5MessageType.GetQuote);
    }
}

export class MT5PlaceOrderRequest extends MT5RequestMessageBase {
    public Data: IMT5PlaceOrderData;

    constructor() {
        super(EMT5MessageType.PlaceOrder);
    }
}

export class MT5CloseOrderRequest extends MT5RequestMessageBase {
    public Data: IMT5CloseOrderData;

    constructor() {
        super(EMT5MessageType.CloseOrder);
    }
}

export class MT5EditOrderRequest extends MT5RequestMessageBase {
    public Data: IMT5EditOrderData;

    constructor() {
        super(EMT5MessageType.EditOrder);
    }
}

export class MT5GetOrderHistoryRequest extends MT5RequestMessageBase {
    public Data: IMT5DateRangeData;

    constructor() {
        super(EMT5MessageType.OrdersHistory);
    }
}