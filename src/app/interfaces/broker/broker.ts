import { ActionResult, BrokerConnectivityStatus, IOrder, IPlaceOrder, IPosition, OrderSide } from "../../../modules/Trading/models/models";
import { EExchange } from "../../models/common/exchange";
import { Observable, Subject, Subscription } from "rxjs";
import { IInstrument } from "../../models/common/instrument";
import { ITradeTick } from "@app/models/common/tick";

export enum EBrokerInstance {
    MT5 = "MT5",
    MT4 = "MT4",
    Binance = "Binance",
    BinanceFuturesUSD = "BinanceFuturesUSD",
    BinanceFuturesCOIN = "BinanceFuturesCOIN",
    BFTDemo = "BFTDemo",
    BFTFundingDemo = "BFTFundingDemo",
    BFTFundingLive = "BFTFundingLive"
}

export interface IBrokerState<T = any> {
    brokerType: EBrokerInstance;
    account: string;
    server: string;
    state: T;
}

export interface IPositionBasedBroker {
    onPositionsUpdated: Subject<IPosition[]>;
    onPositionsParametersUpdated: Subject<IPosition[]>;
    positions: IPosition[];

    closePosition(symbol: any, ...args): Observable<ActionResult>;
}

export enum EBrokerNotification {
    OrderPlaced,
    OrderFilled,
    OrderCanceled,
    OrderClosed,
    OrderModified,
    OrderSLHit,
    OrderTPHit,
    OrderEntryHit
}

export interface IBrokerNotification {
    type: EBrokerNotification;
    order: IOrder;
}

export interface IBroker {
    isOrderEditAvailable: boolean;
    isOrderSLTPEditAvailable: boolean;
    isPositionBased: boolean;

    instanceType: EBrokerInstance;
    onSaveStateRequired: Subject<void>;
    onAccountInfoUpdated: Subject<any>;
    onOrdersUpdated: Subject<IOrder[]>;
    onOrdersParametersUpdated: Subject<IOrder[]>;
    onHistoricalOrdersUpdated: Subject<IOrder[]>;
    onNotification: Subject<IBrokerNotification>;
    // onPositionsUpdated: Subject<any[]>;

    status: BrokerConnectivityStatus;
    orders: IOrder[];
    ordersHistory: IOrder[];
    // currencyRisks: any[];
    accountInfo: any;

    getInstruments(exchange?: EExchange, search?: string): Observable<IInstrument[]>;
    init(initData: any): Observable<ActionResult>;
    dispose(): Observable<ActionResult>;
    saveState(): Observable<IBrokerState>;
    loadSate(state: IBrokerState): Observable<ActionResult>;
    instrumentToBrokerFormat(symbol: string): IInstrument;
    instrumentDecimals(symbol: string): number;

    cancelAll(): Observable<any>;
    placeOrder(order: IPlaceOrder): Observable<ActionResult>;
    editOrder(order: any): Observable<ActionResult>;
    editOrderPrice(order: any): Observable<ActionResult>;
    cancelOrder(order: any, ...args): Observable<ActionResult>;
    subscribeToTicks(instrument: string, subscription: (value: ITradeTick) => void): Subscription;
    instrumentTickSize(symbol: string): number;
    instrumentContractSize(symbol: string): number;
    instrumentMinAmount(symbol: string): number;
    instrumentAmountStep(symbol: string): number;
    instrumentQuantityPrecision(symbol: string): number;
    getOrderById(orderId: number): any;
    getPrice(symbol: string): Observable<ITradeTick>;
    getSamePositionsRisk(symbol: string, side: OrderSide): number;
    getRelatedPositionsRisk(symbol: string, side: OrderSide): number;
}

export interface ICryptoBroker extends IBroker {
    onRisksUpdated: Subject<void>;
    getCoinBalance(coin: string): number;
    getPairBalance(symbol: string): number;
}