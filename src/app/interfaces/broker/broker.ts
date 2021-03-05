import { ActionResult, BrokerConnectivityStatus, IOrder, IPlaceOrder } from "../../../modules/Trading/models/models";
import { EExchange } from "../../models/common/exchange";
import { Observable, Subject, Subscription } from "rxjs";
import { IInstrument } from "../../models/common/instrument";
import { ITradeTick } from "@app/models/common/tick";

export enum EBrokerInstance {
    MT5 = "MT5",
    MT4 = "MT4",
    Binance = "Binance",
    BinanceFuturesUSD = "BinanceFuturesUSD",
    BinanceFuturesCOIN = "BinanceFuturesCOIN"
}

export interface IBrokerState<T = any> {
    brokerType: EBrokerInstance;
    account: string;
    server: string;
    state: T;
}

export interface IBroker {
    instanceType: EBrokerInstance;
    onSaveStateRequired: Subject<void>;
    onAccountInfoUpdated: Subject<any>;
    onOrdersUpdated: Subject<IOrder[]>;
    onOrdersParametersUpdated: Subject<IOrder[]>;
    onHistoricalOrdersUpdated: Subject<IOrder[]>;
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
    // closeOrder(order: string, ...args): Observable<ActionResult>;
    // closePosition(symbol: string, ...args): Observable<ActionResult>;
    cancelOrder(order: string, ...args): Observable<ActionResult>;
    subscribeToTicks(instrument: string, subscription: (value: ITradeTick) => void): Subscription;
    instrumentTickSize(symbol: string): number;
    instrumentContractSize(symbol: string): number;
    instrumentMinAmount(symbol: string): number;
    instrumentAmountStep(symbol: string): number;
    getOrderById(orderId: number): any;
    getPrice(symbol: string): Observable<ITradeTick>;
}

