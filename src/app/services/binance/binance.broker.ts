import { EBrokerInstance, IBroker, IBrokerState } from "@app/interfaces/broker/broker";
import { EExchange } from "@app/models/common/exchange";
import { IInstrument } from "@app/models/common/instrument";
import { ITradeTick } from "@app/models/common/tick";
import { BinanceConnectionData, BinanceTradingAccount } from "modules/Trading/models/crypto/binance/binance.models";
import { ActionResult, BrokerConnectivityStatus } from "modules/Trading/models/models";
import { Subject, Observable, of, Subscription } from "rxjs";

export class BinanceBroker implements IBroker {
    onAccountInfoUpdated: Subject<any> = new Subject<any>();
    onOrdersUpdated: Subject<any[]> = new Subject<any[]>();
    onOrdersParametersUpdated: Subject<any[]> = new Subject<any[]>();
    onHistoricalOrdersUpdated: Subject<any[]> = new Subject<any[]>();
    // onPositionsUpdated: Subject<any[]> = new Subject<any[]>();
    onSaveStateRequired: Subject<void> = new Subject;

    instanceType: EBrokerInstance = EBrokerInstance.Binance;
    status: BrokerConnectivityStatus = BrokerConnectivityStatus.NoConnection;
    orders: any[] = [];
    ordersHistory: any[] = [];
    tradesHistory: any[] = [];
    // currencyRisks: any[] = [];
    accountInfo: BinanceTradingAccount;

    cancelAll(): Observable<any> {
        throw new Error("Method not implemented.");
    }
    placeOrder(order: any): Observable<ActionResult> {
        throw new Error("Method not implemented.");
    }
    editOrder(order: any): Observable<ActionResult> {
        throw new Error("Method not implemented.");
    }
    editOrderPrice(order: any): Observable<ActionResult> {
        throw new Error("Method not implemented.");
    }
    // closeOrder(order: string, ...args: any[]): Observable<ActionResult> {
    //     throw new Error("Method not implemented.");
    // }
    // closePosition(symbol: string, ...args: any[]): Observable<ActionResult> {
    //     throw new Error("Method not implemented.");
    // }
    cancelOrder(order: string, ...args: any[]): Observable<ActionResult> {
        throw new Error("Method not implemented.");
    }
    subscribeToTicks(instrument: string, subscription: (value: ITradeTick) => void): Subscription {
        throw new Error("Method not implemented.");
    }
    instrumentTickSize(symbol: string): number {
        throw new Error("Method not implemented.");
    }
    instrumentContractSize(symbol: string): number {
        throw new Error("Method not implemented.");
    }
    instrumentMinAmount(symbol: string): number {
        throw new Error("Method not implemented.");
    }
    instrumentAmountStep(symbol: string): number {
        throw new Error("Method not implemented.");
    }
    getOrderById(orderId: number) {
        throw new Error("Method not implemented.");
    }
    getPrice(symbol: string): Observable<ITradeTick> {
        throw new Error("Method not implemented.");
    }
    getInstruments(exchange?: EExchange, search?: string): Observable<IInstrument[]> {
        return of([]);
    }
    instrumentDecimals(symbol: string): number {
        return 3;
    }
    init(initData: any): Observable<ActionResult> {
        this.accountInfo = {
            Account: "asdasd-asdfasdf-asdf",
            Funds: []
        };
        return of({
            result: true
        });
    }
    dispose(): Observable<ActionResult> {
        return of({
            result: true
        });
    }
    saveState(): Observable<IBrokerState<BinanceConnectionData>> {
        return of({
            account: "binance_account_id",
            brokerType: EBrokerInstance.Binance,
            server: "Binance",
            state: {
                APIKey: "api_key"
            }
        });
    }
    loadSate(state: IBrokerState<any>): Observable<ActionResult> {
        return this.init(state);
        // return of({
        //     result: true
        // });
    }
    instrumentToBrokerFormat(symbol: string): IInstrument {
        return null;
    }
}