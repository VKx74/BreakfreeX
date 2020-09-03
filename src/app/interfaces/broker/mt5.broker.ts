import {Observable, Subject} from "rxjs";
import {IBroker} from "./broker";
import { MT5TradingAccount, MT5Order, MT5Position, MT5PlaceOrder, MT5EditOrder } from 'modules/Trading/models/forex/mt/mt.models';
import { ActionResult } from 'modules/Trading/models/models';

export interface IMT5Broker extends IBroker {
    onAccountInfoUpdated: Subject<MT5TradingAccount>;
    onOrderUpdated: Subject<MT5Order[]>;
    onPositionsUpdated: Subject<MT5Position[]>;
    orders: MT5Order[];
    positions: MT5Position[];
    accountInfo: MT5TradingAccount;
    placeOrder(order: MT5PlaceOrder): Observable<ActionResult>;
    editOrder(order: MT5EditOrder): Observable<ActionResult>;
    closeOrder(order: string): Observable<ActionResult>;
    cancelOrder(order: string): Observable<ActionResult>;
}