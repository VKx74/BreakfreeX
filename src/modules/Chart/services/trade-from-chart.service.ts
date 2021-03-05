import { Inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from '@app/services/broker.service';
import { BaseOrderConfig, OrderConfiguratorModalComponent } from 'modules/Trading/components/trade-manager/order-configurator-modal/order-configurator-modal.component';
import { MTOrderConfig } from 'modules/Trading/components/forex.components/mt/order-configurator/mt-order-configurator.component';
import { IOrder, IOrderRisk, IPlaceOrder, OrderFillPolicy, OrderSide, OrderTypes } from 'modules/Trading/models/models';
import { MTBroker } from '@app/services/mt/mt.broker';
import { Observable, Subject, Subscription } from 'rxjs';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { AlertService } from "@alert/services/alert.service";
import { MTOrderCloseModalComponent } from 'modules/Trading/components/forex.components/mt/order-close-modal/mt-order-close-modal.component';
import { MTOrderEditModalComponent } from 'modules/Trading/components/forex.components/mt/order-edit-modal/mt-order-edit-modal.component';
import { SymbolMappingComponent } from 'modules/Trading/components/forex.components/mt/symbol-mapping/symbol-mapping.component';
import { IInstrument } from "../../../app/models/common/instrument";
import { AlgoService } from "@app/services/algo.service";
import { debounceTime } from "rxjs/operators";
import { MTHelper } from "@app/services/mt/mt.helper";
import { EBrokerInstance, IBroker } from "@app/interfaces/broker/broker";
import { BinanceOrderConfig } from "modules/Trading/components/crypto.components/binance/order-configurator/binance-order-configurator.component";
import { BinanceFuturesOrderConfig } from "modules/Trading/components/crypto.components/binance-futures/order-configurator/binance-futures-order-configurator.component";

export interface EditOrderPriceConfigBase {
    Ticket: any;
    Price: number;
    SL: number;
    TP: number;
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

@Injectable()
export class TradeFromChartService implements TradingChartDesigner.ITradingFromChartHandler {
    private _chart: TradingChartDesigner.Chart;
    private _brokerStateChangedSubscription: Subscription;
    private _ordersUpdatedSubscription: Subscription;
    private _onOrdersParametersUpdated: Subscription;
    private _orderConfig: IPlaceOrder;
    private _decimals: number = 5;
    private _pendingEdit: { [id: string]: EditOrderPriceConfigBase; } = {};
    private _ratioCache: { [id: string]: number; } = {};
    private _posSizeSubject: Subject<IPositionSizeCalculationRequest> = new Subject();

    private get _broker(): IBroker {
        return this._brokerService.activeBroker;
    }

    constructor(private _brokerService: BrokerService, private _dialog: MatDialog,
        @Inject(AlertService) protected _alertService: AlertService, protected _alogService: AlgoService) {
        this._brokerStateChangedSubscription = this._brokerService.activeBroker$.subscribe((data) => {
            this.refresh();
            if (this._broker) {
                this._ordersUpdatedSubscription = this._broker.onOrdersUpdated.subscribe(() => {
                    this._pendingEdit = {};
                    this.refresh();
                });

                this._onOrdersParametersUpdated = this._broker.onOrdersParametersUpdated.subscribe((orders: any[]) => {
                    this.handleOrdersParametersChanged(orders);
                });
            } else {
                if (this._ordersUpdatedSubscription) {
                    this._ordersUpdatedSubscription.unsubscribe();
                    this._ordersUpdatedSubscription = null;
                }
                if (this._onOrdersParametersUpdated) {
                    this._onOrdersParametersUpdated.unsubscribe();
                    this._onOrdersParametersUpdated = null;
                }
            }
        });

        this._posSizeSubject.pipe(
            debounceTime(1000)
        ).subscribe((request) => {
            this._calculatePositionSize(request);
        });
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

    public setChart(chart: TradingChartDesigner.Chart) {
        this._chart = chart;
        this.refresh();
    }

    public PlaceOrder(params: TradingChartDesigner.OrderParameters, callback: () => void): void {
        if (!this.IsTradingEnabledHandler()) {
            return;
        }
        const orderConfig = this._getOrderSettings(params);
        if (orderConfig) {
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

        this.cancelOrder(Number(id), callback);
    }

    public EditOrder(id: any, callback: () => void): void {
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

        this._dialog.open(MTOrderEditModalComponent, {
            data: {
                order: order
            }
        });
    }

    public OrderSLTPChange(id: any, price: number, callback: () => void): void {
        if (!this._broker) {
            callback();
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

        const orderId = Number(id.toString().replace("sl_", "").replace("tp_", ""));
        const order = this._broker.getOrderById(orderId);
        if (!order) {
            callback();
            return;
        }

        const editRequest = this._getEditOrder(order);

        if (id.toString().startsWith("sl_")) {
            editRequest.SL = price;
        } else if (id.toString().startsWith("tp_")) {
            editRequest.TP = price;
        } else {
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
            return
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
        if (orderConfig) {
            this._alertService.error("Broker not support trading from chart.");
            return;
        }
        
        const pricePrecision = this._broker.instrumentDecimals(this._chart.instrument.symbol);
        orderConfig.price = Math.roundToDecimals(price, pricePrecision);
        orderConfig.timeframe = this._chart.timeInterval / 1000;
        
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
            this.showOrderModal(orderConfig, null, true);
        }
    }

    public refresh() {
        if (!this._chart) {
            return;
        }

        this.clearChart();

        if (!this._broker) {
            return;
        }

        this._decimals = this._broker.instrumentDecimals(this._chart.instrument.symbol);
        this.fillOrderLines();
    }

    public GetOrderSize(priceDiff: number, risk: number, callback: (size: any) => void, skipMapping: boolean = false): void {
        if (!(this._broker instanceof MTBroker)) {
            callback("Calculate manually");
            return;
        }

        const mtBroker = this._broker as MTBroker;
        const params: IPositionSizeParameters = {
            input_risk: risk,
            price_diff: priceDiff,
            instrument: this._chart.instrument as any,
            input_accountsize: mtBroker.accountInfo.Balance,
            account_currency: mtBroker.accountInfo.Currency
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
                            this.GetOrderSize(priceDiff, risk, callback, true);
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

    public dispose() {
        this._brokerStateChangedSubscription.unsubscribe();
        if (this._ordersUpdatedSubscription) {
            this._ordersUpdatedSubscription.unsubscribe();
            this._ordersUpdatedSubscription = null;
        }
        if (this._onOrdersParametersUpdated) {
            this._onOrdersParametersUpdated.unsubscribe();
            this._onOrdersParametersUpdated = null;
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
        const size = MTHelper.calculatePositionSize(acctSize, request.params.input_risk, request.params.price_diff, request.params.contract_size);
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

    private fillOrderLines() {
        if (!this._chart || !this._broker) {
            return;
        }

        const symbol = this._broker.instrumentToBrokerFormat(this._chart.instrument.symbol);
        if (!symbol) {
            return;
        }

        const shapes = [];
        let orders = this._broker.orders.slice().filter((order) => {
            if (order.Symbol !== symbol.symbol || !order.Price) {
                return false;
            }
            return true;
        }).sort((order1, order2) => {
            return this.getOrderPriceDiff(order1) - this.getOrderPriceDiff(order2);
        });

        for (const order of orders) {

            const shape = this.createBaseShape(order);
            const shapeOrderBox = this.createBaseOrderShape(order);
            if (shapeOrderBox) {
                shapes.push(shapeOrderBox);
            }
            shape.showSLTP = true;
            shape.lineId = order.Id.toString();
            shape.lineText = `#${order.Id}`;
            shape.lineType = this.getType(order);
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

        if (shapes.length) {
            this._chart.primaryPane.addShapes(shapes);
        }
    }

    private setShapeSL(sl_shape: TradingChartDesigner.ShapeOrderLine, order: IOrder) {
        sl_shape.linePrice = order.SL;
        if (order.Side === OrderSide.Buy) {
            sl_shape.boxText = `SL`;
        } else {
            sl_shape.boxText = `SL`;
        }
    }

    private setShapeTP(tp_shape: TradingChartDesigner.ShapeOrderLine, order: IOrder) {
        tp_shape.linePrice = order.TP;
        if (order.Side === OrderSide.Buy) {
            tp_shape.boxText = `TP`;
        } else {
            tp_shape.boxText = `TP`;
        }
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

    private createBaseShape(order: IOrder): TradingChartDesigner.ShapeOrderLine {
        const shape = new TradingChartDesigner.ShapeOrderLine();
        shape.showClose = true;
        shape.isEditable = true;
        shape.boxSize = order.Size.toString();
        return shape;
    }

    private createBaseOrderShape(order: IOrder): TradingChartDesigner.ShapeSimpleTrade {
        if (!order.SL && !order.TP) {
            return null;
        }

        const shape = new TradingChartDesigner.ShapeSimpleTrade();
        shape.locked = false;
        shape.removable = false;
        shape.savable = false;
        this.updatePositionShape(shape, order);

        return shape;
    }

    private getType(order: IOrder): string {
        if (order.Type === OrderTypes.Market) {
            return order.Side === OrderSide.Buy ? "market_buy" : "market_sell";
        }
        return "pending";
    }

    private clearChart() {
        if (!this._chart) {
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
            this._chart.primaryPane.removeShapes(shapes);
            // this._chart.refreshAsync();
            this._chart.commandController.clearCommands();
        }
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
                        this._broker.cancelOrder(order.Id, OrderFillPolicy.FOK)
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

    private setLinePL(shape: TradingChartDesigner.ShapeOrderLine, order: IOrder) {
        shape.boxText = order.NetPL ? order.NetPL.toFixed(2) : "-";
    }

    private setLinePendingState(shapeId: string, price?: number) {
        if (!this._chart) {
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

    private handleOrdersParametersChanged(orders: IOrder[]) {
        if (!this._chart) {
            return;
        }

        for (const shape of this._chart.primaryPane.shapes) {
            if (shape instanceof TradingChartDesigner.ShapeOrderLine) {
                const orderLine = shape as TradingChartDesigner.ShapeOrderLine;
                for (const order of orders) {

                    if (order.Id === Number(orderLine.lineId)) {
                        this.setShapePriceAndBox(orderLine, order);
                    }

                    const slId = `sl_${order.Id.toString()}`;
                    const tpId = `tp_${order.Id.toString()}`;

                    if (slId === orderLine.lineId) {
                        this.setShapeSL(orderLine, order);
                    }

                    if (tpId === orderLine.lineId) {
                        this.setShapeTP(orderLine, order);
                    }
                }
            } else if (shape instanceof TradingChartDesigner.ShapeSimpleTrade) {
                const orderShape = shape as TradingChartDesigner.ShapeSimpleTrade;
                for (const order of orders) {
                    if (order.Id === Number(orderShape.orderId)) {
                        this.updatePositionShape(orderShape, order);
                    }
                }
            }
        }
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
        const pricePrecision = this._broker.instrumentDecimals(this._chart.instrument.symbol);
        const orderConfig = MTOrderConfig.createLimit(this._broker.instanceType);
        orderConfig.instrument = this._broker.instrumentToBrokerFormat(this._chart.instrument.symbol);

        if (!params) {
            return orderConfig;
        }

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
        orderConfig.placedFrom = params.placedFrom;
        orderConfig.tradeType = params.tradeType;
        orderConfig.side = params.side.toLowerCase() === "buy" ? OrderSide.Buy : OrderSide.Sell;
        return orderConfig;
    }

    private _getBinanceOrderSettings(params: TradingChartDesigner.OrderParameters): BaseOrderConfig {
        const pricePrecision = this._broker.instrumentDecimals(this._chart.instrument.symbol);
        const orderConfig = BinanceOrderConfig.createLimit();
        orderConfig.instrument = this._broker.instrumentToBrokerFormat(this._chart.instrument.symbol);

        if (params.price) {
            orderConfig.price = Math.roundToDecimals(params.price, pricePrecision);
        }

        orderConfig.amount = params.size;
        orderConfig.side = params.side.toLowerCase() === "buy" ? OrderSide.Buy : OrderSide.Sell;
        return orderConfig;
    }

    private _getBinanceFuturesOrderSettings(params: TradingChartDesigner.OrderParameters): BaseOrderConfig {
        const pricePrecision = this._broker.instrumentDecimals(this._chart.instrument.symbol);
        const orderConfig = BinanceFuturesOrderConfig.createLimit();
        orderConfig.instrument = this._broker.instrumentToBrokerFormat(this._chart.instrument.symbol);

        if (params.price) {
            orderConfig.price = Math.roundToDecimals(params.price, pricePrecision);
        }

        orderConfig.amount = params.size;
        orderConfig.side = params.side.toLowerCase() === "buy" ? OrderSide.Buy : OrderSide.Sell;
        return orderConfig;
    }
}
