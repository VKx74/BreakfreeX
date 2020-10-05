import { Inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from '@app/services/broker.service';
import { MTOrderConfiguratorModalComponent } from 'modules/Trading/components/forex.components/mt/order-configurator-modal/mt-order-configurator-modal.component';
import { MTOrderConfig } from 'modules/Trading/components/forex.components/mt/order-configurator/mt-order-configurator.component';
import { OrderFillPolicy, OrderSide, OrderTypes } from 'modules/Trading/models/models';
import { MTBroker } from '@app/services/mt/mt.broker';
import { Subscription } from 'rxjs';
import { MTEditOrderPrice, MTOrder, MTPlaceOrder } from 'modules/Trading/models/forex/mt/mt.models';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { AlertService } from "@alert/services/alert.service";
import { MTOrderCloseModalComponent } from 'modules/Trading/components/forex.components/mt/order-close-modal/mt-order-close-modal.component';

@Injectable()
export class TradeFromChartService implements TradingChartDesigner.ITradingFromChartHandler {
    private _chart: TradingChartDesigner.Chart;
    private _brokerStateChangedSubscription: Subscription;
    private _ordersUpdatedSubscription: Subscription;
    private _onOrdersParametersUpdated: Subscription;
    private _orderConfig: MTPlaceOrder;
    private _decimals: number = 5;

    constructor(private _brokerService: BrokerService, private _dialog: MatDialog, @Inject(AlertService) protected _alertService: AlertService) {
        this._brokerStateChangedSubscription = this._brokerService.activeBroker$.subscribe((data) => {
            this.refresh();
            if (this._brokerService.activeBroker instanceof MTBroker) {
                this._ordersUpdatedSubscription = this._brokerService.activeBroker.onOrdersUpdated.subscribe(() => {
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
            return this._orderConfig.Symbol === instrument.id;
        }
        
        return false;
    }

    public setChart(chart: TradingChartDesigner.Chart) {
        this._chart = chart;
        this.refresh();
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

        const editRequest: MTEditOrderPrice = {
            Ticket: order.Id,
            Price: order.Price,
            SL: order.SL,
            TP: order.TP
        };

        if (id.toString().startsWith("sl_")) {
            editRequest.SL = price;
        } else if (id.toString().startsWith("tp_")) {
            editRequest.TP = price;
        } else {
            editRequest.Price = price;
        }

        this.setLinePendingState(id.toString(), price);

        mtBroker.editOrderPrice(editRequest).subscribe(
            (result) => {
                callback();
                if (result.result) {
                    this._alertService.success("Order modified");
                } else {
                    this._alertService.error("Failed to modify order: " + result.msg);
                    this.refresh();
                }
            },
            (error) => {
                callback();
                this._alertService.error("Failed to modify order: " + error);
                this.refresh();
            }
        );
       
    }

    public IsTradingEnabledHandler(): boolean {
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
            this._dialog.open(MTOrderConfiguratorModalComponent, {
                data: {
                    tradeConfig: orderConfig,
                    orderPlacedHandler: (order: MTPlaceOrder) => {
                        this._orderConfig = order;
                    }
                }
            });
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
            for (const order of mtBroker.orders) {
                if (order.Symbol !== symbol.symbol || !order.Price) {
                    continue;
                }
                const shape = this.createBaseShape(order);
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
            shape.isEditable = false;
        }

        const p = Math.roundToDecimals(order.Price, this._decimals);

        if (order.Type === OrderTypes.Limit) {
            shape.boxText = `L`;
        }

        if (order.Type === OrderTypes.Stop) {
            shape.boxText = `Stop sell: ${p}`;
        }
    }

    private createBaseShape(order: MTOrder): TradingChartDesigner.ShapeOrderLine {
        const shape = new TradingChartDesigner.ShapeOrderLine();
        shape.showClose = true;
        shape.isEditable = true;
        shape.boxSize = order.Size.toString();
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
            if (shape instanceof TradingChartDesigner.ShapeOrderLine) {
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
            }
        }
    }
}
