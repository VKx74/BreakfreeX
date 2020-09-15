import {Observable, Subject, Subscription} from "rxjs";
import {IBroker} from "./broker";
import { MT5TradingAccount, MT5Order, MT5Position, MT5PlaceOrder, MT5EditOrder } from 'modules/Trading/models/forex/mt/mt.models';
import { ActionResult, OrderFillPolicy } from 'modules/Trading/models/models';
import { ITick, IMT5Tick } from '@app/models/common/tick';
import { IInstrument } from '@app/models/common/instrument';

export interface IMT5Broker extends IBroker {
    onAccountInfoUpdated: Subject<MT5TradingAccount>;
    onOrdersUpdated: Subject<MT5Order[]>;
    onHistoricalOrdersUpdated: Subject<MT5Order[]>;
    onPositionsUpdated: Subject<MT5Position[]>;

    orders: MT5Order[];
    ordersHistory: MT5Order[];
    positions: MT5Position[];
    accountInfo: MT5TradingAccount;

    placeOrder(order: MT5PlaceOrder): Observable<ActionResult>;
    editOrder(order: MT5EditOrder): Observable<ActionResult>;
    closeOrder(order: string, fillPolicy: OrderFillPolicy, amount: number): Observable<ActionResult>;
    closePosition(symbol: string, fillPolicy: OrderFillPolicy): Observable<ActionResult>;
    cancelOrder(order: string, fillPolicy: OrderFillPolicy): Observable<ActionResult>;
    subscribeToTicks(instrument: string, subscription: (value: IMT5Tick) => void): Subscription;
    instrumentDecimals(symbol: string): number;
    instrumentTickSize(symbol: string): number;
    instrumentMinAmount(symbol: string): number;
    instrumentAmountStep(symbol: string): number;
    instrumentToBrokerFormat(symbol: string): IInstrument;
}