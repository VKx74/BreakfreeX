import {Observable, Subject, Subscription} from "rxjs";
import {IBroker} from "./broker";
import { MTTradingAccount, MTOrder, MTPosition, MTPlaceOrder, MTEditOrder, MTEditOrderPrice, MTStatus, MTCurrencyRisk } from 'modules/Trading/models/forex/mt/mt.models';
import { ActionResult, OrderFillPolicy, OrderSide } from 'modules/Trading/models/models';
import { ITick, IMTTick } from '@app/models/common/tick';
import { IInstrument } from '@app/models/common/instrument';

export interface IMT5Broker extends IBroker {
    onAccountInfoUpdated: Subject<MTTradingAccount>;
    onOrdersUpdated: Subject<MTOrder[]>;
    onOrdersParametersUpdated: Subject<MTOrder[]>;
    onHistoricalOrdersUpdated: Subject<MTOrder[]>;
    onPositionsUpdated: Subject<MTPosition[]>;

    status: MTStatus;
    orders: MTOrder[];
    ordersHistory: MTOrder[];
    positions: MTPosition[];
    currencyRisks: MTCurrencyRisk[];
    accountInfo: MTTradingAccount;

    placeOrder(order: MTPlaceOrder): Observable<ActionResult>;
    editOrder(order: MTEditOrder): Observable<ActionResult>;
    editOrderPrice(order: MTEditOrderPrice): Observable<ActionResult>;
    closeOrder(order: string, fillPolicy: OrderFillPolicy, amount: number): Observable<ActionResult>;
    closePosition(symbol: string, fillPolicy: OrderFillPolicy): Observable<ActionResult>;
    cancelOrder(order: string, fillPolicy: OrderFillPolicy): Observable<ActionResult>;
    subscribeToTicks(instrument: string, subscription: (value: IMTTick) => void): Subscription;
    instrumentDecimals(symbol: string): number;
    instrumentTickSize(symbol: string): number;
    instrumentContractSize(symbol: string): number;
    instrumentMinAmount(symbol: string): number;
    instrumentAmountStep(symbol: string): number;
    instrumentToBrokerFormat(symbol: string): IInstrument;
    instrumentToChartFormat(symbol: string): string;
    getOrderById(orderId: number): MTOrder;
    getPrice(symbol: string): Observable<IMTTick>;
    getRelatedPositionsRisk(symbol: string, side: OrderSide): number;
    calculateTotalVarRisk(): number;
    canCalculateTotalVAR(): boolean;
}