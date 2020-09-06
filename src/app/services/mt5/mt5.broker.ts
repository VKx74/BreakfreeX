import { Observable, Subject, Observer, of, Subscription } from "rxjs";
import { IMT5Broker } from '@app/interfaces/broker/mt5.broker';
import { Injectable } from '@angular/core';
import { MT5TradingAccount, MT5PlaceOrder, MT5EditOrder, MT5Order, MT5HistoricalOrder, MT5Position, MT5Server, MT5ConnectionData } from 'modules/Trading/models/forex/mt/mt.models';
import { EBrokerInstance, IBrokerState } from '@app/interfaces/broker/broker';
import { EExchange } from '@app/models/common/exchange';
import { IInstrument } from '@app/models/common/instrument';
import { OrderTypes, ActionResult, OrderSide } from 'modules/Trading/models/models';
import { MT5SocketService } from '../socket/mt5.socket.service';
import { MT5ResponseMessageBase, MT5LoginRequest, EMT5MessageType, MT5LogoutRequest } from 'modules/Trading/models/forex/mt/mt.communication';
import { EOrderStatus } from 'modules/Trading/models/crypto/crypto.models';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EMarketType } from '@app/models/common/marketType';
import { IMT5Tick } from '@app/models/common/tick';

@Injectable()
export class MT5Broker implements IMT5Broker {

    private _tickSubscribers: { [symbol: string]: Subject<IMT5Tick>; } = {};
    private _onAccountInfoUpdated: Subject<MT5TradingAccount> = new Subject<MT5TradingAccount>();
    private _onOrdersUpdated: Subject<MT5Order[]> = new Subject<MT5Order[]>();
    private _onHistoricalOrdersUpdated: Subject<MT5HistoricalOrder[]> = new Subject<MT5HistoricalOrder[]>();
    private _onPositionsUpdated: Subject<MT5Position[]> = new Subject<MT5Position[]>();

    private _onSaveStateRequired: Subject<void> = new Subject();
    private _initData: MT5ConnectionData;
    private _accessToken: string = "";
    private _orders: MT5Order[] = [];
    private _ordersHistory: MT5HistoricalOrder[] = [];
    private _positions: MT5Position[] = [];
    private _accountInfo: MT5TradingAccount;

    public get onSaveStateRequired(): Subject<void> {
        return this._onSaveStateRequired;
    }

    public get accessToken(): string {
        return this._accessToken;
    }

    public get instanceType(): EBrokerInstance {
        return EBrokerInstance.MT5;
    }

    public get onAccountInfoUpdated(): Subject<MT5TradingAccount> {
        return this._onAccountInfoUpdated;
    }

    public get onOrdersUpdated(): Subject<MT5Order[]> {
        return this._onOrdersUpdated;
    }

    public get onHistoricalOrdersUpdated(): Subject<MT5HistoricalOrder[]> {
        return this._onHistoricalOrdersUpdated;
    }

    public get onPositionsUpdated(): Subject<MT5Position[]> {
        return this._onPositionsUpdated;
    }

    public get orders(): MT5Order[] {
        return this._orders;
    }

    public get ordersHistory(): MT5HistoricalOrder[] {
        return this._ordersHistory;
    }

    public get positions(): MT5Position[] {
        return this._positions;
    }

    public get accountInfo(): MT5TradingAccount {
        return this._accountInfo;
    }

    constructor(private ws: MT5SocketService) {

    }

    placeOrder(order: MT5PlaceOrder): Observable<ActionResult> {
        this._orders.push({
            Account: "3435345",
            Comment: order.Comment,
            Id: new Date().getTime() + "",
            Price: order.Price,
            Side: order.Side,
            Size: order.Size,
            Status: EOrderStatus.Open,
            Symbol: order.Symbol,
            Time: new Date().getTime() / 1000,
            Type: order.Type,
            // CurrentPrice: 1.22,
            NetPL: 0,
            PipPL: 0,
            SL: order.SL,
            TP: order.TP
        });

        setTimeout(() => {
            this._onOrdersUpdated.next(this._orders);
        }, 1000);

        return of({
            result: true
        });
    }
    editOrder(order: MT5EditOrder): Observable<ActionResult> {
        throw new Error("Method not implemented.");
    }
    closeOrder(order: string): Observable<ActionResult> {
        throw new Error("Method not implemented.");
    }
    cancelOrder(order: string): Observable<ActionResult> {
        throw new Error("Method not implemented.");
    }
    getInstruments(exchange?: EExchange, search?: string): Observable<IInstrument[]> {
        return of([{
            id: "EURUSD",
            symbol: "EURUSD",
            exchange: null,
            datafeed: null,
            type: null,
            tickSize: 0.00001,
            baseInstrument: "",
            dependInstrument: "",
            pricePrecision: 5,
            tradable: true
        }, {
            id: "AUDCAD",
            symbol: "AUDCAD",
            exchange: null,
            datafeed: null,
            type: null,
            tickSize: 0.00001,
            baseInstrument: "",
            dependInstrument: "",
            pricePrecision: 5,
            tradable: true
        }]);
    }
    isInstrumentAvailable(instrument: IInstrument, orderType: OrderTypes): boolean {
        throw new Error("Method not implemented.");
    }
    init(initData: MT5ConnectionData): Observable<ActionResult> {
        return new Observable<ActionResult>((observer: Observer<ActionResult>) => {

            // test 
            this._initData = initData;
            observer.next({
                result: true
            });
            this._initialize();
            return;
            // test

            this.ws.open().subscribe(value => {
                const request = new MT5LoginRequest();
                request.Data = {
                    Password: initData.Password,
                    User: initData.Login,
                    ServerName: initData.ServerName
                };
                this.ws.login(request).subscribe((data: MT5ResponseMessageBase) => {
                    if (data.IsSuccess) {
                        this._initData = initData;
                        observer.next({
                            result: true
                        });
                        this._initialize();
                    } else {
                        observer.error(data.ErrorMessage);
                    }
                    observer.complete();
                }, (error) => {
                    observer.error(error);
                    observer.complete();
                 });

            }, error => {
                observer.error(error);
                this.ws.close();
            });

            this.ws.onReconnect.subscribe(() => {
                if (!this._initData) {
                    this.ws.close();
                }
            });
        });
    }
    dispose(): Observable<ActionResult> {
        this.ws.dispose();

        return of({
            result: true
        });
    }
    saveState(): Observable<IBrokerState<any>> {
        return of({
            brokerType: EBrokerInstance.MT5,
            state: this._initData
        });
    }

    loadSate(state: IBrokerState<any>): Observable<ActionResult> {
        if (state.brokerType === EBrokerInstance.MT5 && state.state) {
            return this.init(state.state as MT5ConnectionData);
        }
        return of({
            result: false
        });
    }

    subscribeToTicks(symbol: string, subscription: (value: IMT5Tick) => void): Subscription {
        if (!this._tickSubscribers[symbol]) {
            this._tickSubscribers[symbol] = new Subject<IMT5Tick>();


        }

        return this._tickSubscribers[symbol].subscribe(subscription);
    }

    private _initialize() {
        this._orders = [];

        for (let i = 0; i < 15; i++) {
            this._orders.push({
                Account: "3435345",
                Comment: "Test",
                Id: "123234",
                Price: 100.00,
                Side: OrderSide.Buy,
                Size: 1.2,
                Status: EOrderStatus.Open,
                Symbol: "EURUSD",
                Time: new Date().getTime() / 1000,
                Type: OrderTypes.Limit,
                CurrentPrice: 1.22,
                NetPL: 200,
                PipPL: 0.2,
                SL: 95.00
            });
        }

        this._accountInfo = {
            Account: "3435345",
            Balance: 556.85,
            Currency: "USD",
            Equity: 112.22,
            MarginUsable: 0,
            MarginUsed: 0,
            Pl: 77.45
        };


        setInterval(() => {
            for (const order of this._orders) {
                if (!order.CurrentPrice) {
                    order.CurrentPrice = 0;
                }
                order.CurrentPrice += 0.001;
            }
        }, 1000);
    }
}