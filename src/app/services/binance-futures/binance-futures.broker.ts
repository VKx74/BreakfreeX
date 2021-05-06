import { EBrokerInstance, IBroker, IBrokerState, IPositionBasedBroker } from "@app/interfaces/broker/broker";
import { EExchangeInstance } from "@app/interfaces/exchange/exchange";
import { ReadyStateConstants } from "@app/interfaces/socket/WebSocketConfig";
import { EExchange } from "@app/models/common/exchange";
import { IInstrument } from "@app/models/common/instrument";
import { EMarketType } from "@app/models/common/marketType";
import { ITradeTick } from "@app/models/common/tick";
import { BinanceFutureBookPriceResponse, BinanceFutureLoginRequest, BinanceFutureLoginResponse, BinanceFutureOpenOrderResponse, BinanceFutureOrderHistoryResponse, BinanceFutureTradeHistoryResponse, FuturesOrderStatus, IBinanceFutureAccountInfoData, IBinanceFutureAsset, IBinanceFutureHistoricalOrder, IBinanceFutureOrder, IBinanceFuturePosition, IBinanceFutureTrade, IBinanceFuturesOrderUpdateData, IBinanceFuturesAccountUpdateData } from "modules/Trading/models/crypto/binance-futures/binance-futures.communication";
import { BinanceFuturesAsset, BinanceFuturesHistoricalOrder, BinanceFuturesHistoricalTrade, BinanceFuturesOrder, BinanceFuturesPosition, BinanceFuturesTradingAccount, IBinanceFuturesPlaceOrderData } from "modules/Trading/models/crypto/binance-futures/binance-futures.models";
import { BinanceConnectionData } from "modules/Trading/models/crypto/binance/binance.models";
import { IBinancePrice, IBinanceSymbolData } from "modules/Trading/models/crypto/shared/models.communication";
import { ActionResult, BrokerConnectivityStatus, IOrder, IPosition, OrderSide, OrderTypes } from "modules/Trading/models/models";
import { Subject, Observable, of, Subscription, Observer, throwError, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { AlgoService } from "../algo.service";
import { InstrumentMappingService } from "../instrument-mapping.service";
import { TradingHelper } from "../mt/mt.helper";
import { BinanceFuturesSocketService } from "../socket/binance-futures.socket.service";

export abstract class BinanceFuturesBroker implements IBroker, IPositionBasedBroker {
    protected _accountInfo: BinanceFuturesTradingAccount;
    protected _initData: BinanceConnectionData;
    protected _positions: BinanceFuturesPosition[] = [];
    protected _assets: BinanceFuturesAsset[] = [];
    protected _lastPriceSubscribers: string[] = [];
    protected _symbolToAsset: { [key: string]: string; } = {};
    protected _tickSubscribers: { [symbol: string]: Subject<ITradeTick>; } = {};
    protected _instrumentDecimals: { [symbol: string]: number; } = {};
    protected _instrumentTickSize: { [symbol: string]: number; } = {};
    protected _instrumentContractSize: { [symbol: string]: number; } = {};
    protected _instruments: IInstrument[] = [];
    protected _onAccountUpdateSubscription: Subscription;
    protected _onReconnectSubscription: Subscription;
    protected _onTickSubscription: Subscription;
    protected _onLastPriceSubject: Subscription;
    protected _onOrderUpdateSubject: Subscription;
    protected _onAccountUpdateSubject: Subscription;
    protected _onPositionsUpdateSubject: Subscription;

    protected abstract get _accountName(): string;
    protected abstract get _server(): string;

    abstract instanceType: EBrokerInstance;

    onAccountInfoUpdated: Subject<BinanceFuturesTradingAccount> = new Subject<BinanceFuturesTradingAccount>();
    onOrdersUpdated: Subject<BinanceFuturesOrder[]> = new Subject<BinanceFuturesOrder[]>();
    onOrdersParametersUpdated: Subject<BinanceFuturesOrder[]> = new Subject<BinanceFuturesOrder[]>();
    onHistoricalOrdersUpdated: Subject<BinanceFuturesHistoricalOrder[]> = new Subject<BinanceFuturesHistoricalOrder[]>();
    onHistoricalTradesUpdated: Subject<BinanceFuturesHistoricalTrade[]> = new Subject<BinanceFuturesHistoricalTrade[]>();
    onPositionsUpdated: Subject<BinanceFuturesPosition[]> = new Subject<BinanceFuturesPosition[]>();
    onPositionsParametersUpdated: Subject<BinanceFuturesPosition[]> = new Subject<BinanceFuturesPosition[]>();
    onAssetsUpdated: Subject<BinanceFuturesAsset[]> = new Subject<BinanceFuturesAsset[]>();
    onSaveStateRequired: Subject<void> = new Subject;

    orders: BinanceFuturesOrder[] = [];
    ordersHistory: BinanceFuturesHistoricalOrder[] = [];
    tradesHistory: BinanceFuturesHistoricalTrade[] = [];

    public get pendingOrders(): BinanceFuturesOrder[] {
        return this.orders.filter(order => order.Type.toLowerCase() !== OrderTypes.Market.toLowerCase());
    }

    public get marketOrders(): BinanceFuturesOrder[] {
        return this.orders.filter(order => order.Type.toLowerCase() === OrderTypes.Market.toLowerCase());
    }

    public get status(): BrokerConnectivityStatus {
        if (this.ws.readyState === ReadyStateConstants.OPEN) {
            return BrokerConnectivityStatus.Connected;
        }

        return BrokerConnectivityStatus.NoConnection;
    }

    public get accountInfo(): BinanceFuturesTradingAccount {
        return this._accountInfo;
    }

    public get positions(): BinanceFuturesPosition[] {
        return this._positions;
    }

    public get assets(): BinanceFuturesAsset[] {
        return this._assets;
    }

    public get isOrderEditAvailable(): boolean {
        return false;
    }

    public get isPositionBased(): boolean {
        return true;
    }

    public get server(): string {
        return this._server;
    }

    constructor(protected ws: BinanceFuturesSocketService, protected algoService: AlgoService, protected _instrumentMappingService: InstrumentMappingService) {
    }

    placeOrder(order: IBinanceFuturesPlaceOrderData): Observable<ActionResult> {
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
    closePosition(symbol: string): Observable<ActionResult> {
        let position: IPosition;

        for (const p of this.positions) {
            if (p.Symbol === symbol) {
                position = p;
            }
        }

        if (!position) {
            return throwError("Position not found");
        }

        let placeOrderRequest: IBinanceFuturesPlaceOrderData = {
            Side: position.Side === OrderSide.Buy ? OrderSide.Sell : OrderSide.Buy,
            Size: Math.abs(position.Size),
            Symbol: position.Symbol,
            Type: OrderTypes.Market
        };

        return this.placeOrder(placeOrderRequest).pipe(map((data: ActionResult) => {
            if (data.result) {
                // this._removeFromPositions(symbol);
            }
            return data;
        }));
    }
    cancelOrder(order: any): Observable<ActionResult> {
        let specificOrder: IOrder;

        for (const o of this.orders) {
            if (o.Id === order) {
                specificOrder = o;
            }
        }

        if (!specificOrder) {
            return throwError("Order not found");
        }

        return new Observable<ActionResult>((observer: Observer<ActionResult>) => {
            this.ws.closeOrder(specificOrder.Symbol, specificOrder.Id).subscribe((response) => {
                if (response.IsSuccess) {
                    observer.next({ result: true });
                    // this._removeFromOrders(specificOrder.Id);
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
            this.ws.getBookPrice(symbol).subscribe((response: BinanceFutureBookPriceResponse) => {
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
        this._onPositionsUpdateSubject = this.ws.positionsUpdateSubject.subscribe(this._handlePositionsUpdate.bind(this));
        this._onAccountUpdateSubscription = this.ws.accountInfoReceivedSubject.subscribe(this._handleAccountUpdate.bind(this));
        this._onReconnectSubscription = this.ws.onReconnect.subscribe(() => {
            this._reconnect();
        });

        return new Observable<ActionResult>((observer: Observer<ActionResult>) => {
            this.ws.setEnvironment(initData.BinanceEnvironment);
            this.ws.open().subscribe(value => {
                const request = new BinanceFutureLoginRequest(this.ws.type);
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
                        this.ws.close();
                    }
                    observer.complete();
                }, (error) => {
                    observer.error(error);
                    observer.complete();
                    this.ws.close();
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
                APISecret: this._initData.APISecret,
                BinanceEnvironment: this._initData.BinanceEnvironment
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

    protected _parseOrdersHistory(orders: IBinanceFutureHistoricalOrder[]): BinanceFuturesHistoricalOrder[] {
        const response: BinanceFuturesHistoricalOrder[] = [];

        for (const order of orders) {
            response.push({
                Id: order.orderId,
                ExecutedSize: order.executedQty,
                Price: order.price,
                ExecutedPrice: order.avgPrice,
                Side: order.side === "SELL" ? OrderSide.Sell : OrderSide.Buy,
                Size: order.origQty,
                Status: order.status,
                Symbol: order.symbol,
                TIF: order.timeInForce,
                Time: order.time,
                StopPrice: order.stopPrice,
                Type: order.type as OrderTypes
            });
        }
        response.sort((a, b) => b.Time - a.Time);
        return response;
    }

    protected _parseOrders(orders: IBinanceFutureOrder[]): BinanceFuturesOrder[] {
        const response: BinanceFuturesOrder[] = [];

        for (const order of orders) {
            response.push({
                Id: order.orderId,
                ExecutedSize: order.executedQty,
                Price: order.price,
                ExecutedPrice: order.avgPrice,
                StopPrice: order.stopPrice,
                Side: order.side === "SELL" ? OrderSide.Sell : OrderSide.Buy,
                Size: order.origQty,
                Status: order.status,
                Symbol: order.symbol,
                TIF: order.timeInForce,
                Time: order.time,
                Type: order.type as OrderTypes
            });
        }
        response.sort((a, b) => b.Time - a.Time);
        return response;
    }

    protected _parseTradesHistory(trades: IBinanceFutureTrade[]): BinanceFuturesHistoricalTrade[] {
        const response: BinanceFuturesHistoricalTrade[] = [];

        for (const trade of trades) {
            response.push({
                Id: trade.Id,
                Commission: trade.Commission,
                CommissionAsset: trade.CommissionAsset,
                Price: trade.Price,
                QuoteSize: trade.quoteQty,
                Size: trade.qty,
                PNL: trade.RealizedPnl,
                Symbol: trade.Symbol,
                Time: trade.time,
                Side: trade.Side === "SELL" ? OrderSide.Sell : OrderSide.Buy,
            });
        }
        response.sort((a, b) => b.Time - a.Time);
        return response;
    }

    loadOrdersHistory(symbol: string, from: number, to: number): Observable<BinanceFuturesHistoricalOrder[]> {
        return this.ws.getOrdersHistory(symbol, from, to).pipe(map((response: BinanceFutureOrderHistoryResponse) => {
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

    loadTradesHistory(symbol: string, from: number, to: number): Observable<BinanceFuturesHistoricalTrade[]> {
        return this.ws.getTradesHistory(symbol, from, to).pipe(map((response: BinanceFutureTradeHistoryResponse) => {
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
        return this.ws.getOpenOrders().subscribe((response: BinanceFutureOpenOrderResponse) => {
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

        const request = new BinanceFutureLoginRequest(this.ws.type);
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
        this._positions = [];
        this._assets = [];

        this._loadPendingOrders();
    }

    protected _handleAccountUpdate(data: IBinanceFutureAccountInfoData) {
        if (!this._accountInfo) {
            this._accountInfo = {} as any;
        }

        const apiKeyLength = this._initData.APIKey.length;
        this._accountInfo.APIKey = this._initData.APIKey.slice(0, 1) + "******" + this._initData.APIKey.slice(apiKeyLength - 4, apiKeyLength);
        this._accountInfo.FeeTier = data.FeeTier;
        this._accountInfo.BinanceEnvironment = this._initData.BinanceEnvironment;

        this.onAccountInfoUpdated.next(this._accountInfo);

        this._updatePositions(data.Positions);

        this._updateAssets(data.Assets);
    }

    protected _updatePositions(positions: IBinanceFuturePosition[]) {
        let positionsChanged = false;
        for (const posFromBroker of positions) {
            if (!posFromBroker.positionAmt || posFromBroker.positionAmt === 0) {
                continue;
            }

            let positionExist = false;
            for (const existingPos of this._positions) {
                if (existingPos.Symbol === posFromBroker.Symbol) {
                    positionExist = true;
                    existingPos.Price = posFromBroker.EntryPrice;
                    existingPos.Leverage = posFromBroker.Leverage;
                    existingPos.Size = posFromBroker.positionAmt;
                    existingPos.NetPL = posFromBroker.UnrealizedProfit;
                    existingPos.MaintMargin = posFromBroker.MaintMargin;
                    existingPos.Margin = posFromBroker.PositionInitialMargin;
                    existingPos.Side = posFromBroker.positionAmt > 0 ? OrderSide.Buy : OrderSide.Sell;
                    break;
                }
            }

            if (!positionExist) {
                positionsChanged = true;
                this._positions.push({
                    Price: posFromBroker.EntryPrice,
                    Leverage: posFromBroker.Leverage,
                    Size: posFromBroker.positionAmt,
                    NetPL: posFromBroker.UnrealizedProfit,
                    Symbol: posFromBroker.Symbol,
                    MaintMargin: posFromBroker.MaintMargin,
                    Margin: posFromBroker.PositionInitialMargin,
                    Side: posFromBroker.positionAmt > 0 ? OrderSide.Buy : OrderSide.Sell
                });
            }
        }

        for (let i = 0; i < this._positions.length; i++) {
            let existingPos = this._positions[i];
            let positionExist = false;
            for (const posFromBroker of positions) {
                if (posFromBroker.positionAmt === 0) {
                    continue;
                }
                if (existingPos.Symbol === posFromBroker.Symbol) {
                    positionExist = true;
                    break;
                }
            }

            if (!positionExist) {
                positionsChanged = true;
                this._positions.splice(i, 1);
                i--;
            }
        }

        if (positionsChanged) {
            this._updateAccountPNL();
            this.onPositionsUpdated.next(this._positions);
        }

        this._trySubscribeToAll();
    }

    protected _updateAssets(assets: IBinanceFutureAsset[]) {
        let assetsChanged = false;
        for (const assetBroker of assets) {
            let assetExist = false;
            for (const existingAsset of this._assets) {
                if (existingAsset.Asset === assetBroker.Asset) {
                    assetExist = true;
                    existingAsset.AvailableBalance = assetBroker.AvailableBalance;
                    existingAsset.CrossUnPnl = assetBroker.CrossUnPnl;
                    existingAsset.CrossWalletBalance = assetBroker.CrossWalletBalance;
                    existingAsset.InitialMargin = assetBroker.InitialMargin;
                    existingAsset.MaintMargin = assetBroker.MaintMargin;
                    existingAsset.MarginBalance = assetBroker.MarginBalance;
                    existingAsset.MaxWithdrawAmount = assetBroker.MaxWithdrawAmount;
                    existingAsset.OpenOrderInitialMargin = assetBroker.OpenOrderInitialMargin;
                    existingAsset.PositionInitialMargin = assetBroker.PositionInitialMargin;
                    existingAsset.UnrealizedProfit = assetBroker.UnrealizedProfit;
                    existingAsset.WalletBalance = assetBroker.WalletBalance;
                    break;
                }
            }

            if (!assetExist) {
                assetsChanged = true;
                this._assets.push({
                    Asset: assetBroker.Asset,
                    AvailableBalance: assetBroker.AvailableBalance,
                    CrossUnPnl: assetBroker.CrossUnPnl,
                    CrossWalletBalance: assetBroker.CrossWalletBalance,
                    InitialMargin: assetBroker.InitialMargin,
                    MaintMargin: assetBroker.MaintMargin,
                    MarginBalance: assetBroker.MarginBalance,
                    MaxWithdrawAmount: assetBroker.MaxWithdrawAmount,
                    OpenOrderInitialMargin: assetBroker.OpenOrderInitialMargin,
                    PositionInitialMargin: assetBroker.PositionInitialMargin,
                    UnrealizedProfit: assetBroker.UnrealizedProfit,
                    WalletBalance: assetBroker.WalletBalance,
                });
            }
        }

        for (let i = 0; i < this._assets.length; i++) {
            let existingAsset = this._assets[i];
            let assetExist = false;
            for (const assetBroker of assets) {
                if (existingAsset.Asset === assetBroker.Asset) {
                    assetExist = true;
                    break;
                }
            }

            if (!assetExist) {
                assetsChanged = true;
                this._assets.splice(i, 1);
                i--;
            }
        }

        if (assetsChanged) {
            this.onAssetsUpdated.next(this._assets);
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

    protected _removeFromPositions(symbol: string) {
        let removed = false;
        for (let i = 0; i < this.positions.length; i++) {
            let position = this.positions[i];
            if (position.Symbol === symbol) {
                this.positions.splice(i, 1);
                i--;
                removed = true;
            }
        }

        if (removed) {
            this._updateAccountPNL();
            this.onPositionsUpdated.next(this.positions);
        }
    }

    protected _handleOrderUpdate(update: IBinanceFuturesOrderUpdateData) {
        if (update.Status === FuturesOrderStatus.FILLED) {
            this._removeFromOrders(update.OrderId);
        }

        if (update.Status === FuturesOrderStatus.CANCELED ||
            update.Status === FuturesOrderStatus.EXPIRED ||
            update.Status === FuturesOrderStatus.REJECTED) {
            this._removeFromOrders(update.OrderId);
        }

        if (update.Status === FuturesOrderStatus.NEW) {
            for (let i = 0; i < this.orders.length; i++) {
                let order = this.orders[i];
                if (order.Id === update.OrderId) {
                    return;
                }
            }
            this.orders.unshift({
                Id: update.OrderId,
                ExecutedSize: 0,
                Price: update.Price,
                ExecutedPrice: update.AveragePrice,
                StopPrice: update.StopPrice,
                Side: update.Side === "SELL" ? OrderSide.Sell : OrderSide.Buy,
                Size: update.Quantity,
                Status: update.Status,
                Symbol: update.Symbol,
                TIF: update.TimeInForce,
                Time: update.CreateTime,
                Type: update.Type as OrderTypes
            });

            this._trySubscribeToAll();
        }

        if (update.Status === FuturesOrderStatus.PARTIALLY_FILLED) {
            for (let i = 0; i < this.orders.length; i++) {
                let order = this.orders[i];
                if (order.Id === update.OrderId) {
                    order.ExecutedSize = update.AccumulatedQuantityOfFilledTrades;
                    order.Price = update.Price;
                    order.ExecutedPrice = update.AveragePrice;
                    order.StopPrice = update.StopPrice;
                    order.Size = update.Quantity;
                    order.Status = update.Status;
                    order.Type = update.Type as OrderTypes;
                    break;
                }
            }
        }

        this.onOrdersUpdated.next(this.orders);
    }

    protected _getPosition(symbol: string): BinanceFuturesPosition {
        for (const pos of this.positions) {
            if (pos.Symbol === symbol) {
                return pos;
            }
        }
    }

    protected _handlePositionsUpdate(positions: IBinanceFuturePosition[]) {
        let positionsUpdated = false;
        let positionsParametersUpdated = false;
        for (const updatedPosition of positions) {
            if (updatedPosition.PositionSide !== "BOTH") 
            {
                continue;
            }

            const position = this._getPosition(updatedPosition.Symbol);
            if (position) {
                position.Size = updatedPosition.positionAmt;
                position.Side = updatedPosition.positionAmt > 0 ? OrderSide.Buy : OrderSide.Sell;
                position.Price = updatedPosition.EntryPrice;
                position.NetPL = updatedPosition.UnrealizedProfit;

                if (position.Size === 0) {
                    this._removeFromPositions(position.Symbol);
                    positionsUpdated = true;
                } else {
                    positionsParametersUpdated = true;
                }
            } else {
                if (!updatedPosition.positionAmt) {
                    continue;
                }

                this.positions.push({
                    Symbol: updatedPosition.Symbol,
                    Size: updatedPosition.positionAmt,
                    Side: updatedPosition.positionAmt > 0 ? OrderSide.Buy : OrderSide.Sell,
                    Price: updatedPosition.EntryPrice,
                    NetPL: updatedPosition.UnrealizedProfit,
                    CurrentPrice: updatedPosition.EntryPrice
                });
                positionsUpdated = true;
            }
        }

        if (positionsUpdated) {
            this._updateAccountPNL();
            this.onPositionsUpdated.next(this.positions);
        } else if (positionsParametersUpdated) {
            this.onPositionsParametersUpdated.next(this.positions);
        }

        this._trySubscribeToAll();
    }

    protected _handleRealtimeAccountUpdate(update: IBinanceFuturesAccountUpdateData) {
        let positionsUpdated = false;
        let positionsParametersUpdated = false;
        for (const updatedPosition of update.Positions) {
            if (updatedPosition.PositionSide !== "BOTH") 
            {
                continue;
            }

            const position = this._getPosition(updatedPosition.Symbol);
            if (position) {
                position.Size = updatedPosition.PositionAmount;
                position.Side = updatedPosition.PositionAmount > 0 ? OrderSide.Buy : OrderSide.Sell;
                position.Price = updatedPosition.EntryPrice;
                position.NetPL = updatedPosition.UnrealizedPnl;

                if (position.Size === 0) {
                    this._removeFromPositions(position.Symbol);
                    positionsUpdated = true;
                } else {
                    positionsParametersUpdated = true;
                }
            } else {
                if (!updatedPosition.PositionAmount) {
                    continue;
                }

                this.positions.push({
                    Symbol: updatedPosition.Symbol,
                    Size: updatedPosition.PositionAmount,
                    Side: updatedPosition.PositionAmount > 0 ? OrderSide.Buy : OrderSide.Sell,
                    Price: updatedPosition.EntryPrice,
                    NetPL: updatedPosition.UnrealizedPnl,
                    CurrentPrice: updatedPosition.EntryPrice
                });
                positionsUpdated = true;
            }
        }

        if (positionsUpdated) {
            this._updateAccountPNL();
            this.onPositionsUpdated.next(this.positions);
        } else if (positionsParametersUpdated) {
            this.onPositionsParametersUpdated.next(this.positions);
        }

        for (const balance of update.Balances) {
            for (const asset of this.assets) {
                if (asset.Asset === balance.Asset) {
                    asset.WalletBalance = balance.WalletBalance;
                    asset.CrossWalletBalance = balance.CrossBalance;
                }
            }
        }

        this.onAssetsUpdated.next(this._assets);

        this._trySubscribeToAll();
    }

    protected _trySubscribeToAll() {
        for (const pos of this.positions) {
            this._subscribeOnLastPrice(pos.Symbol);
        }
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
        let positionUpdated = false;

        for (const pos of this.positions) {
            if (pos.Symbol === quote.Symbol) {
                this._updatePositionByQuote(pos, quote);
                positionUpdated = true;
            }
        }

        if (positionUpdated) {
            this.onPositionsParametersUpdated.next(this.positions);
            this._updateAccountPNL();
            this.onAccountInfoUpdated.next(this.accountInfo);
        }

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

        return positionUpdated || orderUpdated;
    }

    protected _getQuoteCurrency(symbol: string): string {
        if (this._symbolToAsset[symbol]) {
            return this._symbolToAsset[symbol];
        }
        for (const i of this._instruments) {
            if (i.symbol === symbol) {
                this._symbolToAsset[symbol] = i.dependInstrument;
                return i.dependInstrument;
            }
        }
    }

    protected _updateAccountPNL() {
        const assets: { [key: string]: BinanceFuturesAsset; } = {};
        for (const a of this._assets) {
            a.UnrealizedProfit = 0;
            assets[a.Asset] = a;
        }

        for (const pos of this.positions) {
            if (pos.NetPL) {
                const asset = this._getQuoteCurrency(pos.Symbol);
                const assetForUpdate = assets[asset];

                if (assetForUpdate) {
                    assetForUpdate.UnrealizedProfit += pos.NetPL;
                }
            }
        }
    }

    protected _updatePositionByQuote(position: BinanceFuturesPosition, quote: IBinancePrice) {
        position.CurrentPrice = quote.Price;

        if (position.CurrentPrice && position.Price) {
            if (position.Side === OrderSide.Buy) {
                position.NetPL = (position.CurrentPrice - position.Price) * Math.abs(position.Size);
            } else {
                position.NetPL = (position.Price - position.CurrentPrice) * Math.abs(position.Size);
            }         
        }
    }

    private _updateOrderByQuote(order: BinanceFuturesOrder, quote: IBinancePrice) {
        order.CurrentPrice = quote.Price;
    }

}