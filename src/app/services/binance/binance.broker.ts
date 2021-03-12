import { Inject } from "@angular/core";
import { EBrokerInstance, IBroker, IBrokerState } from "@app/interfaces/broker/broker";
import { EExchangeInstance } from "@app/interfaces/exchange/exchange";
import { ReadyStateConstants } from "@app/interfaces/socket/WebSocketConfig";
import { EExchange } from "@app/models/common/exchange";
import { IInstrument } from "@app/models/common/instrument";
import { EMarketType } from "@app/models/common/marketType";
import { ITradeTick } from "@app/models/common/tick";
import { BinanceFutureLoginResponse } from "modules/Trading/models/crypto/binance-futures/binance-futures.communication";
import { BinanceConnectionData, BinanceFund, BinanceSpotTradingAccount } from "modules/Trading/models/crypto/binance/binance.models";
import { BinanceSpotBookPriceResponse, BinanceSpotLoginRequest, BinanceSpotOpenOrderResponse, BinanceSpotOrderHistoryResponse, BinanceSpotTradeHistoryResponse, IBinanceSpotAccountInfoData, IBinanceSpotHistoricalOrder, IBinanceSpotOrder, IBinanceSpotOrderUpdateData, IBinanceSpotTrade, IBinanceSpotWalletBalance } from "modules/Trading/models/crypto/binance/binance.models.communication";
import { IBinancePrice, IBinanceSymbolData } from "modules/Trading/models/crypto/shared/models.communication";
import { ActionResult, BrokerConnectivityStatus, IOrder, OrderSide, OrderTypes } from "modules/Trading/models/models";
import { Subject, Observable, of, Subscription, Observer, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { AlgoService } from "../algo.service";
import { InstrumentMappingService } from "../instrument-mapping.service";
import { TradingHelper } from "../mt/mt.helper";
import { BinanceSpotSocketService } from "../socket/binance-spot.socket.service";

export class BinanceBroker implements IBroker {
    protected _tickSubscribers: { [symbol: string]: Subject<ITradeTick>; } = {};
    protected _instrumentDecimals: { [symbol: string]: number; } = {};
    protected _instrumentTickSize: { [symbol: string]: number; } = {};
    protected _instrumentContractSize: { [symbol: string]: number; } = {};
    protected _symbolToAsset: { [key: string]: string; } = {};
    protected _accountInfo: BinanceSpotTradingAccount;
    protected _initData: BinanceConnectionData;
    protected _instruments: IInstrument[] = [];
    protected _lastPriceSubscribers: string[] = [];

    protected _onAccountUpdateSubscription: Subscription;
    protected _onReconnectSubscription: Subscription;
    protected _onTickSubscription: Subscription;
    protected _onLastPriceSubject: Subscription;
    protected _onOrderUpdateSubject: Subscription;
    protected _onAccountUpdateSubject: Subscription;
    protected _onPositionsUpdateSubject: Subscription;

    protected get _accountName(): string {
        return "30000000000";
    }

    protected get _server(): string {
        return "Binance Futures Spot";
    }

    instanceType: EBrokerInstance = EBrokerInstance.Binance;

    onAccountInfoUpdated: Subject<BinanceSpotTradingAccount> = new Subject<BinanceSpotTradingAccount>();
    onOrdersUpdated: Subject<any[]> = new Subject<any[]>();
    onOrdersParametersUpdated: Subject<any[]> = new Subject<any[]>();
    onHistoricalOrdersUpdated: Subject<any[]> = new Subject<any[]>();
    onHistoricalTradesUpdated: Subject<any[]> = new Subject<any[]>();
    onFundsUpdated: Subject<BinanceFund[]> = new Subject<BinanceFund[]>();
    onSaveStateRequired: Subject<void> = new Subject;

    funds: BinanceFund[] = [];
    orders: any[] = [];
    ordersHistory: any[] = [];
    tradesHistory: any[] = [];

    public get status(): BrokerConnectivityStatus {
        if (this.ws.readyState === ReadyStateConstants.OPEN) {
            return BrokerConnectivityStatus.Connected;
        }

        return BrokerConnectivityStatus.NoConnection;
    }

    public get accountInfo(): BinanceSpotTradingAccount {
        return this._accountInfo;
    }

    public get isOrderEditAvailable(): boolean {
        return false;
    }

    public get isPositionBased(): boolean {
        return false;
    }

    public get server(): string {
        return this._server;
    }

    constructor(@Inject(BinanceSpotSocketService) protected ws: BinanceSpotSocketService, protected algoService: AlgoService, protected _instrumentMappingService: InstrumentMappingService) {
    }

    placeOrder(order: any): Observable<ActionResult> {
        return new Observable<ActionResult>((observer: Observer<ActionResult>) => {
            this.ws.placeOrder(order).subscribe((response) => {
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
    editOrder(order: any): Observable<ActionResult> {
        return of({
            result: false,
            msg: "Edit not supported by broker"
        });
    }
    editOrderPrice(order: any): Observable<ActionResult> {
        return of({
            result: false,
            msg: "Edit not supported by broker"
        });
    }
    cancelOrder(order: any): Observable<ActionResult> {
        return of();
        // let specificOrder: IOrder;

        // for (const o of this.orders) {
        //     if (o.Id === order) {
        //         specificOrder = o;
        //     }
        // }

        // if (!specificOrder) {
        //     return throwError("Order not found");
        // }

        // return new Observable<ActionResult>((observer: Observer<ActionResult>) => {
        //     this.ws.closeOrder(specificOrder.Symbol, specificOrder.Id).subscribe((response) => {
        //         if (response.IsSuccess) {
        //             observer.next({ result: true });
        //             // this._removeFromOrders(specificOrder.Id);
        //         } else {
        //             observer.error(response.ErrorMessage);
        //         }
        //         observer.complete();
        //     }, (error) => {
        //         observer.error(error);
        //         observer.complete();
        //     });
        // });
    }
    cancelAll(): Observable<any> {
        const pending = this.orders;
        const subjects = [];
        for (const order of pending) {
            const subj = this.cancelOrder(order.Id);
            subjects.push(subj);
        }

        return combineLatest(subjects);
    }
    subscribeToTicks(symbol: string, subscription: (value: ITradeTick) => void): Subscription {
        if (!this._tickSubscribers[symbol]) {
            this._tickSubscribers[symbol] = new Subject<ITradeTick>();
            this.ws.subscribeOnOrderBook(symbol).subscribe();
        }

        return this._tickSubscribers[symbol].subscribe(subscription);
    }
    instrumentTickSize(symbol: string): number {
        if (this._instrumentTickSize[symbol]) {
            return this._instrumentTickSize[symbol];
        }

        return 0.00001;
    }
    instrumentContractSize(symbol: string): number {
        return 1;
    }
    instrumentMinAmount(symbol: string): number {
        return 0.001;
    }
    instrumentAmountStep(symbol: string): number {
        return 0.001;
    }
    getOrderById(orderId: any): IOrder {
        for (const o of this.orders) {
            if (o.Id === orderId) {
                return o;
            }
        }
    }
    getPrice(symbol: string): Observable<ITradeTick> {
        return new Observable<ITradeTick>((observer: Observer<ITradeTick>) => {
            this.ws.getBookPrice(symbol).subscribe((response: BinanceSpotBookPriceResponse) => {
                if (response.IsSuccess) {
                    const bid = response.Data.BookPrice.bidPrice;
                    const ask = response.Data.BookPrice.askPrice;
                    const qty = response.Data.BookPrice.askQty + response.Data.BookPrice.bidQty;
                    observer.next({
                        ask: ask,
                        bid: bid,
                        last: (bid + ask) / 2,
                        symbol: symbol,
                        volume: qty
                    });
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
        if (!search) {
            return of(this._instruments.slice());
        }

        const filtered = this._instruments.filter(i => {
            const s = i.symbol.toLowerCase();
            return s.indexOf(search.toLowerCase()) !== -1;
        });

        return of(filtered.slice());
    }
    instrumentDecimals(symbol: string): number {
        if (this._instrumentDecimals[symbol] !== undefined) {
            return this._instrumentDecimals[symbol];
        }

        return 5;
    }
    init(initData: BinanceConnectionData): Observable<ActionResult> {
        if (this._onTickSubscription) {
            this._onTickSubscription.unsubscribe();
        }
        if (this._onLastPriceSubject) {
            this._onLastPriceSubject.unsubscribe();
        }
        if (this._onAccountUpdateSubscription) {
            this._onAccountUpdateSubscription.unsubscribe();
        }
        if (this._onOrderUpdateSubject) {
            this._onOrderUpdateSubject.unsubscribe();
        }
        if (this._onAccountUpdateSubject) {
            this._onAccountUpdateSubject.unsubscribe();
        }
        if (this._onPositionsUpdateSubject) {
            this._onPositionsUpdateSubject.unsubscribe();
        }
        if (this._onReconnectSubscription) {
            this._onReconnectSubscription.unsubscribe();
        }

        this._symbolToAsset = {};

        this._onTickSubscription = this.ws.tickSubject.subscribe(this._handleQuotes.bind(this));
        this._onLastPriceSubject = this.ws.lastPriceSubject.subscribe(this._handleLastPrice.bind(this));
        this._onOrderUpdateSubject = this.ws.orderUpdateSubject.subscribe(this._handleOrderUpdate.bind(this));
        this._onAccountUpdateSubject = this.ws.accountUpdateSubject.subscribe(this._handleRealtimeAccountUpdate.bind(this));
        this._onAccountUpdateSubscription = this.ws.accountInfoReceivedSubject.subscribe(this._handleAccountUpdate.bind(this));
        this._onReconnectSubscription = this.ws.onReconnect.subscribe(() => {
            this._reconnect();
        });

        return new Observable<ActionResult>((observer: Observer<ActionResult>) => {
            this.ws.open().subscribe(value => {
                const request = new BinanceSpotLoginRequest();
                request.Data = {
                    ApiSecret: initData.APISecret,
                    ApiKey: initData.APIKey
                };
                this.ws.login(request).subscribe((data: BinanceFutureLoginResponse) => {
                    if (data.IsSuccess) {
                        this._initData = initData;
                        observer.next({
                            result: true
                        });
                        this._initialize(data.Data);
                        this.ws.setConnectivity(true);
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
        if (this._onTickSubscription) {
            this._onTickSubscription.unsubscribe();
        }
        if (this._onLastPriceSubject) {
            this._onLastPriceSubject.unsubscribe();
        }
        if (this._onAccountUpdateSubscription) {
            this._onAccountUpdateSubscription.unsubscribe();
        }
        if (this._onOrderUpdateSubject) {
            this._onOrderUpdateSubject.unsubscribe();
        }
        if (this._onAccountUpdateSubject) {
            this._onAccountUpdateSubject.unsubscribe();
        }
        if (this._onPositionsUpdateSubject) {
            this._onPositionsUpdateSubject.unsubscribe();
        }
        if (this._onReconnectSubscription) {
            this._onReconnectSubscription.unsubscribe();
        }

        this._symbolToAsset = {};        

        this.ws.setConnectivity(false);
        this.ws.dispose();

        return of({
            result: true
        });
    }
    saveState(): Observable<IBrokerState<BinanceConnectionData>> {
        if (!this._initData) {
            return of(null);
        }

        return of({
            account: this._accountName,
            brokerType: this.instanceType,
            server: this._server,
            state: {
                APIKey: this._initData.APIKey,
                APISecret: this._initData.APISecret
            }
        });
    }
    loadSate(state: IBrokerState<any>): Observable<ActionResult> {
        return this.init(state.state);
    }

    instrumentToBrokerFormat(symbol: string): IInstrument {
        let searchingString = this._instrumentMappingService.tryMapInstrumentToBrokerFormat(symbol/*, this._serverName, this._accountInfo.Account*/);
        let isMapped = !!(searchingString);
        if (!searchingString) {
            searchingString = TradingHelper.normalizeInstrument(symbol);
        }

        for (const i of this._instruments) {
            if (!isMapped) {
                let instrumentID = TradingHelper.normalizeInstrument(i.id);
                let instrumentSymbol = TradingHelper.normalizeInstrument(i.symbol);
                if (searchingString === instrumentID || searchingString === instrumentSymbol) {
                    return i;
                }
            } else {
                if (searchingString === i.id || searchingString === i.symbol) {
                    return i;
                }
            }
        }

        return null;
    }

    protected _parseOrdersHistory(orders: IBinanceSpotHistoricalOrder[]): any[] {
        const response: any[] = [];

        // for (const order of orders) {
        //     response.push({
        //         Id: order.orderId,
        //         ExecutedSize: order.executedQty,
        //         Price: order.price,
        //         ExecutedPrice: order.avgPrice,
        //         Side: order.side === "SELL" ? OrderSide.Sell : OrderSide.Buy,
        //         Size: order.origQty,
        //         Status: order.status,
        //         Symbol: order.symbol,
        //         TIF: order.timeInForce,
        //         Time: order.time,
        //         StopPrice: order.stopPrice,
        //         Type: order.type as OrderTypes
        //     });
        // }
        // response.sort((a, b) => b.Time - a.Time);
        return response;
    }

    protected _parseOrders(orders: IBinanceSpotOrder[]): any[] {
        const response: any[] = [];

        // for (const order of orders) {
        //     response.push({
        //         Id: order.orderId,
        //         ExecutedSize: order.executedQty,
        //         Price: order.price,
        //         ExecutedPrice: order.avgPrice,
        //         StopPrice: order.stopPrice,
        //         Side: order.side === "SELL" ? OrderSide.Sell : OrderSide.Buy,
        //         Size: order.origQty,
        //         Status: order.status,
        //         Symbol: order.symbol,
        //         TIF: order.timeInForce,
        //         Time: order.time,
        //         Type: order.type as OrderTypes
        //     });
        // }
        // response.sort((a, b) => b.Time - a.Time);
        return response;
    }

    protected _parseTradesHistory(trades: IBinanceSpotTrade[]): any[] {
        const response: any[] = [];

        // for (const trade of trades) {
        //     response.push({
        //         Id: trade.Id,
        //         Commission: trade.Commission,
        //         CommissionAsset: trade.CommissionAsset,
        //         Price: trade.Price,
        //         QuoteSize: trade.quoteQty,
        //         Size: trade.qty,
        //         PNL: trade.RealizedPnl,
        //         Symbol: trade.Symbol,
        //         Time: trade.time,
        //         Side: trade.Side === "SELL" ? OrderSide.Sell : OrderSide.Buy,
        //     });
        // }
        // response.sort((a, b) => b.Time - a.Time);
        return response;
    }

    loadOrdersHistory(symbol: string, from: number, to: number): Observable<any[]> {
        return this.ws.getOrdersHistory(symbol, from, to).pipe(map((response: BinanceSpotOrderHistoryResponse) => {
            if (!response || !response.Data || !response.IsSuccess) {
                throw new Error(response.ErrorMessage || "Failed to load historical orders from Binance");
            }

            if (response.Data.Orders === null || response.Data.Orders === undefined) {
                throw new Error("Failed to load historical trades from Binance");
            }

            this.ordersHistory = this._parseOrdersHistory(response.Data.Orders);
            this.onHistoricalOrdersUpdated.next(this.ordersHistory);
            return this.ordersHistory;
        }));
    }

    loadTradesHistory(symbol: string, from: number, to: number): Observable<any[]> {
        return this.ws.getTradesHistory(symbol, from, to).pipe(map((response: BinanceSpotTradeHistoryResponse) => {
            if (!response || !response.Data || !response.IsSuccess) {
                throw new Error(response.ErrorMessage || "Failed to load historical trades from Binance");
            }

            if (response.Data.Trades === null || response.Data.Trades === undefined) {
                throw new Error("Failed to load historical trades from Binance");
            }

            this.tradesHistory = this._parseTradesHistory(response.Data.Trades);
            this.onHistoricalTradesUpdated.next(this.tradesHistory);
            return this.tradesHistory;
        }));
    }

    protected _loadPendingOrders() {
        return this.ws.getOpenOrders().subscribe((response: BinanceSpotOpenOrderResponse) => {
            if (!response || !response.Data || !response.IsSuccess) {
                throw new Error(response.ErrorMessage || "Failed to load pending orders from Binance");
            }

            if (response.Data.Orders === null || response.Data.Orders === undefined) {
                throw new Error("Failed to load historical trades from Binance");
            }

            this.orders = this._parseOrders(response.Data.Orders);
            this.onOrdersUpdated.next(this.orders);
            this._trySubscribeToAll();
        });
    }

    protected _handleLastPrice(quote: IBinancePrice) {
        if (this._updateInnerData(quote)) {
            return;
        }

        this._unsubscribeFromLastPrice(quote.Symbol);
    }

    protected _handleQuotes(quote: ITradeTick) {
        const subject = this._tickSubscribers[quote.symbol];
        if (subject && subject.observers.length > 0) {
            this._tickSubscribers[quote.symbol].next(quote);
        } else {
            if (subject) {
                subject.unsubscribe();
                delete this._tickSubscribers[quote.symbol];
                this.ws.unsubscribeOrderBook(quote.symbol).subscribe();
            }
        }
    }

    protected _reconnect() {
        if (!this._initData) {
            return;
        }

        const request = new BinanceSpotLoginRequest();
        request.Data = {
            ApiKey: this._initData.APIKey,
            ApiSecret: this._initData.APISecret
        };

        this.ws.sendAuth().subscribe(() => {
            this.ws.login(request).subscribe((data: BinanceFutureLoginResponse) => {
                if (data.IsSuccess) {
                    this._lastPriceSubscribers = [];
                    console.log("Reconnected");
                    this.ws.setConnectivity(true);
                } else {
                    console.error("Failed to Reconnected");
                }
            }, (error) => {
                console.error("Failed to Reconnected");
            });
        }, (error) => {
            console.error("Failed to Reconnected[Re-login]");
        });

    }

    protected _initialize(instruments: IBinanceSymbolData[]) {
        this._instrumentDecimals = {};
        this._instrumentContractSize = {};
        this._instrumentTickSize = {};
        this._instruments = [];
        this._lastPriceSubscribers = [];

        for (const instrument of instruments) {
            let precision = instrument.PricePrecision || 2;
            // let precision = 2;

            let tickSize = 1 / Math.pow(10, precision);

            this._instruments.push({
                id: instrument.Name,
                symbol: instrument.Name,
                company: instrument.Name,
                exchange: EExchange.Binance,
                datafeed: EExchangeInstance.BinanceExchange,
                type: instrument.Type as EMarketType,
                tickSize: tickSize,
                baseInstrument: instrument.BaseAsset,
                dependInstrument: instrument.QuoteAsset,
                pricePrecision: precision,
                tradable: true
            });

            this._instrumentDecimals[instrument.Name] = precision;
            this._instrumentContractSize[instrument.Name] = instrument.ContractSize || 1;
            this._instrumentTickSize[instrument.Name] = tickSize;
        }

        this.orders = [];
        this.ordersHistory = [];
        this.tradesHistory = [];

        this._loadPendingOrders();
    }

    protected _handleAccountUpdate(data: IBinanceSpotAccountInfoData) {
        if (!this._accountInfo) {
            this._accountInfo = {} as any;
        }

        const apiKeyLength = this._initData.APIKey.length;
        this._accountInfo.APIKey = this._initData.APIKey.slice(0, 1) + "******" + this._initData.APIKey.slice(apiKeyLength - 4, apiKeyLength);
        this.onAccountInfoUpdated.next(this._accountInfo);

        this._updateFunds(data.Balances);

        // this._updateAssets(data.Assets);
    }

    protected _updateFunds(balances: IBinanceSpotWalletBalance[]) {
        let changed = false;
        for (const brokerBalance of balances) {
            let exist = false;
            for (const existingFund of this.funds) {
                if (existingFund.Coin === brokerBalance.Asset) {
                    exist = true;
                    existingFund.AvailableBalance = brokerBalance.Free;
                    existingFund.LockedBalance = brokerBalance.Locked;
                    break;
                }
            }

            if (!exist) {
                changed = true;
                this.funds.push({
                    AvailableBalance: brokerBalance.Free,
                    Coin: brokerBalance.Asset,
                    LockedBalance: brokerBalance.Locked
                });
            }
        }

        for (let i = 0; i < this.funds.length; i++) {
            let existingFund = this.funds[i];
            let assetExist = false;
            for (const brokerBalance of balances) {
                if (existingFund.Coin === brokerBalance.Asset) {
                    assetExist = true;
                    break;
                }
            }

            if (!assetExist) {
                changed = true;
                this.funds.splice(i, 1);
                i--;
            }
        }

        if (changed) {
            this.onFundsUpdated.next(this.funds);
        }
    }

    protected _removeFromOrders(orderId: any) {
        let removed = false;
        for (let i = 0; i < this.orders.length; i++) {
            let order = this.orders[i];
            if (order.Id === orderId) {
                this.orders.splice(i, 1);
                i--;
                removed = true;
            }
        }

        if (removed) {
            this.onOrdersUpdated.next(this.orders);
        }
    }

    protected _handleOrderUpdate(update: IBinanceSpotOrderUpdateData) {
        // if (update.Status === FuturesOrderStatus.FILLED) {
        //     this._removeFromOrders(update.OrderId);
        // }

        // if (update.Status === FuturesOrderStatus.CANCELED ||
        //     update.Status === FuturesOrderStatus.EXPIRED ||
        //     update.Status === FuturesOrderStatus.REJECTED) {
        //     this._removeFromOrders(update.OrderId);
        // }

        // if (update.Status === FuturesOrderStatus.NEW) {
        //     for (let i = 0; i < this.orders.length; i++) {
        //         let order = this.orders[i];
        //         if (order.Id === update.OrderId) {
        //             return;
        //         }
        //     }
        //     this.orders.unshift({
        //         Id: update.OrderId,
        //         ExecutedSize: 0,
        //         Price: update.Price,
        //         ExecutedPrice: update.AveragePrice,
        //         StopPrice: update.StopPrice,
        //         Side: update.Side === "SELL" ? OrderSide.Sell : OrderSide.Buy,
        //         Size: update.Quantity,
        //         Status: update.Status,
        //         Symbol: update.Symbol,
        //         TIF: update.TimeInForce,
        //         Time: update.CreateTime,
        //         Type: update.Type as OrderTypes
        //     });

        //     this._trySubscribeToAll();
        // }

        // if (update.Status === FuturesOrderStatus.PARTIALLY_FILLED) {
        //     for (let i = 0; i < this.orders.length; i++) {
        //         let order = this.orders[i];
        //         if (order.Id === update.OrderId) {
        //             order.ExecutedSize = update.AccumulatedQuantityOfFilledTrades;
        //             order.Price = update.Price;
        //             order.ExecutedPrice = update.AveragePrice;
        //             order.StopPrice = update.StopPrice;
        //             order.Size = update.Quantity;
        //             order.Status = update.Status;
        //             order.Type = update.Type as OrderTypes;
        //             break;
        //         }
        //     }
        // }

        // this.onOrdersUpdated.next(this.orders);
    }

    protected _handleRealtimeAccountUpdate(update: any) {
        this._trySubscribeToAll();
    }

    protected _trySubscribeToAll() {
        for (const order of this.orders) {
            this._subscribeOnLastPrice(order.Symbol);
        }
    }

    protected _subscribeOnLastPrice(symbol: string) {
        if (this._lastPriceSubscribers.indexOf(symbol) >= 0) {
            return;
        }

        this._lastPriceSubscribers.push(symbol);
        this.ws.subscribeOnMarketPrice(symbol).subscribe();
        // this.ws.subscribeOnQuotes(symbol).subscribe();
    }

    protected _unsubscribeFromLastPrice(symbol: string) {
        const index = this._lastPriceSubscribers.indexOf(symbol);
        if (index < 0) {
            return;
        }

        this._lastPriceSubscribers.splice(index, 1);
        this.ws.unsubscribeFromMarketPrice(symbol).subscribe();
        // this.ws.unsubscribeFromQuotes(symbol).subscribe();
    }

    protected _updateInnerData(quote: IBinancePrice): boolean {
        let orderUpdated = false;
        for (const order of this.orders) {
            if (order.Symbol === quote.Symbol) {
                this._updateOrderByQuote(order, quote);
                orderUpdated = true;
            }
        }

        if (orderUpdated) {
            this.onOrdersParametersUpdated.next(this.orders);
        }

        return orderUpdated;
    }

    private _updateOrderByQuote(order: any, quote: IBinancePrice) {
        order.CurrentPrice = quote.Price;
    }
}