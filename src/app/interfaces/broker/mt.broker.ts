import {Observable, Subject, Subscription} from "rxjs";
import {IBroker} from "./broker";
import { MTTradingAccount, MTOrder, MTPosition, MTPlaceOrder, MTEditOrder, MTEditOrderPrice as EditOrderPrice, MTOrderValidationChecklist, MTOrderValidationChecklistInput } from 'modules/Trading/models/forex/mt/mt.models';
import { ActionResult, BrokerConnectivityStatus, CurrencyRisk, OrderFillPolicy, OrderSide, OrderTypes } from 'modules/Trading/models/models';
import { ITradeTick } from '@app/models/common/tick';
import { IInstrument } from '@app/models/common/instrument';

export interface IMT5Broker extends IBroker {
    onAccountInfoUpdated: Subject<MTTradingAccount>;
    onOrdersUpdated: Subject<MTOrder[]>;
    onOrdersParametersUpdated: Subject<MTOrder[]>;
    onHistoricalOrdersUpdated: Subject<MTOrder[]>;
    onPositionsUpdated: Subject<MTPosition[]>;

    status: BrokerConnectivityStatus;
    orders: MTOrder[];
    ordersHistory: MTOrder[];
    positions: MTPosition[];
    currencyRisks: CurrencyRisk[];
    accountInfo: MTTradingAccount;
    account: string;

    placeOrder(order: MTPlaceOrder): Observable<ActionResult>;
    editOrder(order: MTEditOrder): Observable<ActionResult>;
    editOrderPrice(order: EditOrderPrice): Observable<ActionResult>;
    closeOrder(order: string, fillPolicy: OrderFillPolicy, amount: number): Observable<ActionResult>;
    closePosition(symbol: string, fillPolicy: OrderFillPolicy): Observable<ActionResult>;
    cancelOrder(order: string, fillPolicy: OrderFillPolicy): Observable<ActionResult>;
    subscribeToTicks(instrument: string, subscription: (value: ITradeTick) => void): Subscription;
    instrumentTickSize(symbol: string): number;
    instrumentContractSize(symbol: string): number;
    instrumentMinAmount(symbol: string): number;
    instrumentAmountStep(symbol: string): number;
    getOrderById(orderId: number): MTOrder;
    getPrice(symbol: string): Observable<ITradeTick>;
    getRelatedPositionsRisk(symbol: string, side: OrderSide): number;
    getSamePositionsRisk(symbol: string, side: OrderSide): number;
    canCalculateHighestVAR(orderType?: OrderTypes): boolean;
    calculateOrderChecklist(parameters: MTOrderValidationChecklistInput): Observable<MTOrderValidationChecklist>;
}