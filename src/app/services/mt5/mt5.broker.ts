import { Observable, Subject, Observer, of, Subscription, throwError, forkJoin } from "rxjs";
import { IMT5Broker } from '@app/interfaces/broker/mt5.broker';
import { Injectable } from '@angular/core';
import { MT5TradingAccount, MT5PlaceOrder, MT5EditOrder, MT5Order, MT5Position, MT5Server, MT5ConnectionData } from 'modules/Trading/models/forex/mt/mt.models';
import { EBrokerInstance, IBrokerState } from '@app/interfaces/broker/broker';
import { EExchange } from '@app/models/common/exchange';
import { IInstrument } from '@app/models/common/instrument';
import { OrderTypes, ActionResult, OrderSide, OrderExpirationType, OrderFillPolicy } from 'modules/Trading/models/models';
import { MT5SocketService } from '../socket/mt5.socket.service';
import { MT5ResponseMessageBase, MT5LoginRequest, EMT5MessageType, MT5LogoutRequest, MT5LoginResponse, IMT5PlaceOrderData, MT5PlaceOrderRequest, MT5EditOrderRequest, MT5CloseOrderRequest, IMT5AccountUpdatedData, IMT5OrderData, MT5GetOrderHistoryRequest } from 'modules/Trading/models/forex/mt/mt.communication';
import { EOrderStatus } from 'modules/Trading/models/crypto/crypto.models';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EMarketType } from '@app/models/common/marketType';
import { IMT5Tick } from '@app/models/common/tick';

@Injectable()
export class MT5Broker implements IMT5Broker {
    private _tickSubscribers: { [symbol: string]: Subject<IMT5Tick>; } = {};
    private _instrumentDecimals: { [symbol: string]: number; } = {};
    private _instrumentTickSize: { [symbol: string]: number; } = {};

    private _onAccountInfoUpdated: Subject<MT5TradingAccount> = new Subject<MT5TradingAccount>();
    private _onOrdersUpdated: Subject<MT5Order[]> = new Subject<MT5Order[]>();
    private _onHistoricalOrdersUpdated: Subject<MT5Order[]> = new Subject<MT5Order[]>();
    private _onPositionsUpdated: Subject<MT5Position[]> = new Subject<MT5Position[]>();
    private _instruments: IInstrument[] = [];

    private _onSaveStateRequired: Subject<void> = new Subject();
    private _initData: MT5ConnectionData;
    private _accessToken: string = "";
    private _orders: MT5Order[] = [];
    private _ordersHistory: MT5Order[] = [];
    private _positions: MT5Position[] = [];
    private _accountInfo: MT5TradingAccount;
    private _endHistory: number = Math.round(new Date().getTime() / 1000);
    private _startHistory: number = this._endHistory - (60 * 60 * 24 * 14);

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

    public get onHistoricalOrdersUpdated(): Subject<MT5Order[]> {
        return this._onHistoricalOrdersUpdated;
    }

    public get onPositionsUpdated(): Subject<MT5Position[]> {
        return this._onPositionsUpdated;
    }

    public get orders(): MT5Order[] {
        return this._orders;
    }
    
    public get marketOrders(): MT5Order[] {
        return this._orders.filter(order => order.Type === OrderTypes.Market);
    }

    public get pendingOrders(): MT5Order[] {
        return this._orders.filter(order => order.Type !== OrderTypes.Market);
    }

    public get ordersHistory(): MT5Order[] {
        return this._ordersHistory;
    }

    public get positions(): MT5Position[] {
        return this._positions;
    }

    public get accountInfo(): MT5TradingAccount {
        return this._accountInfo;
    }

    constructor(private ws: MT5SocketService) {
        this.ws.tickSubject.subscribe(this._handleQuotes);
        this.ws.accountUpdatedSubject.subscribe(this._handleAccountUpdate);
        this.ws.ordersUpdatedSubject.subscribe(this._handleOrdersUpdate);
    }

    placeOrder(order: MT5PlaceOrder): Observable<ActionResult> {
        const request = new MT5PlaceOrderRequest();
        request.Data = {
            Comment: order.Comment,
            Price: order.Price,
            Side: order.Side,
            Lots: order.Size,
            Symbol: order.Symbol,
            Type: order.Type,
            StopLoss: order.SL,
            TakeProfit: order.TP,
            ExpirationType: order.ExpirationType,
            FillPolicy: order.FillPolicy,
            ExpirationDate: order.ExpirationDate
        };

        return new Observable<ActionResult>((observer: Observer<ActionResult>) => {
            this.ws.placeOrder(request).subscribe((response) => {
                if (response.IsSuccess) {
                    observer.next({ result: true });
                } else {
                    observer.error(response.ErrorMessage);
                }
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    editOrder(order: MT5EditOrder): Observable<ActionResult> {
        const request = new MT5EditOrderRequest();
        request.Data = {
            Comment: order.Comment,
            Price: order.Price,
            Side: order.Side,
            Lots: order.Size,
            Symbol: order.Symbol,
            Type: order.Type,
            StopLoss: order.SL,
            TakeProfit: order.TP,
            ExpirationType: order.ExpirationType,
            ExpirationDate: order.ExpirationDate,
            Ticket: order.Ticket
        };

        return new Observable<ActionResult>((observer: Observer<ActionResult>) => {
            this.ws.editOrder(request).subscribe((response) => {
                if (response.IsSuccess) {
                    observer.next({ result: true });
                } else {
                    observer.error(response.ErrorMessage);
                }
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    closePosition(symbol: string): Observable<ActionResult> {
        let orders: MT5Order[] = [];

        for (const o of this._orders) {
            if (o.Symbol === symbol) {
                orders.push(o);
            }
        }

        if (!orders.length) {
            return throwError("Orders not found for symbol");
        }

        const awaiters: Observable<ActionResult>[] = [];

        for (const order of orders) {
            const awaiter = this.closeOrder(order.Id);
            awaiters.push(awaiter);
        }

        return new Observable<ActionResult>(subscriber => {
            forkJoin(awaiters).subscribe(results => {
                for (const result of results) {
                    if (!result.result) {
                        subscriber.error(result.msg);
                        subscriber.complete();
                        return;
                    }
                }

                subscriber.next({ result: true });
                subscriber.complete();
            }, error => {
                subscriber.error(error);
                subscriber.complete();
            });
        });
    }

    closeOrder(order_id: any, amount: number = null): Observable<ActionResult> {
        let order = null;

        for (const o of this._orders) {
            if (o.Id === order_id) {
                order = o;
                break;
            }
        }

        if (!order) {
            return throwError("Order not found");
        }

        const request = new MT5CloseOrderRequest();
        request.Data = {
            Comment: order.Comment,
            Price: order.Price,
            Side: order.Side,
            Lots: amount ? amount : order.Size,
            Symbol: order.Symbol,
            Type: order.Type,
            Ticket: order.Ticket,
            FillPolicy: order.FillPolicy
        };

        return new Observable<ActionResult>((observer: Observer<ActionResult>) => {
            this.ws.closeOrder(request).subscribe((response) => {
                if (response.IsSuccess) {
                    observer.next({ result: true });
                } else {
                    observer.error(response.ErrorMessage);
                }
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });

    }

    cancelOrder(order_id: any): Observable<ActionResult> {
        let order = null;

        for (const o of this._orders) {
            if (o.Id === order_id) {
                order = o;
                break;
            }
        }

        if (!order) {
            return throwError("Order not found");
        }

        const request = new MT5CloseOrderRequest();
        request.Data = {
            Comment: order.Comment,
            Price: order.Price,
            Side: order.Side,
            Lots: order.Size,
            Symbol: order.Symbol,
            Type: order.Type,
            Ticket: order.Ticket,
            FillPolicy: order.FillPolicy
        };

        return new Observable<ActionResult>((observer: Observer<ActionResult>) => {
            this.ws.closeOrder(request).subscribe((response) => {
                if (response.IsSuccess) {
                    observer.next({ result: true });
                } else {
                    observer.error(response.ErrorMessage);
                }
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }
    getInstruments(exchange?: EExchange, search?: string): Observable<IInstrument[]> {
        return of(this._instruments);
    }
    isInstrumentAvailable(instrument: IInstrument, orderType: OrderTypes): boolean {
        for (const i of this._instruments) {
            if (i.symbol === instrument.symbol) {
                return true;
            }
        }
        return false;
    }
    init(initData: MT5ConnectionData): Observable<ActionResult> {
        return new Observable<ActionResult>((observer: Observer<ActionResult>) => {

            // test 
            this._initData = initData;
            observer.next({
                result: true
            });
            this._initialize(["EURUSD", "AUDCAD"]);
            return;
            // test

            this.ws.open().subscribe(value => {
                const request = new MT5LoginRequest();
                request.Data = {
                    Password: initData.Password,
                    User: initData.Login,
                    ServerName: initData.ServerName
                };
                this.ws.login(request).subscribe((data: MT5LoginResponse) => {
                    if (data.IsSuccess) {
                        this._initData = initData;
                        observer.next({
                            result: true
                        });
                        this._initialize(data.Data);
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
            this.ws.subscribeOnQuotes(symbol).subscribe();
        }

        return this._tickSubscribers[symbol].subscribe(subscription);
    }

    private _initialize(instruments: string[]) {
        for (const instrument of instruments) {
            this._instruments.push({
                id: instrument,
                symbol: instrument,
                exchange: null,
                datafeed: null,
                type: null,
                tickSize: 0.00001,
                baseInstrument: "",
                dependInstrument: "",
                pricePrecision: 5,
                tradable: true
            });
        }

        this._orders = [];

        for (let i = 0; i < 15; i++) {
            this._orders.push({
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
                SL: 95.00,
                Commission: 1.5,
                Swap: 0.1,
                ExpirationType: OrderExpirationType.GTC
            });
        }
        
        for (let i = 0; i < 15; i++) {
            this._orders.push({
                Comment: "Test",
                Id: "123234",
                Price: 100.00,
                Side: OrderSide.Buy,
                Size: 1.2,
                Status: EOrderStatus.Open,
                Symbol: "EURUSD_" + i,
                Time: new Date().getTime() / 1000,
                Type: OrderTypes.Market,
                CurrentPrice: 1.22,
                NetPL: -200,
                PipPL: -0.2,
                SL: 95.00,
                Commission: 1.5,
                Swap: 0.1,
                ExpirationType: OrderExpirationType.GTC
            });
        }
        for (let i = 0; i < 5; i++) {
            this._orders.push({
                Comment: "Test",
                Id: "123234",
                Price: 100.00,
                Side: OrderSide.Sell,
                Size: 1.5,
                Status: EOrderStatus.Open,
                Symbol: "AUDCAD",
                Time: new Date().getTime() / 1000,
                Type: OrderTypes.Market,
                CurrentPrice: 1.22,
                NetPL: 200,
                PipPL: 0.2,
                SL: 95.00,
                Commission: 1.5,
                Swap: 0.1,
                ExpirationType: OrderExpirationType.GTC
            });
        }

        this._accountInfo = {
            Account: "3435345",
            Balance: 556.85,
            Currency: "USD",
            Equity: 112.22,
            Margin: 0,
            FreeMargin: 0,
            Pl: 77.45
        };
        
        this._buildPositions();

        setInterval(() => {
            for (const order of this._orders) {
                if (!order.CurrentPrice) {
                    order.CurrentPrice = 0;
                }
                order.CurrentPrice += 0.001;
            }
            this._buildPositions();
        }, 1000);
    }

    public instrumentDecimals(symbol: string): number {
        if (this._instrumentDecimals[symbol]) {
            return this._instrumentDecimals[symbol];
        }

        return 5;
    }

    public instrumentTickSize(symbol: string): number {
        if (this._instrumentTickSize[symbol]) {
            return this._instrumentTickSize[symbol];
        }

        return 0.00001;
    }

    public instrumentMinAmount(symbol: string): number {
        return 0.01;
    }

    public instrumentAmountStep(symbol: string): number {
        return 0.01;
    }

    private _handleQuotes(quote: IMT5Tick) {
        const subject = this._tickSubscribers[quote.symbol];
        if (subject && subject.observers.length > 0) {
            this._tickSubscribers[quote.symbol].next(quote);
        } else {
            if (subject) {
                subject.unsubscribe();
            }
            delete this._tickSubscribers[quote.symbol];
            this.ws.unsubscribeFromQuotes(quote.symbol).subscribe();
        }
    }

    private _handleAccountUpdate(data: IMT5AccountUpdatedData) {
        this._accountInfo.Balance = data.Balance;
        this._accountInfo.Currency = data.Currency;
        this._accountInfo.Equity = data.Equity;
        this._accountInfo.FreeMargin = data.FreeMargin;
        this._accountInfo.Margin = data.Margin;
        this._accountInfo.Pl = data.Profit;

        this.onAccountInfoUpdated.next(this._accountInfo);
    }

    private _handleOrdersUpdate(data: IMT5OrderData[]) {
        let updateRequired = false;

        for (const newOrder of data) {
            let exists = false;
            for (const existingOrder of this._orders) {
                if (existingOrder.Id === newOrder.Ticket.toString()) {
                    existingOrder.CurrentPrice = newOrder.ClosePrice;
                    existingOrder.SL = newOrder.StopLoss ? newOrder.StopLoss : null;
                    existingOrder.TP = newOrder.TakeProfit ? newOrder.TakeProfit : null;
                    existingOrder.Price = newOrder.OpenPrice ? newOrder.OpenPrice : null;
                    existingOrder.Comment = newOrder.Comment ? newOrder.Comment : null;
                    existingOrder.Commission = newOrder.Commission ? newOrder.Commission : null;
                    existingOrder.Swap = newOrder.Swap ? newOrder.Swap : null;
                    existingOrder.Size = newOrder.Lots;
                    existingOrder.Type = newOrder.Type as OrderTypes;
                    existingOrder.Time = newOrder.OpenTime;
                    existingOrder.NetPL = newOrder.Profit;
                    existingOrder.Status = newOrder.State;
                    existingOrder.ExpirationType = newOrder.ExpirationType as OrderExpirationType;
                    existingOrder.ExpirationDate = newOrder.ExpirationDate ? newOrder.ExpirationDate : null;
                    existingOrder.PipPL = newOrder.OpenPrice - newOrder.ClosePrice;
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                updateRequired = true;
                const ord = this._addOrder(newOrder);
                this._orders.push(ord);
            }
        }

        for (let i = 0; i < this._orders.length; i++) {
            let existingOrder = this._orders[i];
            let exists = false;
            for (const newOrder of data) {
                if (existingOrder.Id === newOrder.Ticket.toString()) {
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                updateRequired = true;
                this._orders.splice(i, 1);
                i--;
            }
        }

        if (updateRequired) {
            this.onOrdersUpdated.next(this._orders);
            this._loadHistory();
        }

        this._buildPositions();
    }

    private _addOrder(data: IMT5OrderData): MT5Order {
        const ord: MT5Order = {
            Id: data.Ticket.toString(),
            CurrentPrice: data.ClosePrice,
            SL: data.StopLoss ? data.StopLoss : null,
            TP: data.TakeProfit ? data.TakeProfit : null,
            Price: data.OpenPrice ? data.OpenPrice : null,
            Comment: data.Comment ? data.Comment : null,
            Commission: data.Commission ? data.Commission : null,
            Swap: data.Swap ? data.Swap : null,
            Size: data.Lots,
            Type: data.Type as OrderTypes,
            Time: data.OpenTime,
            NetPL: data.Profit,
            Status: data.State,
            ExpirationType: data.ExpirationType as OrderExpirationType,
            ExpirationDate: data.ExpirationDate ? data.ExpirationDate : null,
            Side: data.Side as OrderSide,
            Symbol: data.Symbol,
            PipPL: data.OpenPrice - data.ClosePrice
        };

        return ord;
    }

    private _loadHistory() {
        const request = new MT5GetOrderHistoryRequest();
        request.Data = {
            From: this._startHistory,
            To: this._endHistory
        };

        this.ws.getOrderHistory(request).subscribe((data) => {
            this._ordersHistory = [];
            for (const order of data.Data) {
                const ord = this._addOrder(order);
                this._ordersHistory.push(ord);
            }
            this._onHistoricalOrdersUpdated.next(this._ordersHistory);
        });
    }

    private _buildPositions() {
        const positions: { [symbol: string]: MT5Position } = {};
        for (const order of this._orders) {
            if (order.Type !== OrderTypes.Market) {
                continue;
            }

            if (positions[order.Symbol]) {
                this._updatePositionByOrder(positions[order.Symbol], order);
            } else {
                const position = this._createPositionByOrder(order);
                positions[order.Symbol] = position;
            }
        }

        let updateRequired = false;

        for (let i = 0; i < this._positions.length; i++) {
            let existingPosition = this._positions[i];
            if (positions[existingPosition.Symbol]) {
                const pos = positions[existingPosition.Symbol];
                delete positions[existingPosition.Symbol];

                existingPosition.Commission = pos.Commission;
                existingPosition.Swap = pos.Swap;
                existingPosition.CurrentPrice = pos.CurrentPrice;
                existingPosition.NetPL = pos.NetPL;
                existingPosition.PipPL = pos.PipPL;
                existingPosition.Price = pos.Price;
                existingPosition.Side = pos.Side;
                existingPosition.Size = pos.Size;

            } else {
                updateRequired = true;
                this._orders.splice(i, 1);
                i--;
            }
        }

        for (const i in positions) {
            if (positions[i] && positions[i].Size) {
                updateRequired = true;
                this._positions.push(positions[i]);
            }
        }

        if (updateRequired) {
            this._onPositionsUpdated.next(this._positions);
        }
    }

    private _updatePositionByOrder(position: MT5Position, order: MT5Order) {
        // todo: check market orders

        const totalPrice = (position.Size * position.Price) + (order.Size * order.Price);
        const avgPrice = totalPrice / (position.Size + order.Size);

        if (order.NetPL) {
            if (!position.NetPL) {
                position.NetPL = 0;
            }
            position.NetPL += order.NetPL;
        }

        if (order.PipPL) {
            if (!position.PipPL) {
                position.PipPL = 0;
            }
            position.PipPL += order.PipPL;
        }

        if (order.Swap) {
            if (!position.Swap) {
                position.Swap = 0;
            }
            position.Swap += order.Swap;
        }

        if (order.Commission) {
            if (!position.Commission) {
                position.Commission = 0;
            }
            position.Commission += order.Commission;
        }

        position.Price = avgPrice;
        position.Size += order.Size;
    }

    private _createPositionByOrder(order: MT5Order): MT5Position {
        return {
            Symbol: order.Symbol,
            Price: order.Price,
            Side: order.Side,
            Size: order.Size,
            Commission: order.Commission,
            Swap: order.Swap,
            NetPL: order.NetPL,
            PipPL: order.PipPL,
            CurrentPrice: order.CurrentPrice
        };
    }
}