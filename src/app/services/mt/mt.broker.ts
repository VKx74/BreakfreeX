import { Observable, Subject, Observer, of, Subscription, throwError, forkJoin, combineLatest } from "rxjs";
import { IMT5Broker as IMTBroker } from '@app/interfaces/broker/mt.broker';
import { Injectable } from '@angular/core';
import { MTTradingAccount, MTPlaceOrder, MTEditOrder, MTOrder, MTPosition, MTConnectionData, MTEditOrderPrice, MTStatus, MTCurrencyRisk, MTCurrencyRiskType, MTHistoricalOrder, MTCurrencyVarRisk, MTOrderValidationChecklist, MTOrderValidationChecklistInput } from 'modules/Trading/models/forex/mt/mt.models';
import { EBrokerInstance, IBrokerState } from '@app/interfaces/broker/broker';
import { EExchange } from '@app/models/common/exchange';
import { IInstrument } from '@app/models/common/instrument';
import { OrderTypes, ActionResult, OrderSide, OrderExpirationType, OrderFillPolicy } from 'modules/Trading/models/models';
import { MTLoginRequest, MTLoginResponse, MTPlaceOrderRequest, MTEditOrderRequest, MTCloseOrderRequest, IMTAccountUpdatedData, IMTOrderData, MTGetOrderHistoryRequest, IMTSymbolData, MTSymbolTradeInfoResponse } from 'modules/Trading/models/forex/mt/mt.communication';
import { EMarketType } from '@app/models/common/marketType';
import { IMTTick } from '@app/models/common/tick';
import { ReadyStateConstants } from '@app/interfaces/socket/WebSocketConfig';
import { MTSocketService } from '../socket/mt.socket.service';
import { AlgoService, IBFTAMarketInfo, IBFTATrend } from "../algo.service";
import { InstrumentService } from "../instrument.service";
import { map } from "rxjs/operators";

export abstract class MTBroker implements IMTBroker {
    protected _tickSubscribers: { [symbol: string]: Subject<IMTTick>; } = {};
    protected _instrumentDecimals: { [symbol: string]: number; } = {};
    protected _instrumentTickSize: { [symbol: string]: number; } = {};
    protected _instrumentType: { [symbol: string]: string; } = {};
    protected _instrumentProfitMode: { [symbol: string]: string; } = {};
    protected _instrumentContractSizes: { [symbol: string]: number; } = {};
    protected _symbolTradeInfoCache: { [symbol: string]: MTSymbolTradeInfoResponse; } = {};
    protected _marketInfoCache: { [symbol: string]: IBFTAMarketInfo; } = {};

    protected _onAccountInfoUpdated: Subject<MTTradingAccount> = new Subject<MTTradingAccount>();
    protected _onOrdersUpdated: Subject<MTOrder[]> = new Subject<MTOrder[]>();
    protected _onHistoricalOrdersUpdated: Subject<MTOrder[]> = new Subject<MTOrder[]>();
    protected _onOrdersParametersUpdated: Subject<MTOrder[]> = new Subject<MTOrder[]>();
    protected _onPositionsUpdated: Subject<MTPosition[]> = new Subject<MTPosition[]>();
    protected _instruments: IInstrument[] = [];
    protected _onReconnectSubscription: Subscription;
    protected _onTickSubscription: Subscription;
    protected _onAccountUpdateSubscription: Subscription;
    protected _onOrdersUpdateSubscription: Subscription;

    protected _onSaveStateRequired: Subject<void> = new Subject();
    protected _initData: MTConnectionData;
    protected _accessToken: string = "";
    protected _orders: MTOrder[] = [];
    protected _ordersHistory: MTHistoricalOrder[] = [];
    protected _positions: MTPosition[] = [];
    protected _currencyRisks: MTCurrencyRisk[] = [];
    protected _accountInfo: MTTradingAccount = {
        Account: "",
        Balance: 0,
        Currency: "",
        CompanyName: "",
        Equity: 0,
        FreeMargin: 0,
        Margin: 0,
        Pl: 0
    };

    protected _lastUpdate: number;

    protected _endHistory: number = Math.round((new Date().getTime() / 1000) + (60 * 60 * 24));
    protected _startHistory: number = this._endHistory - (60 * 60 * 24 * 14);

    public get status(): MTStatus {
        if (!this._lastUpdate || this.ws.readyState !== ReadyStateConstants.OPEN) {
            return MTStatus.NoConnection;
        }

        const diff = (new Date().getTime() - this._lastUpdate) / 1000;
        if (diff < 10) {
            return MTStatus.Connected;
        }
        if (diff > 10 && diff < 60) {
            return MTStatus.Pending;
        }
        return MTStatus.NoConnection;
    }

    public get onSaveStateRequired(): Subject<void> {
        return this._onSaveStateRequired;
    }

    public get accessToken(): string {
        return this._accessToken;
    }

    public abstract get instanceType(): EBrokerInstance;

    public get onAccountInfoUpdated(): Subject<MTTradingAccount> {
        return this._onAccountInfoUpdated;
    }

    public get onOrdersUpdated(): Subject<MTOrder[]> {
        return this._onOrdersUpdated;
    }

    public get onHistoricalOrdersUpdated(): Subject<MTOrder[]> {
        return this._onHistoricalOrdersUpdated;
    }

    public get onOrdersParametersUpdated(): Subject<MTOrder[]> {
        return this._onOrdersParametersUpdated;
    }

    public get onPositionsUpdated(): Subject<MTPosition[]> {
        return this._onPositionsUpdated;
    }

    public get orders(): MTOrder[] {
        return this._orders;
    }

    public get marketOrders(): MTOrder[] {
        return this._orders.filter(order => order.Type === OrderTypes.Market);
    }

    public get pendingOrders(): MTOrder[] {
        return this._orders.filter(order => order.Type !== OrderTypes.Market);
    }

    public get ordersHistory(): MTHistoricalOrder[] {
        return this._ordersHistory;
    }

    public get positions(): MTPosition[] {
        return this._positions;
    }

    public get currencyRisks(): MTCurrencyRisk[] {
        return this._currencyRisks;
    }

    public get accountInfo(): MTTradingAccount {
        return this._accountInfo;
    }

    constructor(protected ws: MTSocketService, protected algoService: AlgoService) {

    }

    placeOrder(order: MTPlaceOrder): Observable<ActionResult> {
        const request = new MTPlaceOrderRequest();
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
            ExpirationDate: order.ExpirationDate,
            Timeframe: order.Timeframe,
            TradeType: order.TradeType,
            PlacedFrom: order.PlacedFrom
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

    editOrder(order: MTEditOrder): Observable<ActionResult> {
        const request = new MTEditOrderRequest();
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

    editOrderPrice(order: MTEditOrderPrice): Observable<ActionResult> {
        const request = new MTEditOrderRequest();
        const orderData = this.getOrderById(order.Ticket);

        if (!orderData) {
            return throwError("Orders not found by Id");
        }

        request.Data = {
            Comment: orderData.Comment || "",
            Price: order.Price || 0,
            Side: orderData.Side,
            Lots: orderData.Size,
            Symbol: orderData.Symbol,
            Type: orderData.Type,
            StopLoss: order.SL || 0,
            TakeProfit: order.TP || 0,
            ExpirationType: orderData.ExpirationType,
            ExpirationDate: orderData.ExpirationDate || 0,
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

    closePosition(symbol: string, fillPolicy: OrderFillPolicy): Observable<ActionResult> {
        let orders: MTOrder[] = [];

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
            const awaiter = this.closeOrder(order.Id, fillPolicy);
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

    closeOrder(order_id: any, fillPolicy: OrderFillPolicy, amount: number = null): Observable<ActionResult> {
        let order: MTOrder = null;

        for (const o of this._orders) {
            if (o.Id === order_id) {
                order = o;
                break;
            }
        }

        if (!order) {
            return throwError("Order not found");
        }

        const request = new MTCloseOrderRequest();
        request.Data = {
            Comment: order.Comment,
            Price: order.Price,
            Side: order.Side,
            Lots: amount ? amount : order.Size,
            Symbol: order.Symbol,
            Type: order.Type,
            Ticket: order.Id,
            FillPolicy: fillPolicy
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

    cancelOrder(order_id: any, fillPolicy: OrderFillPolicy): Observable<ActionResult> {
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

        const request = new MTCloseOrderRequest();
        request.Data = {
            Comment: order.Comment,
            Price: order.Price,
            Side: order.Side,
            Lots: order.Size,
            Symbol: order.Symbol,
            Type: order.Type,
            Ticket: order.Id,
            FillPolicy: fillPolicy
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
        if (!search) {
            return of(this._instruments.slice());
        }

        const filtered = this._instruments.filter(i => {
            const s = i.symbol.replace("/", "").replace("_", "").replace("-", "").replace("^", "").toLowerCase();
            return s.indexOf(search.toLowerCase()) !== -1;
        });

        return of(filtered.slice());
    }
    isInstrumentAvailable(instrument: IInstrument, orderType: OrderTypes = null): boolean {
        for (const i of this._instruments) {
            if (i.symbol === instrument.symbol) {
                return true;
            }
        }
        return false;
    }

    init(initData: MTConnectionData): Observable<ActionResult> {
        if (this._onTickSubscription) {
            this._onTickSubscription.unsubscribe();
        }
        if (this._onAccountUpdateSubscription) {
            this._onAccountUpdateSubscription.unsubscribe();
        }
        if (this._onOrdersUpdateSubscription) {
            this._onOrdersUpdateSubscription.unsubscribe();
        }
        if (this._onReconnectSubscription) {
            this._onReconnectSubscription.unsubscribe();
        }

        this._onTickSubscription = this.ws.tickSubject.subscribe(this._handleQuotes.bind(this));
        this._onAccountUpdateSubscription = this.ws.accountUpdatedSubject.subscribe(this._handleAccountUpdate.bind(this));
        this._onOrdersUpdateSubscription = this.ws.ordersUpdatedSubject.subscribe(this._handleOrdersUpdate.bind(this));
        this._onReconnectSubscription = this.ws.onReconnect.subscribe(() => {
            this._reconnect();
        });

        return new Observable<ActionResult>((observer: Observer<ActionResult>) => {
            this.ws.open().subscribe(value => {
                const request = new MTLoginRequest();
                request.Data = {
                    Password: initData.Password,
                    User: initData.Login,
                    ServerName: initData.ServerName
                };
                this.ws.login(request).subscribe((data: MTLoginResponse) => {
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
        if (this._onTickSubscription) {
            this._onTickSubscription.unsubscribe();
        }
        if (this._onAccountUpdateSubscription) {
            this._onAccountUpdateSubscription.unsubscribe();
        }
        if (this._onOrdersUpdateSubscription) {
            this._onOrdersUpdateSubscription.unsubscribe();
        }
        if (this._onReconnectSubscription) {
            this._onReconnectSubscription.unsubscribe();
        }

        this.ws.dispose();

        return of({
            result: true
        });
    }

    abstract saveState(): Observable<IBrokerState<any>>;

    abstract loadSate(state: IBrokerState<any>): Observable<ActionResult>;

    subscribeToTicks(symbol: string, subscription: (value: IMTTick) => void): Subscription {
        if (!this._tickSubscribers[symbol]) {
            this._tickSubscribers[symbol] = new Subject<IMTTick>();
            this.ws.subscribeOnQuotes(symbol).subscribe();
        }

        return this._tickSubscribers[symbol].subscribe(subscription);
    }

    getRelatedPositionsRisk(symbol: string, side: OrderSide): number {
        let res = 0;
        const s1 = this.instrumentToChartFormat(symbol);
        const s1Part1 = s1.substring(0, 3);
        const s1Part2 = s1.substring(3, 6);

        for (const order of this.orders) {
            const s2 = this.instrumentToChartFormat(order.Symbol);
            if (s2 === s1) {
                if (side === order.Side) {
                    res += order.Risk || 0;
                } else {
                    res -= order.Risk || 0;
                }
                continue;
            }

            if (!this._instrumentType[order.Symbol] || this._instrumentType[order.Symbol].toLowerCase() !== 'forex') {
                continue;
            }

            const s2Part1 = s2.substring(0, 3);
            const s2Part2 = s2.substring(3, 6);
            if (s2Part1 === s1Part1 || s2Part2 === s1Part2) {
                if (side === order.Side) {
                    res += order.Risk || 0;
                } else {
                    res -= order.Risk || 0;
                }
            } 
            
            if (s2Part1 === s1Part2 || s2Part2 === s1Part1) {
                if (side === order.Side) {
                    res -= order.Risk || 0;
                } else {
                    res += order.Risk || 0;
                }
            }
        }

        return res;

    }

    instrumentToChartFormat(symbol: string): string {
        let s = symbol;
        if (s.length > 6 && s[s.length - 2] === '-') {
            s = s.slice(0, s.length - 2);
        }
        s = s.replace("_", "").replace("/", "").replace("^", "").replace("-", "").toLowerCase();
        return s;
    }

    instrumentToBrokerFormat(symbol: string): IInstrument {
        const s1 = symbol.replace("_", "").replace("/", "").replace("^", "").replace("-", "").toLowerCase();

        for (const i of this._instruments) {
            const s2 = i.symbol.replace("/", "").replace("_", "").replace("-", "").replace("^", "").toLowerCase();
            if (s2 === s1) {
                return i;
            }
        }

        for (const i of this._instruments) {
            const s2 = i.symbol.replace("/", "").replace("_", "").replace("-", "").replace("^", "").toLowerCase();
            if (s2.startsWith(s1)) {
                return i;
            }
        }

        return null;
    }

    getOrderById(orderId: number): MTOrder {
        for (const o of this._orders) {
            if (o.Id === orderId) {
                return o;
            }
        }
    }

    getPrice(symbol: string): Observable<IMTTick> {
        return new Observable<IMTTick>((observer: Observer<IMTTick>) => {
            this.ws.getPrice(symbol).subscribe((response) => {
                if (response.IsSuccess) {
                    observer.next({
                        ask: response.Data.Ask,
                        bid: response.Data.Bid,
                        last: response.Data.Last,
                        symbol: response.Data.Symbol,
                        volume: response.Data.Volume
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

    protected _initialize(instruments: IMTSymbolData[]) {
        this._instrumentDecimals = {};
        this._instrumentTickSize = {};
        this._instrumentType = {};
        this._instrumentProfitMode = {};
        this._instrumentContractSizes = {};
        this._instruments = [];

        for (const instrument of instruments) {
            let tickSize = 1 / Math.pow(10, instrument.Digits);
            if (instrument.Digits === 0) {
                tickSize = 1;
            }
            this._instruments.push({
                id: instrument.Name,
                symbol: instrument.Name,
                company: instrument.Description,
                exchange: null,
                datafeed: null,
                type: instrument.CalculatioType as EMarketType,
                tickSize: tickSize,
                baseInstrument: "",
                dependInstrument: "",
                pricePrecision: instrument.Digits,
                tradable: true
            });

            this._instrumentDecimals[instrument.Name] = instrument.Digits;
            this._instrumentTickSize[instrument.Name] = tickSize;
            this._instrumentType[instrument.Name] = instrument.CalculatioType;
            this._instrumentProfitMode[instrument.Name] = instrument.ProfitMode;

            if (instrument.ContractSize) {
                this._instrumentContractSizes[instrument.Name] = instrument.ContractSize;
            }
        }

        this._orders = [];
        this._accountInfo.Account = this._initData.Login.toString();
        this._loadHistory();
    }

    public instrumentDecimals(symbol: string): number {
        if (this._instrumentDecimals[symbol] !== undefined) {
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

    public instrumentContractSize(symbol: string): number {
        if (this._instrumentContractSizes[symbol]) {
            return this._instrumentContractSizes[symbol];
        }
    }

    public instrumentMinAmount(symbol: string): number {
        return 0.01;
    }

    public instrumentAmountStep(symbol: string): number {
        return 0.01;
    }

    public calculateOrderChecklist(parameters: MTOrderValidationChecklistInput): Observable<MTOrderValidationChecklist> {
        const symbol = this.instrumentToChartFormat(parameters.Symbol);

        let marketInfo = this._tryGetMarketInfoFromCache(symbol);
        if (!marketInfo) {
            marketInfo = this.algoService.getMarketInfo(symbol);
        }

        let symbolTradeInfo = this._tryGetSymbolTradeInfoFromCache(parameters.Symbol);
        if (!symbolTradeInfo) {
            symbolTradeInfo = this.ws.getSymbolTradeInfo(parameters.Symbol);
        }

        return combineLatest([marketInfo, symbolTradeInfo]).pipe(map(([res1, res2]) => {
            if (res1) {
                this._tryAddMarketInfoToCache(symbol, res1);
            } 
            
            if (res2 && res2.Data && res2.Data.CVaR && res2.Data.ContractSize && res2.Data.Rate) {
                this._tryAddSymbolTradeInfoToCache(parameters.Symbol, res2);
            }

            return this._calculateOrderChecklist(res1, res2, parameters);
        }));
    }

    public canCalculateTotalVAR(orderType?: OrderTypes): boolean {
        for (const order of this.orders) {
            if (orderType && orderType !== order.Type) {
                continue;
            }

            if (!order.Risk) {
                return false;
            }
        }
        return true;
    }

    public calculateTotalVAR(orderType?: OrderTypes): number {
        let res = 0;
        for (const order of this.orders) {
            if (orderType && orderType !== order.Type) {
                continue;
            }
            
            if (order.RiskPercentage) {
                res += order.RiskPercentage;
            }
        }

        return res;
    }

    private _calculateOrderChecklist(marketInfo: IBFTAMarketInfo, symbolTradeInfo: MTSymbolTradeInfoResponse, parameters: MTOrderValidationChecklistInput): MTOrderValidationChecklist {
        let result: MTOrderValidationChecklist = {};

        if (marketInfo) {
            let allowedDiff = Math.abs(marketInfo.natural - marketInfo.support) / 5;
            if (parameters.Side === OrderSide.Buy) {
                result.GlobalRTD = marketInfo.global_trend === IBFTATrend.Up;
                result.LocalRTD = marketInfo.local_trend === IBFTATrend.Up;

                let priceToTargetDiff = Math.abs(marketInfo.resistance - marketInfo.last_price);
                if (marketInfo.last_price >= marketInfo.resistance || allowedDiff > priceToTargetDiff) {
                    result.Levels = false;
                } else {
                    result.Levels = true;
                }
            } else {
                result.GlobalRTD = marketInfo.global_trend === IBFTATrend.Down;
                result.LocalRTD = marketInfo.local_trend === IBFTATrend.Down;

                let priceToTargetDiff = Math.abs(marketInfo.support - marketInfo.last_price);
                if (marketInfo.last_price <= marketInfo.support || allowedDiff > priceToTargetDiff) {
                    result.Levels = false;
                } else {
                    result.Levels = true;
                }
            }

            result.GlobalRTDValue = marketInfo.global_trend;
            result.LocalRTDValue = marketInfo.local_trend;
        }

        if (symbolTradeInfo && symbolTradeInfo.Data) {
            let price = parameters.Price || (symbolTradeInfo.Data.Bid + symbolTradeInfo.Data.Ask) / 2;
            let contractSize = symbolTradeInfo.Data.ContractSize;
            let rate = symbolTradeInfo.Data.Rate;
            let cvar = symbolTradeInfo.Data.CVaR;
            let bid = symbolTradeInfo.Data.Bid;
            let ask = symbolTradeInfo.Data.Ask;
            if (price) {
                if (parameters.SL) {
                    result.RiskValue = this._buildRiskByPrice(contractSize, rate, parameters.Size, price, parameters.SL);
                } else if (cvar) {
                    result.RiskValue = this._buildRiskByVAR(contractSize, rate, parameters.Size, price, cvar);
                }
            }
            
            if (bid && ask) {
                result.SpreadRiskValue = Math.abs(bid - ask) / Math.min(bid, ask) * 100;
                result.SpreadRisk = result.SpreadRiskValue < 0.1;
            } else {
                result.SpreadRisk = null;
            }

            if (result.RiskValue) {
                result.Risk = result.RiskValue < 15;
            } else {
                result.Risk = null;
            }
        }

        let correlatedRisk = this.getRelatedPositionsRisk(parameters.Symbol, parameters.Side);
        result.CorrelatedRiskValue = Math.abs((correlatedRisk / this.accountInfo.Balance * 100) + result.RiskValue);
        result.CorrelatedRisk = result.CorrelatedRiskValue < 15;
        return result;
    }

    protected _tryGetSymbolTradeInfoFromCache(instrument: string): Observable<MTSymbolTradeInfoResponse> {
        if (this._symbolTradeInfoCache[instrument]) {
            return of(this._symbolTradeInfoCache[instrument]);
        }

        return null;
    }

    protected _tryAddSymbolTradeInfoToCache(instrument: string, data: MTSymbolTradeInfoResponse) {
        this._symbolTradeInfoCache[instrument] = data;
    }

    protected _tryGetMarketInfoFromCache(instrument: string): Observable<IBFTAMarketInfo> {
        if (this._marketInfoCache[instrument]) {
            return of(this._marketInfoCache[instrument]);
        }

        return null;
    }

    protected _tryAddMarketInfoToCache(instrument: string, data: IBFTAMarketInfo) {
        this._marketInfoCache[instrument] = data;
    }

    protected _reconnect() {
        if (!this._initData) {
            return;
        }

        const initData = this._initData;
        const request = new MTLoginRequest();
        request.Data = {
            Password: initData.Password,
            User: initData.Login,
            ServerName: initData.ServerName
        };

        this.ws.sendAuth().subscribe(() => {
            this.ws.login(request).subscribe((data: MTLoginResponse) => {
                if (data.IsSuccess) {
                    console.log("Reconnected");
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

    protected _handleQuotes(quote: IMTTick) {
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

    protected _handleAccountUpdate(data: IMTAccountUpdatedData) {
        this._accountInfo.Balance = data.Balance;
        this._accountInfo.Currency = data.Currency;
        this._accountInfo.Equity = data.Equity;
        this._accountInfo.FreeMargin = data.FreeMargin;
        this._accountInfo.Margin = data.Margin;
        this._accountInfo.Pl = data.Profit;
        this._accountInfo.CompanyName = data.CompanyName;
        this._lastUpdate = new Date().getTime();

        this.onAccountInfoUpdated.next(this._accountInfo);
    }

    protected _calculatePipPL(order: MTOrder) {

        if (!order.Price || !order.CurrentPrice) {
            return;
        }
        const priceDiff = order.Side === OrderSide.Buy ? order.CurrentPrice - order.Price : order.Price - order.CurrentPrice;
        const pipSize = this.instrumentTickSize(order.Symbol) * 10;

        order.PipPL = priceDiff / pipSize;
    }

    protected _handleOrdersUpdate(data: IMTOrderData[]) {
        let updateRequired = false;
        let changedOrders: MTOrder[] = [];

        for (const newOrder of data) {
            let exists = false;
            for (const existingOrder of this._orders) {
                if (existingOrder.Id === newOrder.Ticket) {
                    existingOrder.CurrentPrice = newOrder.CurrentPrice ? newOrder.CurrentPrice : null;
                    existingOrder.Comment = newOrder.Comment ? newOrder.Comment : null;
                    existingOrder.Commission = newOrder.Commission ? newOrder.Commission : null;
                    existingOrder.Swap = newOrder.Swap ? newOrder.Swap : null;
                    existingOrder.ProfitRate = newOrder.ProfitRate;

                    existingOrder.Time = newOrder.OpenTime;
                    existingOrder.ExpirationType = this._getOrderExpiration(newOrder.ExpirationType, newOrder.ExpirationDate);
                    existingOrder.ExpirationDate = newOrder.ExpirationDate ? newOrder.ExpirationDate : null;

                    const type = this._getOrderType(newOrder.Type);
                    const status = newOrder.State;
                    const sl = newOrder.StopLoss ? newOrder.StopLoss : null;
                    const tp = newOrder.TakeProfit ? newOrder.TakeProfit : null;
                    const price = newOrder.OpenPrice ? newOrder.OpenPrice : null;
                    const size = newOrder.Lots;
                    const netPl = newOrder.Profit;
                    const contractSize = newOrder.ContractSize;
                    const VAR = newOrder.VarRisk;

                    if (existingOrder.SL !== sl || existingOrder.TP !== tp || existingOrder.Price !== price ||
                        existingOrder.Size !== size || existingOrder.NetPL !== netPl || existingOrder.Type !== type ||
                        existingOrder.Status !== status || existingOrder.ContractSize !== contractSize || existingOrder.VAR !== VAR) {
                        changedOrders.push(existingOrder);
                    }

                    if (existingOrder.SL !== sl || existingOrder.TP !== tp || existingOrder.Type !== type || existingOrder.Status !== status) {
                        updateRequired = true;
                    }

                    existingOrder.ContractSize = contractSize;
                    existingOrder.Type = type;
                    existingOrder.Status = status;
                    existingOrder.SL = sl;
                    existingOrder.TP = tp;
                    existingOrder.Price = price;
                    existingOrder.Size = size;
                    existingOrder.NetPL = netPl;
                    existingOrder.VAR = VAR;

                    this._calculatePipPL(existingOrder);
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                updateRequired = true;
                const ord = this._createOrder(newOrder);
                this._orders.push(ord);
            }
        }

        for (let i = 0; i < this._orders.length; i++) {
            let existingOrder = this._orders[i];
            let exists = false;
            for (const newOrder of data) {
                if (existingOrder.Id === newOrder.Ticket) {
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

        this._buildPositions();
        this._buildRates();
        this._buildCurrencyRisks();

        if (changedOrders.length && !updateRequired) {
            this.onOrdersParametersUpdated.next(changedOrders);
        }

        if (updateRequired) {
            this.onOrdersUpdated.next(this._orders);
            this._loadHistory();
        }
    }

    protected _createOrder(data: IMTOrderData): MTOrder {
        const ord: MTOrder = {
            Id: data.Ticket,
            CurrentPrice: data.CurrentPrice ? data.CurrentPrice : null,
            SL: data.StopLoss ? data.StopLoss : null,
            TP: data.TakeProfit ? data.TakeProfit : null,
            Price: data.OpenPrice ? data.OpenPrice : null,
            Comment: data.Comment ? data.Comment : null,
            Commission: data.Commission ? data.Commission : null,
            Swap: data.Swap ? data.Swap : null,
            Size: data.Lots,
            Type: this._getOrderType(data.Type),
            Time: data.OpenTime,
            NetPL: data.Profit,
            Status: data.State,
            VAR: data.VarRisk,
            ExpirationType: this._getOrderExpiration(data.ExpirationType, data.ExpirationDate),
            ExpirationDate: data.ExpirationDate ? data.ExpirationDate : null,
            Side: this._getOrderSide(data.Side),
            Symbol: data.Symbol,
            PipPL: null
        };

        this._calculatePipPL(ord);

        return ord;
    } 
    
    protected _createHistoricalOrder(data: IMTOrderData): MTHistoricalOrder {
        const ord: MTHistoricalOrder = {
            Id: data.Ticket,
            CurrentPrice: data.CurrentPrice ? data.CurrentPrice : null,
            SL: data.StopLoss ? data.StopLoss : null,
            TP: data.TakeProfit ? data.TakeProfit : null,
            Price: data.OpenPrice ? data.OpenPrice : null,
            Comment: data.Comment ? data.Comment : null,
            Commission: data.Commission ? data.Commission : null,
            Swap: data.Swap ? data.Swap : null,
            Size: data.Lots,
            Type: this._getOrderType(data.Type),
            Time: data.OpenTime,
            NetPL: data.Profit,
            Status: data.State,
            VAR: data.VarRisk,
            ExpirationType: this._getOrderExpiration(data.ExpirationType, data.ExpirationDate),
            ExpirationDate: data.ExpirationDate ? data.ExpirationDate : null,
            Side: this._getOrderSide(data.Side),
            Symbol: data.Symbol,
            PipPL: null,
            CloseTime: data.CloseTime
        };

        this._calculatePipPL(ord);

        return ord;
    }

    protected _loadHistory() {
        const request = new MTGetOrderHistoryRequest();
        request.Data = {
            From: this._startHistory,
            To: this._endHistory
        };

        this.ws.getOrderHistory(request).subscribe((data) => {
            this._ordersHistory = [];

            if (!data.Data) {
                return;
            }
            
            for (const order of data.Data) {
                const ord = this._createHistoricalOrder(order);

                if (ord.Type !== OrderTypes.Market) {
                    continue;
                }

                this._ordersHistory.push(ord);
            }
            this._ordersHistory.sort((a, b) => b.CloseTime - a.CloseTime);
            this._onHistoricalOrdersUpdated.next(this._ordersHistory);
        });
    }

    protected _buildRiskByVAR(contractSize: number, profitRate: number, size: number, price: number, cvar: number) {
        let diff = price / 100 * cvar;
        let riskNet = diff * size * contractSize;
        // if (profitRate === 0) {
        //     riskNet = riskNet / price;
        // } else 
        if (profitRate) {
            riskNet = riskNet * profitRate;
        }
        return riskNet / this.accountInfo.Balance * 100;
    } 
    
    protected _buildRiskByPrice(contractSize: number, profitRate: number, size: number, price1: number, price2: number) {
        let diff = Math.abs(price1 - price2);
        let riskNet = diff * size * contractSize;
        // if (profitRate === 0) {
        //     riskNet = riskNet / price;
        // } else 
        if (profitRate) {
            riskNet = riskNet * profitRate;
        }
        return riskNet / this.accountInfo.Balance * 100;
    }

    protected _buildRates() {
        for (const order of this._orders) {
            let risk = 0;
            let contractSize = order.ContractSize;

            if (!contractSize) {
                order.Risk = 0;
                order.RiskPercentage = 0;
                continue;
            }

            if (order.SL) {
                risk = this._buildRiskByPrice(contractSize, order.ProfitRate, order.Size, order.Price, order.SL);
            } else if (order.VAR) {
                risk = order.VAR;
            }

            if (!risk) {
                order.Risk = 0;
                order.RiskPercentage = 0;
                continue;
            }

            order.Risk = Math.roundToDecimals(this.accountInfo.Balance / 100 * risk, 2);
            order.RiskPercentage = Math.roundToDecimals(risk, 2);
        }
    }

    protected _createEmptyRisk(currency: string, type: MTCurrencyRiskType): MTCurrencyRisk {
        return {
            Currency: currency,
            OrdersCount: 0,
            Risk: 0,
            RiskPercentage: 0,
            Type: type,
            Side: OrderSide.Buy
        };
    }

    protected _buildCurrencyRisks() {
        const actualRisks: { [symbol: string]: MTCurrencyRisk } = {};
        const pendingRisks: { [symbol: string]: MTCurrencyRisk } = {};
        for (const order of this._orders) {
            if (!order.Risk) {
                continue;
            }

            const s1 = this.instrumentToChartFormat(order.Symbol).toUpperCase();
            const s1Part1 = s1.substring(0, 3).toUpperCase();
            const s1Part2 = s1.substring(3, 6).toUpperCase();

            const riskRef = order.Type === OrderTypes.Market ? actualRisks : pendingRisks;
            const type = order.Type === OrderTypes.Market ? MTCurrencyRiskType.Actual : MTCurrencyRiskType.Pending;

            if (this._instrumentType[order.Symbol] && this._instrumentType[order.Symbol].toLowerCase() === 'forex') {
                if (!riskRef[s1Part1]) {
                    riskRef[s1Part1] = this._createEmptyRisk(s1Part1, type);
                }
                if (!riskRef[s1Part2]) {
                    riskRef[s1Part2] = this._createEmptyRisk(s1Part2, type);
                }

                const r1 = order.Side === OrderSide.Buy ? order.Risk : order.Risk * -1;
                const r2 = order.Side === OrderSide.Sell ? order.Risk : order.Risk * -1;
                riskRef[s1Part1].Risk += r1;
                riskRef[s1Part2].Risk += r2;
                riskRef[s1Part1].OrdersCount++;
                riskRef[s1Part2].OrdersCount++;

            } else {
                if (!riskRef[s1]) {
                    riskRef[s1] = this._createEmptyRisk(s1, type);
                }

                const r = order.Side === OrderSide.Buy ? order.Risk : order.Risk * -1;
                riskRef[s1].Risk += r;
                riskRef[s1].OrdersCount++;
            }
        }

        for (let i = 0; i < this._currencyRisks.length; i++) {
            let currencyRisk = this._currencyRisks[i];

            if (currencyRisk.Type === MTCurrencyRiskType.Actual) {
                if (actualRisks[currencyRisk.Currency] && actualRisks[currencyRisk.Currency].Risk) {
                    const risk = actualRisks[currencyRisk.Currency];
                    delete actualRisks[currencyRisk.Currency];
                    currencyRisk.OrdersCount = risk.OrdersCount;
                    currencyRisk.Risk = risk.Risk;
                } else {
                    this._currencyRisks.splice(i, 1);
                    i--;
                }
            } else {
                if (pendingRisks[currencyRisk.Currency] && pendingRisks[currencyRisk.Currency].Risk) {
                    const risk = pendingRisks[currencyRisk.Currency];
                    delete pendingRisks[currencyRisk.Currency];
                    currencyRisk.OrdersCount = risk.OrdersCount;
                    currencyRisk.Risk = risk.Risk;
                } else {
                    this._currencyRisks.splice(i, 1);
                    i--;
                }
            }
        } 

        for (const i in actualRisks) {
            if (actualRisks[i] && actualRisks[i].Risk) {
                this._currencyRisks.push(actualRisks[i]);
            }
        }

        for (const i in pendingRisks) {
            if (pendingRisks[i] && pendingRisks[i].Risk) {
                this._currencyRisks.push(pendingRisks[i]);
            }
        }

        for (const risk of this._currencyRisks) {
            risk.Side = risk.Risk > 0 ? OrderSide.Buy : OrderSide.Sell;
            risk.Risk = Math.abs(risk.Risk);
            risk.RiskPercentage = Math.roundToDecimals(risk.Risk / this.accountInfo.Balance * 100, 2);
            risk.Risk = Math.roundToDecimals(risk.Risk, 2);
        }
    }

    protected _buildPositions() {
        const positions: { [symbol: string]: MTPosition } = {};
        this.accountInfo.Risk = 0;
        this.accountInfo.RiskPercentage = 0;
        for (const order of this._orders) {
            if (order.Type !== OrderTypes.Market) {
                continue;
            }

            if (order.Risk) {
                if (!this.accountInfo.Risk) {
                    this.accountInfo.Risk = 0;
                }
                this.accountInfo.Risk += order.Risk;
            }

            if (order.RiskPercentage) {
                if (!this.accountInfo.RiskPercentage) {
                    this.accountInfo.RiskPercentage = 0;
                }
                this.accountInfo.RiskPercentage += order.RiskPercentage;
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
                existingPosition.RiskPercentage = pos.RiskPercentage;
                existingPosition.Risk = pos.Risk;
                existingPosition.VAR = pos.VAR;

            } else {
                updateRequired = true;
                this._positions.splice(i, 1);
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

    protected _updatePositionByOrder(position: MTPosition, order: MTOrder) {
        // todo: check market orders

        const totalPrice = (position.Size * position.Price) + (order.Size * order.Price);
        const avgPrice = totalPrice / (position.Size + order.Size);
        
        if (order.Risk) {
            if (!position.Risk) {
                position.Risk = 0;
            }
            position.Risk += order.Risk;
        }
        
        if (order.VAR) {
            if (!position.VAR) {
                position.VAR = 0;
            }
            position.VAR += order.VAR;
        }

        if (order.RiskPercentage) {
            if (!position.RiskPercentage) {
                position.RiskPercentage = 0;
            }
            position.RiskPercentage += order.RiskPercentage;
        }

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

    protected _createPositionByOrder(order: MTOrder): MTPosition {
        return {
            Symbol: order.Symbol,
            Price: order.Price,
            Side: order.Side,
            Size: order.Size,
            Commission: order.Commission,
            Swap: order.Swap,
            NetPL: order.NetPL,
            PipPL: order.PipPL,
            Risk: order.Risk,
            RiskPercentage: order.RiskPercentage,
            CurrentPrice: order.CurrentPrice,
            VAR: order.VAR || 0
        };
    }

    protected _getOrderType(type: string): OrderTypes {
        if (OrderTypes.Market.toLowerCase() === type.toLowerCase()) {
            return OrderTypes.Market;
        }
        if (OrderTypes.Limit.toLowerCase() === type.toLowerCase()) {
            return OrderTypes.Limit;
        }
        if (OrderTypes.Stop.toLowerCase() === type.toLowerCase()) {
            return OrderTypes.Stop;
        }
        if (OrderTypes.StopLimit.toLowerCase() === type.toLowerCase()) {
            return OrderTypes.StopLimit;
        }

        return type as OrderTypes;
    }

    protected _getOrderSide(side: string): OrderSide {
        if (OrderSide.Buy.toLowerCase() === side.toLowerCase()) {
            return OrderSide.Buy;
        }
        if (OrderSide.Sell.toLowerCase() === side.toLowerCase()) {
            return OrderSide.Sell;
        }

        return side as OrderSide;
    }

    protected _getOrderExpiration(expiration: string, expValue: number): OrderExpirationType {
        if (!expiration && expValue) {
            return OrderExpirationType.Specified;
        }

        if (!expiration) {
            return OrderExpirationType.GTC;
        }

        if (OrderExpirationType.GTC.toLowerCase() === expiration.toLowerCase()) {
            return OrderExpirationType.GTC;
        }
        if (OrderExpirationType.Specified.toLowerCase() === expiration.toLowerCase()) {
            return OrderExpirationType.Specified;
        }
        if (OrderExpirationType.Today.toLowerCase() === expiration.toLowerCase()) {
            return OrderExpirationType.Today;
        }

        return expiration as OrderExpirationType;
    }
}