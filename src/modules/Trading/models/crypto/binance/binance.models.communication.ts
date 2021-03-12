import { BrokerRequestMessageBase, BrokerResponseMessageBase } from "../../communication";
import { IBinanceOrderBookItem } from "../binance-futures/binance-futures.communication";
import { IBinanceBookPrice, IBinanceCloseOrderData, IBinanceGetOrdersData, IBinanceGetTradesData, IBinanceLoginData, IBinanceMarketPrice, IBinanceMarketTradeHistory, IBinanceOrderInfoData, IBinanceSubscriptionRequestData, IBinanceSymbolBasedData, IBinanceSymbolData } from "../shared/models.communication";

export enum BinanceSpotCoinMessageType {
    LoginSpot = "LoginSpot",
    SpotOrdersHistory = "SpotOrdersHistory",
    SpotSymbolTradeHistory = "SpotSymbolTradeHistory",
    GetSpotBookPrice = "GetSpotBookPrice",
    SubscribeSpotQuote = "SubscribeSpotQuote",
    SubscribeSpotBookTicker = "SubscribeSpotBookTicker",
    SpotOpenOrders = "SpotOpenOrders",
    SpotSymbolMyTrades = "SpotSymbolMyTrades",
    CloseSpotOrder = "CloseSpotOrder",
    SpotSymbolOrderInfo = "SpotSymbolOrderInfo",
    PlaceSpotOrder = "PlaceSpotOrder",
    SubscribeSpotMarkPrice = "SubscribeSpotMarkPrice"
}

export interface IBinanceSpotHistoricalOrder {
    Symbol: string;
    OrderId: number;
    OrderListId: number;
    origClientOrderId: string;
    ClientOrderId: string;
    Price: number;
    origQty: number;
    executedQty: number;
    cummulativeQuoteQty: number;
    origQuoteOrderQty: number;
    Status: string;
    TimeInForce: string;
    Type: string;
    Side: string;
    StopPrice: number;
    icebergQty: number;
    time: number;
    UpdateTime: number;
    IsWorking: boolean;
    QuantityRemaining: number;
    AverageFillPrice?: any;
}

export interface IBinanceSpotOrderHistoryResponseData {
    Type: string;
    Orders: IBinanceSpotHistoricalOrder[];
}

export interface IBinanceSpotTrade {
}

export interface IBinanceSpotTradeHistoryResponseData {
    Type: string;
    Trades: IBinanceSpotTrade[];
}

export interface IBinanceSpotMarketTradeResponseData {
    Type: string;
    History: IBinanceMarketTradeHistory[];
}

export interface IBinanceSpotBookPriceResponseData {
    Type: string;
    BookPrice: IBinanceBookPrice;
}

export interface IBinanceSpotOrder {
    Symbol: string;
    OrderId: number;
    OrderListId: number;
    origClientOrderId: string;
    ClientOrderId: string;
    Price: number;
    origQty: number;
    executedQty: number;
    cummulativeQuoteQty: number;
    origQuoteOrderQty: number;
    Status: string;
    TimeInForce: string;
    Type: string;
    Side: string;
    StopPrice: number;
    icebergQty: number;
    time: number;
    UpdateTime: number;
    IsWorking: boolean;
    QuantityRemaining: number;
    AverageFillPrice?: any;
}

export interface IBinanceSpotWalletBalance {
    Asset: string;
    Free: number;
    Locked: number;
    Total: number;
}

export interface IBinanceSpotAccountInfoData {
    MakerCommission: number;
    TakerCommission: number;
    BuyerCommission: number;
    SellerCommission: number;
    CanTrade: boolean;
    CanWithdraw: boolean;
    CanDeposit: boolean;
    UpdateTime: number;
    AccountType: string;
    Permissions: string[];
    Balances: IBinanceSpotWalletBalance[];
}

export interface IBinanceSpotOpenOrderResponseData {
    Type: string;
    Orders: IBinanceSpotOrder[];
}

export interface IBinanceSpotOrderUpdateData {

}

export interface IBinanceSpotOrderUpdate {
    UpdateData: IBinanceSpotOrderUpdateData;
    TransactionTime: number;
    Event: string;
    EventTime: number;
}

export interface IBinanceSpotAccountUpdateData {
}

export interface IBinanceSpotAccountUpdate {
    UpdateData: IBinanceSpotAccountUpdateData;
}


// --- Requests
// ------------
export class BinanceSpotLoginRequest extends BrokerRequestMessageBase {
    public Data: IBinanceLoginData;

    constructor() {
        super(BinanceSpotCoinMessageType.LoginSpot);
    }
}

export class BinanceSpotOrderHistoryRequest extends BrokerRequestMessageBase {
    public Data: IBinanceGetOrdersData;

    constructor() {
        super(BinanceSpotCoinMessageType.SpotOrdersHistory);
    }
}

export class BinanceSpotTradeHistoryRequest extends BrokerRequestMessageBase {
    public Data: IBinanceGetTradesData;

    constructor() {
        super(BinanceSpotCoinMessageType.SpotSymbolMyTrades);
    }
}

export class BinanceSpotMarketTradesRequest extends BrokerRequestMessageBase {
    public Data: IBinanceSymbolBasedData;

    constructor() {
        super(BinanceSpotCoinMessageType.SpotSymbolTradeHistory);
    }
}

export class BinanceSpotBookPriceRequest extends BrokerRequestMessageBase {
    public Data: IBinanceSymbolBasedData;

    constructor() {
        super(BinanceSpotCoinMessageType.GetSpotBookPrice);
    }
}

export class BinanceSpotSubscribeQuoteRequest extends BrokerRequestMessageBase {
    public Data: IBinanceSubscriptionRequestData;

    constructor() {
        super(BinanceSpotCoinMessageType.SubscribeSpotQuote);
    }
}

export class BinanceSpotSubscribeMarketPriceRequest extends BrokerRequestMessageBase {
    public Data: IBinanceSubscriptionRequestData;

    constructor() {
        super(BinanceSpotCoinMessageType.SubscribeSpotMarkPrice);
    }
}

export class BinanceSpotOpenOrdersRequest extends BrokerRequestMessageBase {
    constructor() {
        super(BinanceSpotCoinMessageType.SpotOpenOrders);
    }
}

export class BinanceSpotCloseOrderRequest extends BrokerRequestMessageBase {
    public Data: IBinanceCloseOrderData;

    constructor() {
        super(BinanceSpotCoinMessageType.CloseSpotOrder);
    }
}

export class BinanceSpotOrderInfoRequest extends BrokerRequestMessageBase {
    public Data: IBinanceOrderInfoData;

    constructor() {
        super(BinanceSpotCoinMessageType.SpotSymbolOrderInfo);
    }
}

export class BinanceSpotPlaceOrderRequest extends BrokerRequestMessageBase {
    public Data: any;

    constructor() {
        super(BinanceSpotCoinMessageType.PlaceSpotOrder);
    }
}

export class BinanceSpotSubscribeOrderBookRequest extends BrokerRequestMessageBase {
    public Data: IBinanceSubscriptionRequestData;

    constructor() {
        super(BinanceSpotCoinMessageType.SubscribeSpotBookTicker);
    }
}

// --- Responses
// -------------
export class BinanceSpotLoginResponse extends BrokerResponseMessageBase {
    public Data: IBinanceSymbolData[];
}

export class BinanceSpotOrderHistoryResponse extends BrokerResponseMessageBase {
    public Data: IBinanceSpotOrderHistoryResponseData;
}

export class BinanceSpotTradeHistoryResponse extends BrokerResponseMessageBase {
    public Data: IBinanceSpotTradeHistoryResponseData;
}

export class BinanceSpotMarketTradeResponse extends BrokerResponseMessageBase {
    public Data: IBinanceSpotMarketTradeResponseData;
}

export class BinanceSpotBookPriceResponse extends BrokerResponseMessageBase {
    public Data: IBinanceSpotBookPriceResponseData;
}

export class BinanceSpotOpenOrderResponse extends BrokerResponseMessageBase {
    public Data: IBinanceSpotOpenOrderResponseData;
}

export class BinanceSpotAccountInfoResponse extends BrokerResponseMessageBase {
    public Data: IBinanceSpotAccountInfoData;
}

export class BinanceSpotMarketPriceResponse extends BrokerResponseMessageBase {
    public Data: IBinanceMarketPrice;
}

export class BinanceSpotOrderBookItemResponse extends BrokerResponseMessageBase {
    public Data: IBinanceOrderBookItem;
}

export class BinanceSpotSubscribeOrderBookResponse extends BrokerResponseMessageBase {
    public Data: any;
}

export class BinanceSpotOrderUpdateResponse extends BrokerResponseMessageBase {
    public Data: IBinanceSpotOrderUpdate;
}

export class BinanceSpotAccountUpdateResponse extends BrokerResponseMessageBase {
    public Data: IBinanceSpotAccountUpdate;
}