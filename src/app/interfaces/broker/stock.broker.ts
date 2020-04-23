import {Observable, Subject} from "rxjs";
import {ActionResult} from "../../../modules/Trading/models/models";
import {
    IPlaceStockOrderAction,
    IStockBrokerAccount,
    IStockBrokerUserInfo,
    IStockOrder,
    IStockTransaction
} from "../../../modules/Trading/models/stock/stock.models";
import {IBroker} from "./broker";

export interface IStockBroker extends IBroker {
    onAccountInfoUpdated: Subject<IStockBrokerAccount>;
    onOrderUpdated: Subject<IStockOrder[]>;
    onTransactionUpdated: Subject<IStockTransaction[]>;
    orders: IStockOrder[];
    transactions: IStockTransaction[];
    userInfo: IStockBrokerUserInfo;
    subAccounts: IStockBrokerAccount[];
    placeOrder(order: IPlaceStockOrderAction): Observable<ActionResult>;
}