import { EBrokerInstance, IBroker, IBrokerState } from "@app/interfaces/broker/broker";
import { EExchangeInstance } from "@app/interfaces/exchange/exchange";
import { ReadyStateConstants } from "@app/interfaces/socket/WebSocketConfig";
import { EExchange } from "@app/models/common/exchange";
import { IInstrument } from "@app/models/common/instrument";
import { EMarketType } from "@app/models/common/marketType";
import { ITradeTick } from "@app/models/common/tick";
import { BinanceFutureLoginRequest, BinanceFutureLoginResponse, BinanceFutureOpenOrderResponse, BinanceFutureOrderHistoryResponse, IBinanceFutureAccountUpdatedData, IBinanceFutureAsset, IBinanceFutureHistoricalOrder, IBinanceFutureOrder, IBinanceFuturePosition, IBinanceFutureSymbolData } from "modules/Trading/models/crypto/binance-futures/binance-futures.communication";
import { BinanceFuturesAsset, BinanceFuturesHistoricalOrder, BinanceFuturesOrder, BinanceFuturesPosition, BinanceFuturesTradingAccount } from "modules/Trading/models/crypto/binance-futures/binance-futures.models";
import { BinanceConnectionData } from "modules/Trading/models/crypto/binance/binance.models";
import { ActionResult, BrokerConnectivityStatus, IOrder, OrderSide, OrderTypes } from "modules/Trading/models/models";
import { Subject, Observable, of, Subscription, Observer, throwError } from "rxjs";
import { map } from "rxjs/operators";
import { AlgoService } from "../algo.service";
import { InstrumentMappingService } from "../instrument-mapping.service";
import { BinanceFuturesSocketService } from "../socket/binance-futures.socket.service";

export abstract class BinanceFuturesBroker implements IBroker {
    protected _accountInfo: BinanceFuturesTradingAccount;
    protected _initData: BinanceConnectionData;
    protected _positions: BinanceFuturesPosition[] = [];
    protected _assets: BinanceFuturesAsset[] = [];
    protected _tickSubscribers: { [symbol: string]: Subject<ITradeTick>; } = {};
    protected _instrumentDecimals: { [symbol: string]: number; } = {};
    protected _instrumentTickSize: { [symbol: string]: number; } = {};
    protected _instruments: IInstrument[] = [];
    protected _onAccountUpdateSubscription: Subscription;
    protected _onReconnectSubscription: Subscription;
    protected _onTickSubscription: Subscription;
    
    protected abstract get _accountName(): string;
    protected abstract get _server(): string;

    abstract instanceType: EBrokerInstance;

    onAccountInfoUpdated: Subject<BinanceFuturesTradingAccount> = new Subject<BinanceFuturesTradingAccount>();
    onOrdersUpdated: Subject<any[]> = new Subject<any[]>();
    onOrdersParametersUpdated: Subject<any[]> = new Subject<any[]>();
    onHistoricalOrdersUpdated: Subject<any[]> = new Subject<any[]>();
    onPositionsUpdated: Subject<BinanceFuturesPosition[]> = new Subject<BinanceFuturesPosition[]>();
    onAssetsUpdated: Subject<BinanceFuturesAsset[]> = new Subject<BinanceFuturesAsset[]>();
    onSaveStateRequired: Subject<void> = new Subject;

    orders: BinanceFuturesOrder[] = [];
    ordersHistory: BinanceFuturesHistoricalOrder[] = [];

    tradesHistory: any[] = [];

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

    public get accountName(): string {
        return this._accountName;
    }

    constructor(protected ws: BinanceFuturesSocketService, protected algoService: AlgoService, protected _instrumentMappingService: InstrumentMappingService) {
    }

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
    closeOrder(order: string, ...args: any[]): Observable<ActionResult> {
        throw new Error("Method not implemented.");
    }
    closePosition(symbol: string, ...args: any[]): Observable<ActionResult> {
        throw new Error("Method not implemented.");
    }
    cancelOrder(order: string, ...args: any[]): Observable<ActionResult> {
        throw new Error("Method not implemented.");
    }
    subscribeToTicks(symbol: string, subscription: (value: ITradeTick) => void): Subscription {
        if (!this._tickSubscribers[symbol]) {
            this._tickSubscribers[symbol] = new Subject<ITradeTick>();
            // this.ws.subscribeOnQuotes(symbol).subscribe();
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
        if (!search) {
            return of(this._instruments.slice());
        }

        const filtered = this._instruments.filter(i => {
            const s = i.symbol.replace("/", "").replace("_", "").replace("-", "").replace("^", "").toLowerCase();
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
        if (this._onAccountUpdateSubscription) {
            this._onAccountUpdateSubscription.unsubscribe();
        }
        if (this._onReconnectSubscription) {
            this._onReconnectSubscription.unsubscribe();
        }

        this._onTickSubscription = this.ws.tickSubject.subscribe(this._handleQuotes.bind(this));
        this._onAccountUpdateSubscription = this.ws.accountUpdatedSubject.subscribe(this._handleAccountUpdate.bind(this));
        this._onReconnectSubscription = this.ws.onReconnect.subscribe(() => {
            this._reconnect();
        });

        return new Observable<ActionResult>((observer: Observer<ActionResult>) => {
            this.ws.open().subscribe(value => {
                const request = new BinanceFutureLoginRequest();
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
                Type: order.type as OrderTypes
            });
        }

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
                Side: order.side === "SELL" ? OrderSide.Sell : OrderSide.Buy,
                Size: order.origQty,
                Status: order.status,
                Symbol: order.symbol,
                TIF: order.timeInForce,
                Time: order.time,
                Type: order.type as OrderTypes
            });
        }

        return response;
    }
    
    loadOrdersHistory(symbol: string, from: number, to: number): Observable<BinanceFuturesHistoricalOrder[]> {
        return this.ws.getOrdersHistory(symbol, from, to).pipe(map((response: BinanceFutureOrderHistoryResponse) => {
            if (!response || !response.Data || !response.IsSuccess) {
                throwError(response.ErrorMessage || "Failed to load historical orders from Binance");
            }

            this.ordersHistory = this._parseOrdersHistory(response.Data.Orders);
            this.onHistoricalOrdersUpdated.next(this.ordersHistory);
            return this.ordersHistory;
        }));
    }
    
    protected _loadPendingOrders() {
        return this.ws.getOpenOrders().subscribe((response: BinanceFutureOpenOrderResponse) => {
            if (!response || !response.Data || !response.IsSuccess) {
                throwError(response.ErrorMessage || "Failed to load historical orders from Binance");
            }

            this.orders = this._parseOrders(response.Data.Orders);
            this.onOrdersUpdated.next(this.orders);
        });
    }

    protected _handleQuotes(quote: ITradeTick) {
        const subject = this._tickSubscribers[quote.symbol];
        if (subject && subject.observers.length > 0) {
            this._tickSubscribers[quote.symbol].next(quote);
        } else {
            if (subject) {
                subject.unsubscribe();
            }
            delete this._tickSubscribers[quote.symbol];
            // this.ws.unsubscribeFromQuotes(quote.symbol).subscribe();
        }
    }

    protected _reconnect() {
        if (!this._initData) {
            return;
        }

        const request = new BinanceFutureLoginRequest();
        request.Data = {
            ApiKey: this._initData.APIKey,
            ApiSecret: this._initData.APISecret
        };

        this.ws.sendAuth().subscribe(() => {
            this.ws.login(request).subscribe((data: BinanceFutureLoginResponse) => {
                if (data.IsSuccess) {
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

    protected _initialize(instruments: IBinanceFutureSymbolData[]) {
        this._instrumentDecimals = {};
        this._instrumentTickSize = {};
        this._instruments = [];

        for (const instrument of instruments) {
            // let precision = instrument.QuoteAssetPrecision;
            let precision = 2;

            let tickSize = 1 / Math.pow(10, precision);
          
            this._instruments.push({
                id: instrument.Pair,
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
            this._instrumentTickSize[instrument.Name] = tickSize;
        }

        // this._orders = [];
        // this._positions = [];
        // this._currencyRisks = [];
        // this._accountInfo.Account = this._initData.Login.toString();
        // this._serverName = this._initData.ServerName;

        this._loadPendingOrders();
    }

    protected _handleAccountUpdate(data: IBinanceFutureAccountUpdatedData) {
        if (!this._accountInfo) {
            this._accountInfo = {} as any;
        }

        const apiKeyLength = this._initData.APIKey.length;
        this._accountInfo.APIKey = this._initData.APIKey.slice(0, 1) + "******" + this._initData.APIKey.slice(apiKeyLength - 4, apiKeyLength);
        this._accountInfo.AvailableBalance = data.AvailableBalance;
        this._accountInfo.FeeTier = data.FeeTier;
        this._accountInfo.TotalInitialMargin = data.TotalInitialMargin;
        this._accountInfo.TotalMaintMargin = data.TotalMaintMargin;
        this._accountInfo.TotalMarginBalance = data.TotalMarginBalance;
        this._accountInfo.TotalOpenOrderInitialMargin = data.TotalOpenOrderInitialMargin;
        this._accountInfo.TotalPositionInitialMargin = data.TotalPositionInitialMargin;
        this._accountInfo.TotalUnrealizedProfit = data.TotalUnrealizedProfit;
        this._accountInfo.TotalWalletBalance = data.TotalWalletBalance;
        this._accountInfo.TotalCrossWalletBalance = data.TotalCrossWalletBalance;
        this._accountInfo.TotalCrossUnPnl = data.TotalCrossUnPnl;
        this._accountInfo.AvailableBalance = data.AvailableBalance;

        this.onAccountInfoUpdated.next(this._accountInfo);

        this._updatePositions(data.Positions);

        this._updateAssets(data.Assets);
        
    }

    protected _updatePositions(positions: IBinanceFuturePosition[]) {
        let positionsChanged = false;

        for (const posFromBroker of positions) {
            if (posFromBroker.positionAmt === 0) {
                continue;
            }

            let positionExist = false;
            for (const existingPos of this._positions) {
                if (existingPos.Symbol === posFromBroker.Symbol) {
                    positionExist = true;
                    existingPos.Price = posFromBroker.EntryPrice;
                    existingPos.Leverage = posFromBroker.Leverage;
                    existingPos.Size = posFromBroker.positionAmt;
                    existingPos.PNL = posFromBroker.UnrealizedProfit;
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
                    PNL: posFromBroker.UnrealizedProfit,
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
            this.onPositionsUpdated.next(this._positions);
        }
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
}