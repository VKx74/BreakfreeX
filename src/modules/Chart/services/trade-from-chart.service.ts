import { Inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from '@app/services/broker.service';
import { BaseOrderConfig, OrderConfiguratorModalComponent } from 'modules/Trading/components/trade-manager/order-configurator-modal/order-configurator-modal.component';
import { MTOrderConfig } from 'modules/Trading/components/forex.components/mt/order-configurator/mt-order-configurator.component';
import { IOrder, IOrderRisk, IPlaceOrder, IPosition, OrderFillPolicy, OrderSide, OrderTypes } from 'modules/Trading/models/models';
import { MTBroker } from '@app/services/mt/mt.broker';
import { Observable, Subject, Subscription } from 'rxjs';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { AlertService } from "@alert/services/alert.service";
import { MTOrderCloseModalComponent } from 'modules/Trading/components/forex.components/mt/order-close-modal/mt-order-close-modal.component';
import { MTOrderEditModalComponent } from 'modules/Trading/components/forex.components/mt/order-edit-modal/mt-order-edit-modal.component';
import { SymbolMappingComponent } from 'modules/Trading/components/forex.components/mt/symbol-mapping/symbol-mapping.component';
import { IInstrument } from "../../../app/models/common/instrument";
import { AlgoService } from "@app/services/algo.service";
import { auditTime, debounceTime, throttleTime } from "rxjs/operators";
import { TradingHelper } from "@app/services/mt/mt.helper";
import { EBrokerInstance, IBroker, ICryptoBroker, IPositionBasedBroker } from "@app/interfaces/broker/broker";
import { BinanceOrderConfig } from "modules/Trading/components/crypto.components/binance/order-configurator/binance-order-configurator.component";
import { BinanceFuturesOrderConfig } from "modules/Trading/components/crypto.components/binance-futures/order-configurator/binance-futures-order-configurator.component";
import { BinanceFuturesOrder } from "modules/Trading/models/crypto/binance-futures/binance-futures.models";
import { BinanceBroker, BinanceBrokerBase } from "@app/services/binance/binance.broker";

export interface EditOrderPriceConfigBase {
    Ticket: any;
    Price?: number;
    StopPrice?: number;
    SL?: number;
    TP?: number;
}

interface IPositionSizeParameters {
    contract_size?: number;
    input_accountsize: number;
    input_risk: number;
    price_diff: number;
    instrument: IInstrument;
    account_currency: string;
}

interface IPositionSizeCalculationRequest {
    params: IPositionSizeParameters;
    callback: (size: any) => void;
}

class OrderStateDescription {
    private order: IOrder;
    constructor(o: IOrder) {
        this.order = { ...o };
    }

    public compare(o: IOrder): boolean {
        if (o.Id !== this.order.Id) {
            return false;
        }

        if (o.Side !== this.order.Side) {
            return false;
        }

        if (o.Symbol !== this.order.Symbol) {
            return false;
        }

        if (o.Type !== this.order.Type) {
            return false;
        }

        if ((o.SL && !this.order.SL) || !o.SL && this.order.SL) {
            return false;
        }

        if ((o.TP && !this.order.TP) || !o.TP && this.order.TP) {
            return false;
        }

        return true;
    }
}

class PositionStateDescription {
    private position: IPosition;
    constructor(p: IPosition) {
        this.position = { ...p };
    }

    public compare(p: IPosition): boolean {
        if (p.Side !== this.position.Side) {
            return false;
        }

        if (p.Symbol !== this.position.Symbol) {
            return false;
        }

        return true;
    }
}

@Injectable()
export class TradeFromChartService implements TradingChartDesigner.ITradingFromChartHandler {
    private _chart: TradingChartDesigner.Chart;
    private _preventModification: boolean;
    private _brokerStateChangedSubscription: Subscription;
    private _ordersUpdatedSubscription: Subscription;
    private _positionsUpdatedSubscription: Subscription;
    private _positionsParametersUpdatedSubscription: Subscription;
    private _onOrdersParametersUpdated: Subscription;
    private _onActiveOrderIdUpdated: Subscription;
    private _orderConfig: IPlaceOrder;
    private _decimals: number = 5;
    private _prevSymbol: string;
    private _pendingEdit: { [id: string]: EditOrderPriceConfigBase; } = {};
    private _ratioCache: { [id: string]: number; } = {};
    private _posSizeSubject: Subject<IPositionSizeCalculationRequest> = new Subject();
    private _orderStateDescription: OrderStateDescription[] = [];
    private _positionStateDescription: PositionStateDescription[] = [];

    private get _broker(): IBroker {
        return this._brokerService.activeBroker;
    }

    constructor(private _brokerService: BrokerService, private _dialog: MatDialog,
        @Inject(AlertService) protected _alertService: AlertService, protected _alogService: AlgoService) {

        this._brokerStateChangedSubscription = this._brokerService.activeBroker$.subscribe((data) => {
            this._refreshBrokerSubscriptions();
        });

        this._refreshBrokerSubscriptions();

        this._posSizeSubject.pipe(
            debounceTime(1000)
        ).subscribe((request) => {
            this._calculatePositionSize(request);
        });
    }

    private checkOrdersSame() {
        const orders = this.getOrders();
        const positions = this.getActualPositions();

        if (orders.length !== this._orderStateDescription.length) {
            return false;
        }

        if (positions.length !== this._positionStateDescription.length) {
            return false;
        }

        for (let i = 0; i < orders.length; i++) {
            if (!this._orderStateDescription[i].compare(orders[i])) {
                return false;
            }
        }

        for (let i = 0; i < positions.length; i++) {
            if (!this._positionStateDescription[i].compare(positions[i])) {
                return false;
            }
        }

        return true;
    }

    private getOrders(): IOrder[] {
        const symbol = this._broker.instrumentToBrokerFormat(this._chart.instrument.symbol);
        if (!symbol) {
            return [];
        }

        let orders = this._broker.orders.slice().filter((order) => {
            if (order.Symbol !== symbol.symbol) {
                return false;
            }

            if (order.Price) {
                return true;
            }

            if ((order as BinanceFuturesOrder).StopPrice) {
                return true;
            }

            return false;
        }).sort((order1, order2) => {
            return order1.Price - order2.Price;
        });

        return orders;
    }

    private _refreshBrokerSubscriptions() {
        this._prevSymbol = null;
        this.refresh();
        if (this._broker) {
            if (!this._ordersUpdatedSubscription) {
                this._ordersUpdatedSubscription = this._broker.onOrdersUpdated.pipe(throttleTime(5000, undefined, { leading: true, trailing: true })).subscribe(() => {
                    if (this.checkOrdersSame()) {
                        const orders = this.getOrders();
                        this.handleOrdersParametersChanged(orders);
                    } else {
                        this._pendingEdit = {};
                        this.refresh();
                    }
                });
            }

            if (!this._onOrdersParametersUpdated) {
                this._onOrdersParametersUpdated = this._broker.onOrdersParametersUpdated.subscribe((orders: any[]) => {
                    this.handleOrdersParametersChanged(orders);
                });
            }

            if (this._broker.isPositionBased) {
                const positionBasedBroker: IPositionBasedBroker = this._broker as any;

                if (!this._positionsUpdatedSubscription) {
                    this._positionsUpdatedSubscription = positionBasedBroker.onPositionsUpdated.subscribe(() => {
                        this.refresh();
                    });
                }

                if (!this._positionsParametersUpdatedSubscription) {
                    this._positionsParametersUpdatedSubscription = positionBasedBroker.onPositionsParametersUpdated.subscribe(() => {
                        this.handlePositionsParametersChanged();
                    });
                }
            }
        } else {
            if (this._ordersUpdatedSubscription) {
                this._ordersUpdatedSubscription.unsubscribe();
                this._ordersUpdatedSubscription = null;
            }
            if (this._positionsUpdatedSubscription) {
                this._positionsUpdatedSubscription.unsubscribe();
                this._positionsUpdatedSubscription = null;
            }
            if (this._positionsParametersUpdatedSubscription) {
                this._positionsParametersUpdatedSubscription.unsubscribe();
                this._positionsParametersUpdatedSubscription = null;
            }
            if (this._onOrdersParametersUpdated) {
                this._onOrdersParametersUpdated.unsubscribe();
                this._onOrdersParametersUpdated = null;
            }
        }

        if (!this._onActiveOrderIdUpdated) {
            this._onActiveOrderIdUpdated = this._brokerService.activeOrderIdState$.subscribe(() => {
                this.handleActiveOrderChanged();
            });
        }

        if (this._isChartInitialized()) {
            this._chart.refreshAsync();
        }
    }

    public IsTradePlaced(): boolean {
        if (!this._orderConfig || !this._broker) {
            return false;
        }

        const instrument = this._broker.instrumentToBrokerFormat(this._chart.instrument.symbol);
        if (!instrument) {
            return false;
        }

        return this._orderConfig.Symbol === instrument.id;
    }

    public setChart(chart: TradingChartDesigner.Chart, preventModification: boolean) {
        if (this._chart !== chart) {
            this._chart = chart;
            this._preventModification = preventModification;
            this.refresh();
        }
    }

    public PlaceOrder(params: TradingChartDesigner.OrderParameters, callback: () => void): void {
        if (!this.IsTradingEnabledHandler()) {
            return;
        }

        if (!this.IsSymbolSupported()) {
            this.showMappingConfirmation()
                .subscribe((dialogResult: any) => {
                    if (dialogResult) {
                        this.showMappingModal();
                    } else {
                        this._alertService.warning("Can`t map instruments to your broker format");
                    }
                });
        } else {
            const orderConfig = this._getOrderSettings(params);
            if (!orderConfig) {
                this._alertService.error("Broker not support trading from chart.");
                return;
            }
            this.showOrderModal(orderConfig, callback, false);
        }
    }

    public CloseOrder(id: any, callback: () => void): void {
        if (id.toString().startsWith("sl_")) {
            this.OrderPriceChange(id, null, callback);
            return;
        }

        if (id.toString().startsWith("tp_")) {
            this.OrderPriceChange(id, null, callback);
            return;
        }

        if (id.toString().startsWith("position_")) {
            this.cancelPosition(id, callback);
            return;
        }

        if (id.toString().startsWith("trigger_")) {
            let orderId = id.toString().replace("trigger_", "");
            this.cancelOrder(Number(orderId), callback);
            return;
        }

        this.cancelOrder(Number(id), callback);
    }

    public EditOrder(id: any, callback: () => void): void {
        if (!this._broker) {
            callback();
            return;
        }

        if (!this._canEditOrder()) {
            this._alertService.info("Broker not support order editing");
            callback();
            return;
        }

        let order: any;

        for (const o of this._broker.orders) {
            if (o.Id === id) {
                order = o;
                break;
            }
        }

        if (!order) {
            callback();
            return;
        }

        if (this._broker instanceof MTBroker) {
            this._editMTOrder(order);
        }
    }

    public OrderSLTPChange(id: any, price: number, callback: () => void): void {
        if (!this._broker) {
            callback();
            return;
        }

        if (this._isPositionBased() && id.startsWith("position_")) {
            let instrument = id.replace("position_", "");
            this._editPosition(instrument, price, callback);
            return;
        }

        const order = this._broker.getOrderById(Number(id));
        if (!order) {
            callback();
            return;
        }

        const editRequest = this._getEditOrder(order);

        if (order.Side === OrderSide.Buy) {
            if (price > order.Price) {
                editRequest.TP = price;
            } else {
                editRequest.SL = price;
            }
        } else {
            if (price < order.Price) {
                editRequest.TP = price;
            } else {
                editRequest.SL = price;
            }
        }

        this._editOrder(editRequest, callback);
    }

    public OrderPriceChange(id: any, price: number, callback: () => void): void {
        if (!this._broker) {
            callback();
            return;
        }

        const orderId = Number(id.toString().replace("sl_", "").replace("tp_", "").replace("trigger_", ""));
        const order = this._broker.getOrderById(orderId);
        if (!order) {
            callback();
            return;
        }

        const editRequest = this._getEditOrder(order);

        if (id.toString().startsWith("sl_")) {
            if (editRequest.SL === price) {
                callback();
                return;
            }
            editRequest.SL = price;
        } else if (id.toString().startsWith("tp_")) {
            if (editRequest.TP === price) {
                callback();
                return;
            }
            editRequest.TP = price;
        } else if (id.toString().startsWith("trigger_")) {
            if (order.StopPrice === price) {
                callback();
                return;
            }
            editRequest.Price = null;
            editRequest.StopPrice = price;
        } else {
            if (order.Price === price) {
                callback();
                return;
            }
            editRequest.StopPrice = null;
            editRequest.Price = price;
        }

        this._editOrder(editRequest, callback);
    }

    public IsTradingEnabledHandler(): boolean {
        if (!this._broker || !this._chart) {
            return false;
        }
        return true;
    }

    public IsSymbolSupported(): boolean {
        if (!this._broker || !this._chart) {
            return false;
        }

        return this._broker.instrumentToBrokerFormat(this._chart.instrument.symbol) !== null;
    }

    public RepeatLimitOrder(price: number): void {
        if (!this._broker) {
            return;
        }

        this._orderConfig.Price = Math.roundToDecimals(price, this._decimals);
        this._orderConfig.Timeframe = this._chart.timeInterval / 1000;
        this._alertService.info("Processing order");

        this._broker.placeOrder(this._orderConfig)
            .subscribe(value => {
                if (value.result) {
                    this._alertService.success("Order sent");
                } else {
                    this._alertService.error(value.msg);
                }
            }, error => {
                this._alertService.error(error);
            });
    }

    public PlaceLimitOrder(price: number): void {
        if (!this.IsTradingEnabledHandler()) {
            return;
        }

        const orderConfig = this._getOrderSettings();
        if (!orderConfig) {
            this._alertService.error("Broker not support trading from chart.");
            return;
        }

        if (!this.IsSymbolSupported()) {
            this.showMappingConfirmation()
                .subscribe((dialogResult: any) => {
                    if (dialogResult) {
                        this.showMappingModal();
                    } else {
                        this._alertService.warning("Can`t map instruments to your broker format");
                    }
                });
        } else {
            const pricePrecision = this._broker.instrumentDecimals(orderConfig.instrument.symbol);
            orderConfig.price = Math.roundToDecimals(price, pricePrecision);
            orderConfig.timeframe = this._chart.timeInterval / 1000;
            orderConfig.lastPrice = this._getLastPrice();
            this.showOrderModal(orderConfig, null, true);
        }
    }

    public refresh() {
        if (!this._isChartInitialized()) {
            return;
        }

        this.clearChart();

        if (!this._broker) {
            return;
        }

        if (this._prevSymbol !== this._chart.instrument.symbol) {
            let brokerInstrument = this._broker.instrumentToBrokerFormat(this._chart.instrument.symbol);
            if (brokerInstrument) {
                this._decimals = this._broker.instrumentDecimals(brokerInstrument.symbol);
                this._prevSymbol = this._chart.instrument.symbol;
            } else {
                this._decimals = this._broker.instrumentDecimals(this._chart.instrument.symbol);
            }
        }
        this._chart.primaryPane.freezed = true;
        this.fillOrderLines();
        this.fillPositionsLines();
        this._chart.primaryPane.freezed = false;

        this._positionStateDescription = [];

        // if (!this._chart.isRestrictedMode) {
        //     this._chart.refreshAsync();
        // }
    }

    public GetOrderSize(priceDiff: number, risk: number, balance: number, callback: (size: any) => void, skipMapping: boolean = false): void {
        if (this._broker instanceof MTBroker) {
            this._getOrderSideForMTBroker(priceDiff, risk, balance, callback, skipMapping);
            return;
        }
        if (this._broker instanceof BinanceBrokerBase) {
            this._getOrderSideForBinanceBroker(priceDiff, risk, balance, callback, skipMapping);
            return;
        }

    }

    public dispose() {
        this._brokerStateChangedSubscription.unsubscribe();
        if (this._ordersUpdatedSubscription) {
            this._ordersUpdatedSubscription.unsubscribe();
            this._ordersUpdatedSubscription = null;
        }
        if (this._positionsUpdatedSubscription) {
            this._positionsUpdatedSubscription.unsubscribe();
            this._positionsUpdatedSubscription = null;
        }
        if (this._positionsParametersUpdatedSubscription) {
            this._positionsParametersUpdatedSubscription.unsubscribe();
            this._positionsParametersUpdatedSubscription = null;
        }
        if (this._onOrdersParametersUpdated) {
            this._onOrdersParametersUpdated.unsubscribe();
            this._onOrdersParametersUpdated = null;
        }
        if (this._onActiveOrderIdUpdated) {
            this._onActiveOrderIdUpdated.unsubscribe();
            this._onActiveOrderIdUpdated = null;
        }

        this._chart = null;
    }

    private _getOrderSideForBinanceBroker(priceDiff: number, risk: number, balance: number, callback: (size: any) => void, skipMapping: boolean = false): void {
        const binanceBroker = this._broker as ICryptoBroker;
        const brokerInstrument = binanceBroker.instrumentToBrokerFormat(this._chart.instrument.symbol);

        if (!brokerInstrument) {
            if (skipMapping) {
                callback("Calculate manually");
                return;
            }

            this.showMappingConfirmation()
                .subscribe((dialogResult: any) => {
                    if (dialogResult) {
                        this.showMappingModal(() => {
                            this._getOrderSideForBinanceBroker(priceDiff, risk, balance, callback, true);
                        });
                    } else {
                        this._alertService.warning("Can`t map instruments to your broker format");
                        callback("Calculate manually");
                    }
                });
            return;
        }

        const walletBalance = binanceBroker.getPairBalance(brokerInstrument.id);
        const params: IPositionSizeParameters = {
            input_risk: risk,
            price_diff: priceDiff,
            instrument: this._chart.instrument as any,
            input_accountsize: balance || walletBalance,
            account_currency: null,
            contract_size: 1
        };

        const request = {
            params: params,
            callback: callback
        };

        this._calculatePositionSizeBasedOnRatio(request, 1);
    }

    private _getOrderSideForMTBroker(priceDiff: number, risk: number, balance: number, callback: (size: any) => void, skipMapping: boolean = false): void {
        const mtBroker = this._broker as MTBroker;
        const params: IPositionSizeParameters = {
            input_risk: risk,
            price_diff: priceDiff,
            instrument: this._chart.instrument as any,
            input_accountsize: balance || mtBroker.accountInfo.Balance,
            account_currency: balance ? "USD" : mtBroker.accountInfo.Currency
        };

        if (!params.input_accountsize) {
            callback("Calculate manually");
            return;
        }

        const brokerInstrument = mtBroker.instrumentToBrokerFormat(params.instrument.symbol);

        if (!brokerInstrument) {
            if (skipMapping) {
                callback("Calculate manually");
                return;
            }

            this.showMappingConfirmation()
                .subscribe((dialogResult: any) => {
                    if (dialogResult) {
                        this.showMappingModal(() => {
                            this._getOrderSideForMTBroker(priceDiff, risk, balance, callback, true);
                        });
                    } else {
                        this._alertService.warning("Can`t map instruments to your broker format");
                        callback("Calculate manually");
                    }
                });
            return;
        }

        const contract_size = mtBroker.instrumentContractSize(brokerInstrument.symbol);
        if (contract_size) {
            params.contract_size = contract_size;
        }

        const request = {
            params: params,
            callback: callback
        };

        const ratioKey = this._getRatioKey(request);
        const ratio = this._ratioCache[ratioKey];

        if (ratio) {
            this._calculatePositionSizeBasedOnRatio(request, ratio);
        } else {
            this._posSizeSubject.next(request);
        }
    }

    private _calculatePositionSize(request: IPositionSizeCalculationRequest) {
        this._alogService.calculatePriceRatio({
            account_currency: request.params.account_currency,
            instrument: request.params.instrument
        }).subscribe((data) => {
            const ratioKey = this._getRatioKey(request);
            this._ratioCache[ratioKey] = data.ratio || 1;
            this._calculatePositionSizeBasedOnRatio(request, data.ratio);
        }, () => {
            request.callback("Calculate manually");
        });
    }

    private _calculatePositionSizeBasedOnRatio(request: IPositionSizeCalculationRequest, ratio: number) {
        const acctSize = request.params.input_accountsize * (ratio || 1);
        const size = TradingHelper.calculatePositionSize(acctSize, request.params.input_risk, request.params.price_diff, request.params.contract_size);
        request.callback(size);
    }

    private _getRatioKey(request: IPositionSizeCalculationRequest): string {
        return request.params.instrument.id + request.params.account_currency;
    }

    private getOrderPriceDiff(order: IOrder): number {
        if (!order.SL && !order.TP) {
            return 0;
        }

        let min = order.Price;
        let max = order.Price;

        if (order.SL) {
            min = Math.min(min, order.SL);
            max = Math.max(max, order.SL);
        }

        if (order.TP) {
            min = Math.min(min, order.TP);
            max = Math.max(max, order.TP);
        }

        return max - min;
    }

    private getActualPositions(): IPosition[] {
        if (!this._chart || !this._broker) {
            return [];
        }

        if (!this._broker.isPositionBased) {
            return [];
        }

        const symbol = this._broker.instrumentToBrokerFormat(this._chart.instrument.symbol);
        if (!symbol) {
            return [];
        }

        const positionBasedBroker: IPositionBasedBroker = this._broker as any;

        if (!positionBasedBroker.positions) {
            return [];
        }

        return positionBasedBroker.positions.filter(_ => _.Symbol === symbol.symbol);
    }

    private fillPositionsLines() {
        const shapes = [];
        const positions = this.getActualPositions();
        this._positionStateDescription = [];

        if (!positions) {
            return;
        }

        if (!this._isChartInitialized()) {
            return;
        }

        for (const position of positions) {
            this._positionStateDescription.push(new PositionStateDescription(position));
            const shape = this.createBaseShape(position);
            shape.showSLTP = false;
            shape.lineText = `#${position.Symbol}`;
            shape.lineType = this.getPositionLineType(position);
            shape.linePrice = position.Price;
            shape.lineId = this.getPositionOrderLineId(position);

            if (this._broker.isOrderSLTPEditAvailable) {
                shape.showSLTP = true;
            }

            this.setLinePL(shape, position);
            shapes.push(shape);
        }

        this.addShapes(shapes);
    }

    private getPositionOrderLineId(position: IPosition) {
        return `position_${position.Symbol}`;
    }

    private fillOrderLines() {
        if (!this._isChartInitialized()) {
            return;
        }

        let orders = this.getOrders();
        this._orderStateDescription = [];
        const shapes = [];

        for (const order of orders) {
            this._orderStateDescription.push(new OrderStateDescription(order));
            // show trigger line
            const stopPrice = (order as BinanceFuturesOrder).StopPrice;
            const entryPrice = order.Price;
            if (stopPrice) {
                const stop_shape = this.createBaseShape(order);
                stop_shape.lineId = order.Id.toString();
                stop_shape.linePrice = stopPrice;
                stop_shape.lineId = `trigger_${order.Id.toString()}`;
                stop_shape.lineText = `#${order.Id}`;
                stop_shape.boxText = `TRIGGER`;
                stop_shape.isEditable = this._canEditOrder();
                stop_shape.showSLTP = false;
                shapes.push(stop_shape);

                if (entryPrice) {
                    stop_shape.showClose = false;
                    stop_shape.lineType = "pending";
                } else {
                    stop_shape.showClose = true;
                    stop_shape.lineType = this.getOrderLineType(order);
                }
            }

            if (entryPrice) {
                const shape = this.createBaseShape(order);
                const shapeOrderBox = this.createBaseOrderShape(order);
                if (shapeOrderBox) {
                    shapes.push(shapeOrderBox);
                }
                shape.showSLTP = this._canEditSLTPOrder();
                shape.lineId = order.Id.toString();
                shape.lineText = `#${order.Id}`;
                shape.lineType = this.getOrderLineType(order);
                shapes.push(shape);

                this.setShapePriceAndBox(shape, order);

                if (order.SL) {
                    const sl_shape = this.createBaseShape(order);
                    sl_shape.lineId = `sl_${order.Id.toString()}`;
                    sl_shape.lineText = `#${order.Id}`;
                    sl_shape.lineType = "sl";

                    this.setShapeSL(sl_shape, order);

                    shapes.push(sl_shape);
                }

                if (order.TP) {
                    const tp_shape = this.createBaseShape(order);
                    tp_shape.lineId = `tp_${order.Id.toString()}`;
                    tp_shape.lineText = `#${order.Id}`;
                    tp_shape.lineType = "tp";

                    this.setShapeTP(tp_shape, order);

                    shapes.push(tp_shape);
                }
            }
        }

        // if (shapes.length) {
        //     this._chart.primaryPane.addShapes(shapes);
        // }

        this.addShapes(shapes);
    }

    private addShapes(shapes: TradingChartDesigner.Shape[]) {
        try {
            if (shapes.length) {
                this._chart.primaryPane.addShapes(shapes);
            }
        } catch (ex) {
            console.error(ex);
        }
    }

    private setShapeSL(sl_shape: TradingChartDesigner.ShapeOrderLine, order: IOrder) {
        sl_shape.linePrice = order.SL;
        if (order.Side === OrderSide.Buy) {
            sl_shape.boxText = `SL`;
        } else {
            sl_shape.boxText = `SL`;
        }

        sl_shape.highlight = order.Id === this._brokerService.activeOrderId;
    }

    private setShapeTP(tp_shape: TradingChartDesigner.ShapeOrderLine, order: IOrder) {
        tp_shape.linePrice = order.TP;
        if (order.Side === OrderSide.Buy) {
            tp_shape.boxText = `TP`;
        } else {
            tp_shape.boxText = `TP`;
        }

        tp_shape.highlight = order.Id === this._brokerService.activeOrderId;
    }

    private setShapePriceAndBox(shape: TradingChartDesigner.ShapeOrderLine, order: IOrder) {
        shape.linePrice = order.Price;

        if (order.Type === OrderTypes.Market) {
            this.setLinePL(shape, order);
        }

        const p = Math.roundToDecimals(order.Price, this._decimals);

        if (order.Type === OrderTypes.Limit) {
            shape.boxText = `L`;
        }

        if (order.Type === OrderTypes.Stop) {
            shape.boxText = `Stop sell: ${p}`;
        }

        shape.highlight = order.Id === this._brokerService.activeOrderId;
    }

    private updatePositionShape(shape: TradingChartDesigner.ShapeSimpleTrade, order: IOrder & IOrderRisk) {
        shape.sl = order.SL ? order.SL.toFixed(this._decimals) : order.SL;
        shape.tp = order.TP ? order.TP.toFixed(this._decimals) : order.TP;
        shape.entry = order.Price.toFixed(this._decimals);
        shape.risk = order.RiskPercentage ? order.RiskPercentage.toFixed(2) + "%" : "Unknown";
        shape.side = order.Side;
        shape.posSize = order.Size.toFixed(2);
        shape.netPL = order.NetPL ? order.NetPL.toFixed(2) : "-";
        shape.orderId = order.Id;

        if (order.SL && order.TP) {
            const diffSL = Math.abs(order.SL - order.Price);
            const diffTP = Math.abs(order.TP - order.Price);
            shape.slRatio = Number(diffTP / diffSL).toFixed(1);
        } else {
            shape.slRatio = "Unknown";
        }
    }

    private createBaseShape(order: IOrder | IPosition): TradingChartDesigner.ShapeOrderLine {
        const shape = new TradingChartDesigner.ShapeOrderLine();
        shape.showClose = true;
        shape.isEditable = this._canEditOrder();
        shape.boxSize = order.Size.toString();
        shape.instrument = this._chart.instrument;

        if (this._preventModification) {
            shape.showClose = false;
            shape.isEditable = false;
            shape.showSLTP = false;
        }

        return shape;
    }

    private createBaseOrderShape(order: IOrder): TradingChartDesigner.ShapeSimpleTrade {
        if (!order.SL && !order.TP) {
            return null;
        }
        return;

        const shape = new TradingChartDesigner.ShapeSimpleTrade();
        shape.locked = false;
        shape.removable = false;
        shape.savable = false;
        this.updatePositionShape(shape, order);

        return shape;
    }

    private getOrderLineType(order: IOrder): string {
        if (order.Type === OrderTypes.Market) {
            return order.Side === OrderSide.Buy ? "market_buy" : "market_sell";
        }
        return "pending";
    }

    private getPositionLineType(position: IPosition): string {
        return position.Side === OrderSide.Buy ? "position_buy" : "position_sell";
    }

    private clearChart() {
        if (!this._isChartInitialized()) {
            return;
        }

        let shapes = [];
        for (const shape of this._chart.primaryPane.shapes) {
            if (shape instanceof TradingChartDesigner.ShapeOrderLine || shape instanceof TradingChartDesigner.ShapeSimpleTrade) {
                shape.locked = false;
                shape.selectable = true;
                shape.removable = true;
                shapes.push(shape);
            }
        }
        if (shapes.length) {
            this._chart.primaryPane.freezed = true;
            this._chart.primaryPane.removeShapes(shapes);
            // this._chart.refreshAsync();
            this._chart.commandController.clearCommands();
            this._chart.primaryPane.freezed = false;
        }
    }

    private cancelPosition(id: any, callback: () => void) {
        if (!this._broker || !this._broker.isPositionBased) {
            callback();
            return;
        }

        const broker: IPositionBasedBroker = this._broker as any;
        const symbol = id.toString().replace("position_", "");

        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Close position',
                message: `Are you sure you want close '${symbol}' position?`,
                onConfirm: () => {
                    broker.closePosition(symbol).subscribe((result) => {
                        if (result.result) {
                            this._alertService.success("Position closed");
                        } else {
                            this._alertService.error("Failed to close position: " + result.msg);
                        }
                    }, (error) => {
                        this._alertService.error("Failed to close position: " + error);
                    });
                }
            }
        }).afterClosed().subscribe(() => {
            callback();
        });
    }

    private cancelOrder(id: number, callback: () => void) {
        if (!this._broker) {
            callback();
            return;
        }

        let order: any;

        for (const o of this._broker.orders) {
            if (o.Id === id) {
                order = o;
                break;
            }
        }

        if (!order) {
            callback();
            return;
        }

        if (order.Type !== OrderTypes.Market) {
            this._dialog.open(ConfirmModalComponent, {
                data: {
                    title: 'Cancel order',
                    message: `Are you sure you want cancel #'${order.Id}' order?`,
                    onConfirm: () => {
                        this._broker.cancelOrder(order.Id)
                            .subscribe((result) => {
                                if (result.result) {
                                    this._alertService.success("Order canceled");
                                } else {
                                    this._alertService.error("Failed to cancel order: " + result.msg);
                                }
                            },
                                (error) => {
                                    this._alertService.error("Failed to cancel order: " + error);
                                });
                    }
                }
            }).afterClosed().subscribe(() => {
                callback();
            });
        } else {
            this._dialog.open(MTOrderCloseModalComponent, {
                data: order
            }).afterClosed().subscribe(() => {
                callback();
            });
        }
    }

    private setLinePL(shape: TradingChartDesigner.ShapeOrderLine, order: IOrder | IPosition) {
        shape.boxText = order.NetPL ? order.NetPL.toFixed(2) : "-";
    }

    private setLinePendingState(shapeId: string, price?: number) {
        if (!this._isChartInitialized()) {
            return;
        }

        for (const shape of this._chart.primaryPane.shapes) {
            if (shape instanceof TradingChartDesigner.ShapeOrderLine) {
                const orderLine = shape as TradingChartDesigner.ShapeOrderLine;
                if (shapeId === orderLine.lineId) {
                    orderLine.boxText = "amending...";
                    if (price) {
                        orderLine.linePrice = price;
                    }
                }
            }
        }
    }

    private handlePositionsParametersChanged() {
        if (!this._isChartInitialized()) {
            return;
        }

        const positions = this.getActualPositions();
        if (!positions) {
            return;
        }

        for (const shape of this._chart.primaryPane.shapes) {
            if (shape instanceof TradingChartDesigner.ShapeOrderLine) {
                const orderLine = shape as TradingChartDesigner.ShapeOrderLine;
                for (const position of positions) {
                    const id = this.getPositionOrderLineId(position);
                    if (id !== orderLine.lineId) {
                        continue;
                    }
                    shape.lineType = this.getPositionLineType(position);
                    shape.linePrice = position.Price;
                    this.setLinePL(shape, position);
                }
            }
        }
    }

    private handleActiveOrderChanged() {
        if (!this._isChartInitialized()) {
            return;
        }

        for (const shape of this._chart.primaryPane.shapes) {
            if (shape instanceof TradingChartDesigner.ShapeOrderLine) {
                const orderLine = shape as TradingChartDesigner.ShapeOrderLine;

                if (!this._brokerService.activeOrderId) {
                    orderLine.highlight = false;
                    continue;    
                }

                const orderId =  Number(orderLine.lineId);
                orderLine.highlight = orderId === this._brokerService.activeOrderId;
                if (orderLine.highlight) {
                    continue;
                }

                const slId = `sl_${this._brokerService.activeOrderId.toString()}`;
                const tpId = `tp_${this._brokerService.activeOrderId.toString()}`;
                orderLine.highlight = slId === orderLine.lineId || tpId === orderLine.lineId;
            }
        }

        this._chart.refreshAsync();
    }

    private handleOrdersParametersChanged(orders: IOrder[]) {
        if (!this._isChartInitialized()) {
            return;
        }

        let updateNeeded = false;
        this._chart.primaryPane.freezed = true;

        for (const shape of this._chart.primaryPane.shapes) {
            if (shape instanceof TradingChartDesigner.ShapeOrderLine) {
                const orderLine = shape as TradingChartDesigner.ShapeOrderLine;
                for (const order of orders) {

                    if (order.Id === Number(orderLine.lineId)) {
                        this.setShapePriceAndBox(orderLine, order);
                        updateNeeded = true;
                    }

                    const slId = `sl_${order.Id.toString()}`;
                    const tpId = `tp_${order.Id.toString()}`;

                    if (slId === orderLine.lineId) {
                        this.setShapeSL(orderLine, order);
                        updateNeeded = true;
                    }

                    if (tpId === orderLine.lineId) {
                        this.setShapeTP(orderLine, order);
                        updateNeeded = true;
                    }
                }
            } else if (shape instanceof TradingChartDesigner.ShapeSimpleTrade) {
                const orderShape = shape as TradingChartDesigner.ShapeSimpleTrade;
                for (const order of orders) {
                    if (order.Id === Number(orderShape.orderId)) {
                        this.updatePositionShape(orderShape, order);
                        updateNeeded = true;
                    }
                }
            }
        }
        this._chart.primaryPane.freezed = false;

        // if (updateNeeded) {
        //     this._chart.refreshAsync();
        // }
    }

    private _getEditOrder(order: IOrder): EditOrderPriceConfigBase {
        if (this._pendingEdit[order.Id.toString()]) {
            return this._pendingEdit[order.Id.toString()];
        }

        return {
            Ticket: order.Id,
            Price: order.Price,
            SL: order.SL,
            TP: order.TP
        };
    }

    private _editOrder(editRequest: EditOrderPriceConfigBase, callback: () => void) {
        this.setLinePendingState(editRequest.Ticket.toString());
        this._pendingEdit[editRequest.Ticket] = editRequest;

        this._broker.editOrderPrice(editRequest).subscribe(
            (result) => {
                callback();
                if (result.result) {
                    this._alertService.success("Order modified");
                } else {
                    this._alertService.error("Failed to modify order: " + result.msg);
                    this._pendingEdit = {};
                    this.refresh();
                }
            },
            (error) => {
                callback();
                this._alertService.error("Failed to modify order: " + error);
                this._pendingEdit = {};
                this.refresh();
            }
        );
    }

    private _editPosition(instrument: string, price: number, callback: () => void) {
        const positionBasedBroker: IPositionBasedBroker = this._broker as any;

        if (!positionBasedBroker.positions) {
            callback();
            return;
        }

        let pos = positionBasedBroker.positions.find(_ => _.Symbol === instrument);
        if (!pos) {
            callback();
            return;
        }

        if (this._broker.instanceType === EBrokerInstance.Binance ||
            this._broker.instanceType === EBrokerInstance.BinanceFuturesCOIN ||
            this._broker.instanceType === EBrokerInstance.BinanceFuturesUSD) {
            let binanceBroker = (this._broker as any) as BinanceBrokerBase;
            let action;
            let size = Math.abs(pos.Size);

            if (pos.Side === OrderSide.Buy) {
                if (price > pos.Price) {
                    action = binanceBroker.placeTP(OrderSide.Sell, size, instrument, price);
                } else {
                    action = binanceBroker.placeSL(OrderSide.Sell, size, instrument, price);
                }
            } else {
                if (price < pos.Price) {
                    action = binanceBroker.placeTP(OrderSide.Buy, size, instrument, price);
                } else {
                    action = binanceBroker.placeSL(OrderSide.Buy, size, instrument, price);
                }
            }
            action.subscribe(
                (result) => {
                    callback();
                    if (result.result) {
                        this._alertService.success("Position modified");
                    } else {
                        this._alertService.error("Failed to modify position SL/TP: " + result.msg);
                        this.refresh();
                    }
                },
                (error) => {
                    callback();
                    this._alertService.error("Failed to modify position SL/TP: " + error);
                    this.refresh();
                }
            );
        } else {
            callback();
            return;
        }
    }

    private showMappingConfirmation(): Observable<any> {
        return this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Symbol Mapping',
                message: `We are unable to find this market on your broker account, please map the market manually.`
            }
        }).afterClosed();
    }

    private showMappingModal(callback?: () => void): void {
        this._dialog.open(SymbolMappingComponent, {
            data: {
                SelectedFeedInstrument: this._chart.instrument
            }
        }).afterClosed()
            .subscribe(() => {
                if (callback) {
                    callback();
                }
            });
    }

    private showOrderModal(orderConfig: BaseOrderConfig, callback: () => void, doGetOrder: boolean): void {
        this._dialog.open(OrderConfiguratorModalComponent, {
            backdropClass: "cdk-overlay-backdrop-transparent",
            data: {
                orderConfig: orderConfig,
                orderPlacedHandler: (order: any) => {
                    if (doGetOrder) {
                        this._orderConfig = order;
                    }
                    if (callback) {
                        callback();
                    }
                }
            }
        });
    }

    private _getOrderSettings(params?: TradingChartDesigner.OrderParameters): BaseOrderConfig {
        switch (this._broker.instanceType) {
            case EBrokerInstance.MT4:
            case EBrokerInstance.MT5:
                return this._getMTOrderSettings(params);
            case EBrokerInstance.BinanceFuturesCOIN:
            case EBrokerInstance.BinanceFuturesUSD:
                return this._getBinanceFuturesOrderSettings(params);
            case EBrokerInstance.Binance:
                return this._getBinanceOrderSettings(params);
        }
    }

    private _getMTOrderSettings(params?: TradingChartDesigner.OrderParameters): BaseOrderConfig {
        const orderConfig = MTOrderConfig.createLimit(this._broker.instanceType);
        orderConfig.instrument = this._broker.instrumentToBrokerFormat(this._chart.instrument.symbol);

        if (!params) {
            return orderConfig;
        }

        const pricePrecision = this._broker.instrumentDecimals(orderConfig.instrument.symbol);
        if (params.price) {
            orderConfig.price = Math.roundToDecimals(params.price, pricePrecision);
        }

        if (params.sl) {
            orderConfig.sl = Math.roundToDecimals(params.sl, pricePrecision);
        }

        if (params.tp) {
            orderConfig.tp = Math.roundToDecimals(params.tp, pricePrecision);
        }

        orderConfig.amount = params.size;
        orderConfig.timeframe = params.timeframe;
        orderConfig.lastPrice = this._getLastPrice();
        orderConfig.placedFrom = params.placedFrom;
        orderConfig.tradeType = params.tradeType;
        orderConfig.side = params.side.toLowerCase() === "buy" ? OrderSide.Buy : OrderSide.Sell;
        return orderConfig;
    }

    private _getBinanceOrderSettings(params: TradingChartDesigner.OrderParameters): BaseOrderConfig {
        const orderConfig = BinanceOrderConfig.createLimit();
        orderConfig.instrument = this._broker.instrumentToBrokerFormat(this._chart.instrument.symbol);

        if (!params) {
            return orderConfig;
        }

        const pricePrecision = this._broker.instrumentDecimals(orderConfig.instrument.symbol);

        if (params.price) {
            orderConfig.price = Math.roundToDecimals(params.price, pricePrecision);
        }

        if (params.sl) {
            orderConfig.sl = Math.roundToDecimals(params.sl, pricePrecision);
        }

        if (params.tp) {
            orderConfig.tp = Math.roundToDecimals(params.tp, pricePrecision);
        }

        orderConfig.timeframe = params.timeframe;
        orderConfig.lastPrice = this._getLastPrice();
        orderConfig.amount = params.size;
        orderConfig.side = params.side.toLowerCase() === "buy" ? OrderSide.Buy : OrderSide.Sell;
        return orderConfig;
    }

    private _getBinanceFuturesOrderSettings(params: TradingChartDesigner.OrderParameters): BaseOrderConfig {
        const orderConfig = BinanceFuturesOrderConfig.createLimit(this._broker.instanceType);
        orderConfig.instrument = this._broker.instrumentToBrokerFormat(this._chart.instrument.symbol);

        if (!params) {
            return orderConfig;
        }

        const pricePrecision = this._broker.instrumentDecimals(orderConfig.instrument.symbol);

        if (params.price) {
            orderConfig.price = Math.roundToDecimals(params.price, pricePrecision);
        }

        if (params.sl) {
            orderConfig.sl = Math.roundToDecimals(params.sl, pricePrecision);
        }

        if (params.tp) {
            orderConfig.tp = Math.roundToDecimals(params.tp, pricePrecision);
        }

        orderConfig.timeframe = params.timeframe;
        orderConfig.lastPrice = this._getLastPrice();
        orderConfig.amount = params.size;
        orderConfig.side = params.side.toLowerCase() === "buy" ? OrderSide.Buy : OrderSide.Sell;
        return orderConfig;
    }

    private _editMTOrder(order: any) {
        this._dialog.open(MTOrderEditModalComponent, {
            data: {
                order: order
            }
        });
    }

    private _canEditOrder(): boolean {
        if (!this._broker) {
            return false;
        }

        if (this._preventModification) {
            return false;
        }

        return this._broker.isOrderEditAvailable;
    }

    private _canEditSLTPOrder(): boolean {
        if (!this._broker) {
            return false;
        }

        if (this._preventModification) {
            return false;
        }

        return this._broker.isOrderSLTPEditAvailable;
    }

    private _isPositionBased(): boolean {
        if (!this._broker) {
            return false;
        }

        return this._broker.isPositionBased;
    }

    private _isChartInitialized(): boolean {
        if (!this._chart || !this._chart.primaryPane || !this._chart.dataContext || !this._chart.dataContext.dateDataRows || !this._chart.dataContext.dateDataRows.length) {
            return false;
        }

        return true;
    }

    private _getLastPrice(): number {
        if (!this._chart || !this._chart.dataContext) {
            return null;
        }

        return this._chart.dataContext.barDataRows().close.lastValue as any;
    }
}
