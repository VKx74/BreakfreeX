import { Inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from '@app/services/broker.service';
import { MTOrderConfiguratorModalComponent } from 'modules/Trading/components/forex.components/mt/order-configurator-modal/mt-order-configurator-modal.component';
import { MTOrderConfig } from 'modules/Trading/components/forex.components/mt/order-configurator/mt-order-configurator.component';
import { OrderFillPolicy, OrderSide, OrderTypes } from 'modules/Trading/models/models';
import { MTBroker } from '@app/services/mt/mt.broker';
import { Observable, Subscription } from 'rxjs';
import { MTEditOrderPrice, MTOrder, MTPlaceOrder } from 'modules/Trading/models/forex/mt/mt.models';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { AlertService } from "@alert/services/alert.service";
import { MTOrderCloseModalComponent } from 'modules/Trading/components/forex.components/mt/order-close-modal/mt-order-close-modal.component';
import { MTOrderEditModalComponent } from 'modules/Trading/components/forex.components/mt/order-edit-modal/mt-order-edit-modal.component';
import { SymbolMappingComponent } from 'modules/Trading/components/forex.components/mt/symbol-mapping/symbol-mapping.component';
import { IInstrument } from "../../../app/models/common/instrument";

@Injectable()
export class TradeFromChartService implements TradingChartDesigner.ITradingFromChartHandler {
    private _chart: TradingChartDesigner.Chart;
    private _brokerStateChangedSubscription: Subscription;
    private _ordersUpdatedSubscription: Subscription;
    private _onOrdersParametersUpdated: Subscription;
    private _orderConfig: MTPlaceOrder;
    private _decimals: number = 5;
    private _pendingEdit: { [id: string]: MTEditOrderPrice; } = {};

    constructor(private _brokerService: BrokerService, private _dialog: MatDialog, @Inject(AlertService) protected _alertService: AlertService) {
        this._brokerStateChangedSubscription = this._brokerService.activeBroker$.subscribe((data) => {
            this.refresh();
            if (this._brokerService.activeBroker instanceof MTBroker) {
                this._ordersUpdatedSubscription = this._brokerService.activeBroker.onOrdersUpdated.subscribe(() => {
                    this._pendingEdit = {};
                    this.refresh();
                }); 
                
                this._onOrdersParametersUpdated = this._brokerService.activeBroker.onOrdersParametersUpdated.subscribe((orders: MTOrder[]) => {
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
    }

    public IsTradePlaced(): boolean {
        if (!this._orderConfig) {
            return false;
        }

        if (this._brokerService.activeBroker instanceof MTBroker) {
            const mtBroker = this._brokerService.activeBroker as MTBroker;
            const instrument = mtBroker.instrumentToBrokerFormat(this._chart.instrument.symbol);
            if (!instrument) {
                return false;        
            }
            
            return this._orderConfig.Symbol === instrument.id;
        }
        
        return false;
    }

    public setChart(chart: TradingChartDesigner.Chart) {
        this._chart = chart;
        this.refresh();
    }

    public PlaceOrder(params: TradingChartDesigner.OrderParameters, callback: () => void): void {
        if (this._brokerService.activeBroker instanceof MTBroker) {
            if (!this.IsTradingEnabledHandler()) {
                this._alertService.info(`${this._chart.instrument.symbol} not exist in connected broker`);
                // return;
            }

            const mtBroker = this._brokerService.activeBroker as MTBroker;
            const orderConfig = MTOrderConfig.createLimit(mtBroker.instanceType);
            const pricePrecision = mtBroker.instrumentDecimals(this._chart.instrument.symbol);
            orderConfig.instrument = mtBroker.instrumentToBrokerFormat(this._chart.instrument.symbol);

            if (params.price) {
                orderConfig.price = Math.roundToDecimals(params.price, pricePrecision);
            }

            if (params.sl) {
                orderConfig.sl =  Math.roundToDecimals(params.sl, pricePrecision);
                orderConfig.useSL = true;
            }

            if (params.tp) {
                orderConfig.tp =  Math.roundToDecimals(params.tp, pricePrecision);
                orderConfig.useTP = true;
            }
            
            orderConfig.amount = params.size;
            orderConfig.timeframe = params.timeframe;
            orderConfig.placedFrom = params.placedFrom;
            orderConfig.tradeType = params.tradeType;
            orderConfig.side = params.side.toLowerCase() === "buy" ? OrderSide.Buy : OrderSide.Sell;

            if (!this.IsSymbolSupported()) {                
                this.showMappingConfirmation()
                .subscribe((dialogResult: any) => {
                    if (dialogResult) {
                        this.showMappingModal();
                    } else {
                        this.showOrderModal(orderConfig, callback, false);
                    }
                });                
            } else {
                this.showOrderModal(orderConfig, callback, false);
            }
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
        if (!(this._brokerService.activeBroker instanceof MTBroker)) {
            callback();
            return;
        }

        const mtBroker = this._brokerService.activeBroker as MTBroker;
        let order: MTOrder;

        for (const o of mtBroker.orders) {
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
        const mtBroker = this._brokerService.activeBroker as MTBroker;
        if (!mtBroker) {
            callback();
            return;
        }

        const order = mtBroker.getOrderById(Number(id));
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
        const mtBroker = this._brokerService.activeBroker as MTBroker;
        if (!mtBroker) {
            callback();
            return;
        }

        const orderId = Number(id.toString().replace("sl_", "").replace("tp_", ""));
        const order = mtBroker.getOrderById(orderId);
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
        if (!this._brokerService.activeBroker || !this._chart) {
            return false;
        }
        let isMTBroker: boolean = this._brokerService.activeBroker instanceof MTBroker;
        return isMTBroker;
    }

    public IsSymbolSupported(): boolean {
        if (!this._brokerService.activeBroker || !this._chart) {
            return false;
        }

        if (this._brokerService.activeBroker instanceof MTBroker) {
            const mtBroker = this._brokerService.activeBroker as MTBroker;            
            return mtBroker.instrumentToBrokerFormat(this._chart.instrument.symbol) !== null;
        } else {
            return false;
        }
    }

    public RepeatLimitOrder(price: number): void {
        if (this._brokerService.activeBroker instanceof MTBroker) {
            const mtBroker = this._brokerService.activeBroker as MTBroker;
            this._orderConfig.Price = Math.roundToDecimals(price, this._decimals);
            this._orderConfig.Timeframe = this._chart.timeInterval / 1000;
            this._alertService.info("Processing order");
    
            mtBroker.placeOrder(this._orderConfig)
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
    }

    public PlaceLimitOrder(price: number): void {
        if (this._brokerService.activeBroker instanceof MTBroker) {
            const mtBroker = this._brokerService.activeBroker as MTBroker;
            const orderConfig = MTOrderConfig.createLimit(mtBroker.instanceType);
            const pricePrecision = mtBroker.instrumentDecimals(this._chart.instrument.symbol);
            orderConfig.instrument = mtBroker.instrumentToBrokerFormat(this._chart.instrument.symbol);
            orderConfig.price = Math.roundToDecimals(price, pricePrecision);
            orderConfig.sl = orderConfig.price;
            orderConfig.tp = orderConfig.price;
            orderConfig.timeframe = this._chart.timeInterval / 1000;            
            if (!this.IsSymbolSupported()) {                
                this.showMappingConfirmation()
                .subscribe((dialogResult: any) => {
                    if (dialogResult) {
                        this.showMappingModal();
                    } else {
                        this.showOrderModal(orderConfig, null, true);
                    }                   
                });                
            } else {
                this.showOrderModal(orderConfig, null, true);
            }
        }
    }

    public refresh() {
        if (!this._chart) {
            return;
        }

        this.clearChart();
        if (!(this._brokerService.activeBroker instanceof MTBroker)) {
            return;
        } else {
            const mtBroker = this._brokerService.activeBroker as MTBroker;
            this._decimals = mtBroker.instrumentDecimals(this._chart.instrument.symbol);
        }

        this.fillOrderLines();
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

    private getOrderPriceDiff(order: MTOrder): number {
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
        if (!this._chart) {
            return;
        }

        if (this._brokerService.activeBroker instanceof MTBroker) {
            const mtBroker = this._brokerService.activeBroker as MTBroker;
            const symbol = mtBroker.instrumentToBrokerFormat(this._chart.instrument.symbol);
            if (!symbol) {
                return;
            }

            const shapes = [];
            let orders = mtBroker.orders.slice().filter((order) => {
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
    }

    private setShapeSL(sl_shape: TradingChartDesigner.ShapeOrderLine, order: MTOrder) {
        sl_shape.linePrice = order.SL;
        const p = Math.roundToDecimals(order.SL, this._decimals);
        if (order.Side === OrderSide.Buy) {
            sl_shape.boxText = `SL`;
        } else {
            sl_shape.boxText = `SL`;
        }
    }
    
    private setShapeTP(tp_shape: TradingChartDesigner.ShapeOrderLine, order: MTOrder) {
        tp_shape.linePrice = order.TP;
        const p = Math.roundToDecimals(order.TP, this._decimals);
        if (order.Side === OrderSide.Buy) {
            tp_shape.boxText = `TP`;
        } else {
            tp_shape.boxText = `TP`;
        }
    }

    private setShapePriceAndBox(shape: TradingChartDesigner.ShapeOrderLine, order: MTOrder) {
        shape.linePrice = order.Price;

        if (order.Type === OrderTypes.Market) {
            this.setLinePL(shape, order);
            // shape.isEditable = false;
        }

        const p = Math.roundToDecimals(order.Price, this._decimals);

        if (order.Type === OrderTypes.Limit) {
            shape.boxText = `L`;
        }

        if (order.Type === OrderTypes.Stop) {
            shape.boxText = `Stop sell: ${p}`;
        }
    }

    private updatePositionShape(shape: TradingChartDesigner.ShapeSimpleTrade, order: MTOrder) {
        shape.sl = order.SL ? order.SL.toFixed(this._decimals) : order.SL;
        shape.tp = order.TP ? order.TP.toFixed(this._decimals) : order.TP;
        shape.entry = order.Price.toFixed(this._decimals);
        shape.risk = order.RiskPercentage ? order.RiskPercentage.toFixed(2) + "%" : "Unknown";
        shape.side = order.Side;
        shape.posSize = order.Size.toFixed(2);
        shape.netPL = order.NetPL ?  order.NetPL.toFixed(2) : "-";
        shape.orderId = order.Id;

        if (order.SL && order.TP) {
            const diffSL = Math.abs(order.SL - order.Price);
            const diffTP = Math.abs(order.TP - order.Price);
            shape.slRatio = Number(diffTP / diffSL).toFixed(1);
        } else {
            shape.slRatio = "Unknown";
        }
    }

    private createBaseShape(order: MTOrder): TradingChartDesigner.ShapeOrderLine {
        const shape = new TradingChartDesigner.ShapeOrderLine();
        shape.showClose = true;
        shape.isEditable = true;
        shape.boxSize = order.Size.toString();
        return shape;
    }

    private createBaseOrderShape(order: MTOrder): TradingChartDesigner.ShapeSimpleTrade {
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

    private getType(order: MTOrder): string {
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
        if (!(this._brokerService.activeBroker instanceof MTBroker)) {
            callback();
            return;
        }

        const mtBroker = this._brokerService.activeBroker as MTBroker;
        let order: MTOrder;

        for (const o of mtBroker.orders) {
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
                        mtBroker.cancelOrder(order.Id, OrderFillPolicy.FOK)
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

    private setLinePL(shape: TradingChartDesigner.ShapeOrderLine, order: MTOrder) {
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

    private handleOrdersParametersChanged(orders: MTOrder[]) {
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

    private _getEditOrder(order: MTOrder): MTEditOrderPrice  {
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

    private _editOrder(editRequest: MTEditOrderPrice, callback: () => void) {
        const mtBroker = this._brokerService.activeBroker as MTBroker;
        this.setLinePendingState(editRequest.Ticket.toString());
        this._pendingEdit[editRequest.Ticket] = editRequest;
        
        mtBroker.editOrderPrice(editRequest).subscribe(
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
                message: `Market unrecognized in your brokerage, please manually map instrument to your brokerage. Do you want to do it now?`
            }
        }).afterClosed();
    }

    private showMappingModal(): void {
        this._dialog.open(SymbolMappingComponent, {
            data: {
                SelectedFeedInstrument: this._chart.instrument
            }
        });
    }

    private showOrderModal(orderConfig: any, callback: () => void, doGetOrder: boolean): void {
        this._dialog.open(MTOrderConfiguratorModalComponent, {
            data: {
                tradeConfig: orderConfig,
                orderPlacedHandler: (order: MTPlaceOrder) => {
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
}
