import { Inject } from "@angular/core";
import { EBrokerInstance, IBroker, IBrokerNotification, IBrokerState, ICryptoBroker } from "@app/interfaces/broker/broker";
import { EExchangeInstance } from "@app/interfaces/exchange/exchange";
import { ReadyStateConstants } from "@app/interfaces/socket/WebSocketConfig";
import { EExchange } from "@app/models/common/exchange";
import { IInstrument } from "@app/models/common/instrument";
import { EMarketType } from "@app/models/common/marketType";
import { ITradeTick } from "@app/models/common/tick";
import { BinanceFutureLoginResponse } from "modules/Trading/models/crypto/binance-futures/binance-futures.communication";
import { BinanceFuturesOrder, BinanceFuturesPosition } from "modules/Trading/models/crypto/binance-futures/binance-futures.models";
import { BinanceConnectionData, BinanceFund, BinanceHistoricalOrder, BinanceHistoricalTrade, BinanceOrder, BinanceSpotTradingAccount, CoinRisk } from "modules/Trading/models/crypto/binance/binance.models";
import { BinanceSpotBookPriceResponse, BinanceSpotLoginRequest, BinanceSpotOpenOrderResponse, BinanceSpotOrderHistoryResponse, BinanceSpotTradeHistoryResponse, IBinanceSpotAccountBalance, IBinanceSpotAccountInfoData, IBinanceSpotHistoricalOrder, IBinanceSpotOrder, IBinanceSpotOrderUpdateData, IBinanceSpotTrade, IBinanceSpotWalletBalance, SpotOrderStatus } from "modules/Trading/models/crypto/binance/binance.models.communication";
import { IBinanceSymbolData } from "modules/Trading/models/crypto/shared/models.communication";
import { OrderValidationChecklist, OrderValidationChecklistInput } from "modules/Trading/models/crypto/shared/order.validation";
import { ActionResult, BrokerConnectivityStatus, CurrencyRiskType, IOrder, OrderSide, OrderTypes, RiskClass, TimeInForce } from "modules/Trading/models/models";
import { Subject, Observable, of, Subscription, Observer, combineLatest, throwError, forkJoin } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { AlgoService } from "../algo.service";
import { InstrumentMappingService } from "../instrument-mapping.service";
import { TradingHelper } from "../mt/mt.helper";
import { BinanceSpotSocketService } from "../socket/binance-spot.socket.service";
import { BinanceTradeRatingService } from "./binance.trade-rating.service";

interface CumulativeSL {
    side: OrderSide;
    symbol: string;
    price: number;
    size: number;
}

export abstract class BinanceBrokerBase {
    protected _tradeRatingService: BinanceTradeRatingService;
    protected _algoService: AlgoService;
    protected _instruments: IInstrument[] = [];
    protected _coinRisks: CoinRisk[] = [];

    public get coinRisks(): CoinRisk[] {
        return this._coinRisks;
    }

    abstract onRisksUpdated: Subject<void>;

    constructor() {
        
    }

    abstract getPairBalance(symbol: string): number;

    abstract getCoinBalance(coin: string): number;

    protected abstract _getOrdersForRates(): (BinanceOrder | BinanceFuturesPosition | BinanceFuturesOrder)[];

    protected abstract _getOrdersForSL(): (BinanceOrder | BinanceFuturesOrder)[];

    protected _buildRates() {
        let symbolsToUpdateByCVAR: string[] = [];
        
        let stops = this._getStops();
        let array = this._getOrdersForRates();

        for (const order of array) {
            let type = (order as any).Type;
            if (type && !this._canOrderHaveRisk(type)) {
                order.RiskClass = RiskClass.NoRisk;
                continue;
            }

            let risk = 0;

            order.RiskClass = RiskClass.Calculating;

            let instrument = this._instruments.find(_ => _.id === order.Symbol);
            if (!instrument) {
                continue;
            }

            let balance = this.getPairBalance(instrument.symbol);
            if (!balance) {
                continue;
            }

            let slPriceOrder = this._getSLForOrders(order, stops);

            if (slPriceOrder) {
                let sl = slPriceOrder;
                risk = TradingHelper.buildRiskByPrice(1, 1, order.Size, order.Price, sl, balance);
                if (order.Side === OrderSide.Buy) {
                    if (order.Price <= sl) {
                        risk = 0;
                    } else {
                        if (!risk) {
                            continue;
                        }
                    }
                } else {
                    if (order.Price >= sl) {
                        risk = 0;
                    } else {
                        if (!risk) {
                            continue;
                        }
                    }
                }
                if (!risk) {
                    continue;
                }
            } else {
                if (symbolsToUpdateByCVAR.indexOf(order.Symbol) === -1) {
                    symbolsToUpdateByCVAR.push(order.Symbol);
                }
                continue;
            }

            order.Risk = Math.roundToDecimals(balance / 100 * risk, 2);
            order.RiskPercentage = Math.roundToDecimals(risk, 2);
            order.RiskClass = TradingHelper.convertValueToOrderRiskClass(risk);
        }

        for (const s of symbolsToUpdateByCVAR) {
            this._updateOrderRiskByCVAR(s);
        }

        this._buildCurrencyRisks();
    }

    protected _getStops(): CumulativeSL[] {
        let res: CumulativeSL[] = [];
        let array = this._getOrdersForSL();

        for (const o of array) {
            // if (o.Type !== OrderTypes.StopMarket) {
            //     continue;
            // }

            let size = Math.abs(o.Size);
            res.push({
                symbol: o.Symbol,
                side: o.Side,
                size: size,
                price: o.StopPrice
            });
        }

        let sortedBuys = res.filter(_ => _.side === OrderSide.Buy).sort((a, b) => a.price - b.price);
        let sortedSells = res.filter(_ => _.side === OrderSide.Sell).sort((a, b) => b.price - a.price);
        let sortedResult = [...sortedBuys, ...sortedSells];

        return sortedResult;
    }
    
    protected _getSLForOrders(order: BinanceFuturesPosition | BinanceFuturesOrder, stops: CumulativeSL[]): number {
        let neededStops: CumulativeSL[] = [];
        let size = Math.abs(order.Size);
        let orderPrice = (order as BinanceFuturesOrder).StopPrice || order.Price;
        if (order.Side === OrderSide.Buy) {
            neededStops = stops.filter(_ => _.side !== order.Side && _.size > 0 && _.price < orderPrice && _.symbol === order.Symbol);
        } else {
            neededStops = stops.filter(_ => _.side !== order.Side && _.size > 0 && _.price > orderPrice && _.symbol === order.Symbol);
        }

        let stopsToDecrease: CumulativeSL[] = [];

        for (const stop of neededStops) {
            let sizeLeft = size - stop.size;
            if (this._isNearZero(sizeLeft)) {
                sizeLeft = 0;
            }
            let s = {...stop};
            if (sizeLeft >= 0) {
                stopsToDecrease.push(s);
                stop.size = 0;
            } else {
                s.size = size;
                stop.size -= size;
                stopsToDecrease.push(s);
            }

            size = sizeLeft;
            if (size <= 0) {
                size = 0;
                break;
            }
        }

        if (!this._isNearZero(size) || !stopsToDecrease.length) {
            return 0;
        }

        let cp = 0;
        let cs = 0;
        for (const stop of stopsToDecrease) {
            cp += stop.size * stop.price;
            cs += stop.size;
        }

        return cp / cs;

    }

    protected _isNearZero(n: number) {
        return Math.abs(n) < Number.EPSILON * 1000;
    }

    protected _updateOrderRiskByCVAR(symbol: string) {
        this._algoService.getMarketCVarInfo(symbol).subscribe((cvar) => {
            this._calculateOrderRiskByCVAR(symbol, cvar);
        });
    }

    protected _calculateOrderRiskByCVAR(symbol: string, cvar: number) {
        let array = this._getOrdersForRates();
        for (const order of array) {
            if (order.RiskClass !== RiskClass.Calculating) {
                continue;
            } 
            
            if (order.Symbol !== symbol) {
                continue;
            }

            let type = (order as any).Type;
            if (type && !this._canOrderHaveRisk(type)) {
                continue;
            }

            let instrument = this._instruments.find(_ => _.id === order.Symbol);
            if (!instrument) {
                continue;
            }

            let balance = this.getPairBalance(instrument.symbol);
            if (!balance) {
                continue;
            }

            let risk = order.Price / 100 * cvar * Math.abs(order.Size);

            order.Risk = Math.roundToDecimals(risk, 2);
            order.RiskPercentage = Math.roundToDecimals(risk / balance * 100, 2);
            order.RiskClass = TradingHelper.convertValueToOrderRiskClass(order.RiskPercentage);
        }

        this._buildCurrencyRisks();
    }

    protected _canOrderHaveRisk(type: OrderTypes): boolean {
        return type === OrderTypes.Market || type === OrderTypes.Limit;
    }
    
    protected _createEmptyRisk(coin: string, relatedCoin: string, type: CurrencyRiskType): CoinRisk {
        return {
            Coin: coin,
            RelatedCoin: relatedCoin,
            OrdersCount: 0,
            Risk: 0,
            RiskPercentage: 0,
            Type: type,
            Side: OrderSide.Buy,
            RiskClass: RiskClass.NoRisk
        };
    }

    protected _buildCurrencyRisks() {
        const actualRisks: { [symbol: string]: CoinRisk } = {};
        const pendingRisks: { [symbol: string]: CoinRisk } = {};
        let array = this._getOrdersForRates();

        for (const order of array) {
            if (!order.Risk) {
                continue;
            }

            let instrument = this._instruments.find(_ => _.id === order.Symbol);
            if (!instrument) {
                continue;
            }

            const s1Part1 = instrument.baseInstrument;
            const s1Part2 = instrument.dependInstrument;

            const riskRef = (order as any).Type ? pendingRisks : actualRisks;
            const type = (order as any).Type ? CurrencyRiskType.Pending : CurrencyRiskType.Actual;

            // if (!riskRef[s1Part1]) {
            //     riskRef[s1Part1] = this._createEmptyRisk(s1Part1, s1Part2, type);
            // }
            if (!riskRef[s1Part2]) {
                riskRef[s1Part2] = this._createEmptyRisk(s1Part2, s1Part1, type);
            }

            const r1 = order.Side === OrderSide.Buy ? order.Risk : order.Risk * -1;
            const r2 = order.Side === OrderSide.Sell ? order.Risk : order.Risk * -1;
            // riskRef[s1Part1].Risk += r1;
            riskRef[s1Part2].Risk += r2;
            // riskRef[s1Part1].OrdersCount++;
            riskRef[s1Part2].OrdersCount++;
        }

        for (let i = 0; i < this._coinRisks.length; i++) {
            let currencyRisk = this._coinRisks[i];

            if (currencyRisk.Type === CurrencyRiskType.Actual) {
                if (actualRisks[currencyRisk.Coin] && actualRisks[currencyRisk.Coin].Risk) {
                    const risk = actualRisks[currencyRisk.Coin];
                    delete actualRisks[currencyRisk.Coin];
                    currencyRisk.OrdersCount = risk.OrdersCount;
                    currencyRisk.Risk = risk.Risk;
                } else {
                    this._coinRisks.splice(i, 1);
                    i--;
                }
            } else {
                if (pendingRisks[currencyRisk.Coin] && pendingRisks[currencyRisk.Coin].Risk) {
                    const risk = pendingRisks[currencyRisk.Coin];
                    delete pendingRisks[currencyRisk.Coin];
                    currencyRisk.OrdersCount = risk.OrdersCount;
                    currencyRisk.Risk = risk.Risk;
                } else {
                    this._coinRisks.splice(i, 1);
                    i--;
                }
            }
        }

        for (const i in actualRisks) {
            if (actualRisks[i] && actualRisks[i].Risk) {
                this._coinRisks.push(actualRisks[i]);
            }
        }

        for (const i in pendingRisks) {
            if (pendingRisks[i] && pendingRisks[i].Risk) {
                this._coinRisks.push(pendingRisks[i]);
            }
        }

        for (const risk of this._coinRisks) {
            let balance = this.getCoinBalance(risk.Coin);
            // if (!balance) {
            //     balance = this.getCoinBalance(risk.RelatedCoin);
            // }  
            
            if (!balance) {
                continue;
            }
            
            risk.Side = risk.Risk > 0 ? OrderSide.Buy : OrderSide.Sell;
            risk.Risk = Math.abs(risk.Risk);
            risk.Risk = Math.roundToDecimals(risk.Risk, 2);
            const riskPercentage = risk.Risk / balance * 100;
            risk.RiskPercentage = Math.roundToDecimals(riskPercentage, 2);
            if (risk.RiskPercentage <= 0) {
                risk.RiskPercentage = 0.01; // min risk
            }
            risk.RiskClass = TradingHelper.convertValueToAssetRiskClass(riskPercentage);
        }

        this.onRisksUpdated.next();
    }
}

export class BinanceBroker extends BinanceBrokerBase implements ICryptoBroker {
    protected _usedSL: number[] = [];
    protected _tickSubscribers: { [symbol: string]: Subject<ITradeTick>; } = {};
    protected _instrumentDecimals: { [symbol: string]: number; } = {};
    protected _instrumentTickSize: { [symbol: string]: number; } = {};
    protected _instrumentContractSize: { [symbol: string]: number; } = {};
    protected _symbolToAsset: { [key: string]: string; } = {};
    protected _accountInfo: BinanceSpotTradingAccount;
    protected _initData: BinanceConnectionData;
    protected _lastPriceSubscribers: string[] = [];

    protected _onAccountUpdateSubscription: Subscription;
    protected _onReconnectSubscription: Subscription;
    protected _onTickSubscription: Subscription;
    protected _onOrderUpdateSubject: Subscription;
    protected _onAccountUpdateSubject: Subscription;
    protected _onPositionsUpdateSubject: Subscription;

    protected get _accountName(): string {
        return "30000000000";
    }

    protected get _server(): string {
        return "Binance Spot";
    }

    instanceType: EBrokerInstance = EBrokerInstance.Binance;

    onAccountInfoUpdated: Subject<BinanceSpotTradingAccount> = new Subject<BinanceSpotTradingAccount>();
    onOrdersUpdated: Subject<BinanceOrder[]> = new Subject<BinanceOrder[]>();
    onOrdersParametersUpdated: Subject<BinanceOrder[]> = new Subject<BinanceOrder[]>();
    onHistoricalOrdersUpdated: Subject<BinanceHistoricalOrder[]> = new Subject<BinanceHistoricalOrder[]>();
    onHistoricalTradesUpdated: Subject<BinanceHistoricalTrade[]> = new Subject<BinanceHistoricalTrade[]>();
    onFundsUpdated: Subject<BinanceFund[]> = new Subject<BinanceFund[]>();
    onNotification: Subject<IBrokerNotification> = new Subject<IBrokerNotification>();
    onSaveStateRequired: Subject<void> = new Subject;
    onRisksUpdated: Subject<void> = new Subject();

    funds: BinanceFund[] = [];
    orders: BinanceOrder[] = [];
    ordersHistory: BinanceHistoricalOrder[] = [];
    tradesHistory: BinanceHistoricalTrade[] = [];

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
        super();
        this._algoService = algoService;
        this._tradeRatingService = new BinanceTradeRatingService(this, algoService, _instrumentMappingService);
    }

    getCoinBalance(coin: string): number {
        const asset = this.funds.find(_ => _.Coin === coin);
        if (asset) {
            return asset.AvailableBalance;
        }
    }

    getPairBalance(symbol: string): number {
        const brokerInstrument = this.instrumentToBrokerFormat(symbol);
        return brokerInstrument ? this.getCoinBalance(brokerInstrument.dependInstrument) : null;
    }

    placeOrder(order: any): Observable<ActionResult> {
        return this._placeOrder(order).pipe(switchMap((response) => {
            if (!response.result) {
                return of(response);
            }

            let placeSL = this._placeSL(order);
            let placeTP = this._placeTP(order);

            return forkJoin([placeSL, placeTP]).pipe(map(() => {
                return response;
            }));

        }));
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
        this._subscribeOnLastPrice(symbol);

        if (!this._tickSubscribers[symbol]) {
            this._tickSubscribers[symbol] = new Subject<ITradeTick>();
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
        this._onOrderUpdateSubject = this.ws.orderUpdateSubject.subscribe(this._handleOrderUpdate.bind(this));
        this._onAccountUpdateSubject = this.ws.accountUpdateSubject.subscribe(this._handleRealtimeAccountUpdate.bind(this));
        this._onAccountUpdateSubscription = this.ws.accountInfoReceivedSubject.subscribe(this._handleAccountUpdate.bind(this));
        this._onReconnectSubscription = this.ws.onReconnect.subscribe(() => {
            this._reconnect();
        });

        return new Observable<ActionResult>((observer: Observer<ActionResult>) => {
            this.ws.setEnvironment(initData.BinanceEnvironment);
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

    protected _parseOrdersHistory(orders: IBinanceSpotHistoricalOrder[]): BinanceHistoricalOrder[] {
        const response: BinanceHistoricalOrder[] = [];

        for (const order of orders) {
            response.push({
                Id: order.OrderId,
                ExecutedSize: order.executedQty,
                Price: order.Price,
                ExecutedPrice: order.AverageFillPrice || 0,
                StopPrice: order.StopPrice,
                Side: order.Side === "SELL" ? OrderSide.Sell : OrderSide.Buy,
                Size: order.origQty,
                Status: order.Status,
                Symbol: order.Symbol,
                TIF: order.TimeInForce,
                Time: order.time,
                Type: order.Type as OrderTypes,
                IcebergSize: order.icebergQty
            });
        }
        response.sort((a, b) => b.Time - a.Time);
        return response;
    }

    protected _parseOrders(orders: IBinanceSpotOrder[]): BinanceOrder[] {
        const response: BinanceOrder[] = [];

        for (const order of orders) {
            response.push({
                Id: order.OrderId,
                ExecutedSize: order.executedQty,
                Price: order.Price,
                ExecutedPrice: order.AverageFillPrice || 0,
                StopPrice: order.StopPrice,
                Side: order.Side === "SELL" ? OrderSide.Sell : OrderSide.Buy,
                Size: order.origQty,
                Status: order.Status,
                Symbol: order.Symbol,
                TIF: order.TimeInForce,
                Time: order.time,
                Type: this._parseType(order.Type),
                IcebergSize: order.icebergQty
            });
        }
        response.sort((a, b) => b.Time - a.Time);
        return response;
    }

    private _parseType(type: string): OrderTypes {
        switch (type.toUpperCase()) {
            case "MARKET": return OrderTypes.Market;
            case "LIMIT": return OrderTypes.Limit;
            case "STOP": return OrderTypes.Stop;
            case "STOP LOSS":
            case "STOP_LOSS": return OrderTypes.StopLoss;
            case "STOP MARKET":
            case "STOP_MARKET": return OrderTypes.StopMarket;
            case "LIMIT MARKET":
            case "LIMIT_MARKET": return OrderTypes.LimitMaker;
            case "STOP LIMIT":
            case "STOP_LIMIT": return OrderTypes.StopLimit;
            case "STOP LOSS LIMIT":
            case "STOP_LOSS_LIMIT": return OrderTypes.StopLossLimit;
            case "TAKE PROFIT":
            case "TAKE_PROFIT": return OrderTypes.TakeProfit;
            case "TAKE PROFIT LIMIT":
            case "TAKE_PROFIT_LIMIT": return OrderTypes.TakeProfitLimit;
            case "TAKE PROFIT MARKET":
            case "TAKE_PROFIT_MARKET": return OrderTypes.TakeProfitMarket;
        }

        return type as OrderTypes;
    }

    protected _parseTradesHistory(trades: IBinanceSpotTrade[]): BinanceHistoricalTrade[] {
        const response: BinanceHistoricalTrade[] = [];

        for (const trade of trades) {
            response.push({
                Id: trade.Id,
                Commission: trade.Commission,
                CommissionAsset: trade.CommissionAsset,
                Price: trade.Price,
                QuoteSize: trade.quoteQty,
                Size: trade.qty,
                Symbol: trade.Symbol,
                Time: trade.time,
                Side: trade.qty < 0 ? OrderSide.Sell : OrderSide.Buy,
            });
        }
        response.sort((a, b) => b.Time - a.Time);
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

    loadTradesHistory(symbol: string, from: number, to: number): Observable<BinanceHistoricalTrade[]> {
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

    calculateOrderChecklist(parameters: OrderValidationChecklistInput): Observable<OrderValidationChecklist> {
        return this._tradeRatingService.calculateOrderChecklist(parameters);
    }

    getSamePositionsRisk(symbol: string, side: OrderSide): number {
        let res = 0;
        for (const order of this.orders) {
            if (symbol === order.Symbol) {
                if (side === order.Side) {
                    res += order.Risk || 0;
                } else {
                    res -= order.Risk || 0;
                }
            }
        }
        return res;
    }

    getRelatedPositionsRisk(symbol: string, side: OrderSide): number {
        let res = 0;
        const s1 = this.instrumentToBrokerFormat(symbol);
        const s1Part1 = s1.baseInstrument;
        const s1Part2 = s1.dependInstrument;

        for (const order of [...this.orders]) {
            if (!order.Risk) {
                continue;
            }
            
            const s2 = this.instrumentToBrokerFormat(order.Symbol);
            if (s2.id === s1.id) {
                if (side === order.Side) {
                    res += order.Risk || 0;
                } else {
                    res -= order.Risk || 0;
                }
                continue;
            }

            const s2Part1 = s2.baseInstrument;
            const s2Part2 = s2.dependInstrument;
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

    protected _loadPendingOrders() {
        return this.ws.getOpenOrders().subscribe((response: BinanceSpotOpenOrderResponse) => {
            if (!response || !response.Data || !response.IsSuccess) {
                throw new Error(response.ErrorMessage || "Failed to load pending orders from Binance");
            }

            if (response.Data.Orders === null || response.Data.Orders === undefined) {
                throw new Error("Failed to load historical trades from Binance");
            }

            this.orders = this._parseOrders(response.Data.Orders);
            this._buildRates();
            this.onOrdersUpdated.next(this.orders);
            this._trySubscribeToAll();
        });
    }

    protected _handleQuotes(quote: ITradeTick) {
        let externalSubscribers = false;
        const subject = this._tickSubscribers[quote.symbol];
        if (subject && subject.observers.length > 0) {
            this._tickSubscribers[quote.symbol].next(quote);
            externalSubscribers = true;
        } else {
            if (subject) {
                subject.unsubscribe();
                delete this._tickSubscribers[quote.symbol];
            }
        }

        let internalSubscribers = this._updateInnerData(quote);

        if (!externalSubscribers && !internalSubscribers) {
            this._unsubscribeFromLastPrice(quote.symbol);
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
        this._accountInfo.BinanceEnvironment = this._initData.BinanceEnvironment;
        this.onAccountInfoUpdated.next(this._accountInfo);

        this._updateFunds(data.Balances);
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

        // for (let i = 0; i < this.funds.length; i++) {
        //     let existingFund = this.funds[i];
        //     let assetExist = false;
        //     for (const brokerBalance of balances) {
        //         if (existingFund.Coin === brokerBalance.Asset) {
        //             assetExist = true;
        //             break;
        //         }
        //     }

        //     if (!assetExist) {
        //         changed = true;
        //         this.funds.splice(i, 1);
        //         i--;
        //     }
        // }

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
        if (update.Status === SpotOrderStatus.FILLED) {
            this._removeFromOrders(update.OrderId);
        }

        if (update.Status === SpotOrderStatus.CANCELED ||
            update.Status === SpotOrderStatus.EXPIRED ||
            update.Status === SpotOrderStatus.REJECTED) {
            this._removeFromOrders(update.OrderId);
        }

        if (update.Status === SpotOrderStatus.NEW) {
            for (let i = 0; i < this.orders.length; i++) {
                let order = this.orders[i];
                if (order.Id === update.OrderId) {
                    return;
                }
            }
            this.orders.unshift({
                Id: update.OrderId,
                ExecutedSize: update.QuantityFilled,
                Price: update.Price,
                ExecutedPrice: update.LastPriceFilled,
                StopPrice: update.StopPrice,
                Side: update.Side === "SELL" ? OrderSide.Sell : OrderSide.Buy,
                Size: update.Quantity,
                Status: update.Status,
                Symbol: update.Symbol,
                TIF: update.TimeInForce,
                Time: update.CreateTime,
                Type: this._parseType(update.Type),
                IcebergSize: update.IcebergQuantity
            });

            this._trySubscribeToAll();
        }

        if (update.Status === SpotOrderStatus.PARTIALLY_FILLED) {
            for (let i = 0; i < this.orders.length; i++) {
                let order = this.orders[i];
                if (order.Id === update.OrderId) {
                    order.ExecutedSize = update.QuantityFilled;
                    order.Price = update.Price;
                    order.ExecutedPrice = update.LastPriceFilled;
                    order.StopPrice = update.StopPrice;
                    order.Size = update.Quantity;
                    order.Status = update.Status;
                    order.IcebergSize = update.IcebergQuantity;
                    order.Type = update.Type as OrderTypes;
                    break;
                }
            }
        }

        this._buildRates();

        this.onOrdersUpdated.next(this.orders);
    }

    protected _handleRealtimeAccountUpdate(balances: IBinanceSpotAccountBalance[]) {
        this._updateFunds(balances);
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
        this.ws.subscribeOnOrderBook(symbol).subscribe();
    }

    protected _unsubscribeFromLastPrice(symbol: string) {
        const index = this._lastPriceSubscribers.indexOf(symbol);
        if (index < 0) {
            return;
        }

        this._lastPriceSubscribers.splice(index, 1);
        this.ws.unsubscribeOrderBook(symbol).subscribe();
    }

    protected _updateInnerData(quote: ITradeTick): boolean {
        let orderUpdated = false;
        for (const order of this.orders) {
            if (order.Symbol === quote.symbol) {
                this._updateOrderByQuote(order, quote);
                orderUpdated = true;
            }
        }

        if (orderUpdated) {
            this.onOrdersParametersUpdated.next(this.orders);
        }

        return orderUpdated;
    }

    private _updateOrderByQuote(order: BinanceOrder, quote: ITradeTick) {
        order.CurrentPrice = order.Side === OrderSide.Buy ? quote.bid : quote.ask;
    }

    protected _getOrdersForRates(): (BinanceOrder | BinanceFuturesPosition | BinanceFuturesOrder)[] {
        let ordersWithPos = [...this.orders];
        let sortedBuys = ordersWithPos.filter(_ => _.Side === OrderSide.Buy).sort((a, b) => b.Price - a.Price);
        let sortedSells = ordersWithPos.filter(_ => _.Side === OrderSide.Sell).sort((a, b) => a.Price - b.Price);
        let array = [...sortedBuys, ...sortedSells];
        return array;
    }

    protected _getOrdersForSL(): (BinanceOrder | BinanceFuturesOrder)[] {
        let res: BinanceOrder[] = [];
        for (const o of this.orders) {
            if (o.Type === OrderTypes.StopLossLimit) {
                res.push(o);
            }
        }
        return res;
    }

    private _placeSL(order: any): Observable<ActionResult> {
        if (!this._canOrderHaveRisk(order.Type)) {
            return of(null);
        }

        if (!order.SL) {
            return of(null);
        }

        return this._placeOrder({
            Side: order.Side === OrderSide.Buy ? OrderSide.Sell : OrderSide.Buy,
            Size: order.Size,
            Symbol: order.Symbol,
            Type: OrderTypes.StopLossLimit,
            TimeInForce: TimeInForce.GoodTillCancel,
            StopPrice: order.SL,
            Price: order.SL,
            ReduceOnly: true
        });
    }

    private _placeTP(order: any): Observable<ActionResult> {
        if (!this._canOrderHaveRisk(order.Type)) {
            return of(null);
        }

        if (!order.TP) {
            return of(null);
        }

        return this._placeOrder({
            Side: order.Side === OrderSide.Buy ? OrderSide.Sell : OrderSide.Buy,
            Size: order.Size,
            Symbol: order.Symbol,
            Type: OrderTypes.TakeProfit,
            // TimeInForce: TimeInForce.GoodTillCancel,
            StopPrice: order.TP,
            ReduceOnly: true
        });
    }

    private _placeOrder(order: any): Observable<ActionResult> {
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
}