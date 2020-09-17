import { Inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from '@app/services/broker.service';
import { MT5OrderConfiguratorModalComponent } from 'modules/Trading/components/forex.components/mt5/order-configurator-modal/mt5-order-configurator-modal.component';
import { MT5OrderConfig } from 'modules/Trading/components/forex.components/mt5/order-configurator/mt5-order-configurator.component';
import { OrderFillPolicy, OrderSide, OrderTypes } from 'modules/Trading/models/models';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import { Subscription } from 'rxjs';
import { MT5Order } from 'modules/Trading/models/forex/mt/mt.models';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { AlertService } from "@alert/services/alert.service";
import { MT5OrderCloseModalComponent } from 'modules/Trading/components/forex.components/mt5/order-close-modal/mt5-order-close-modal.component';
import { MT5OrderEditModalComponent } from 'modules/Trading/components/forex.components/mt5/order-edit-modal/mt5-order-edit-modal.component';

@Injectable()
export class TradeFromChartService implements TradingChartDesigner.ITradingFromChartHandler {
    private _chart: TradingChartDesigner.Chart;
    private _brokerStateChangedSubscription: Subscription;
    private _ordersUpdatedSubscription: Subscription;
    private _onOrdersParametersUpdated: Subscription;

    constructor(private _brokerService: BrokerService, private _dialog: MatDialog, @Inject(AlertService) protected _alertService: AlertService) {
        this._brokerStateChangedSubscription = this._brokerService.activeBroker$.subscribe((data) => {
            this.refresh();
            if (this._brokerService.activeBroker instanceof MT5Broker) {
                this._ordersUpdatedSubscription = this._brokerService.activeBroker.onOrdersUpdated.subscribe(() => {
                    this.refresh();
                }); 
                
                this._onOrdersParametersUpdated = this._brokerService.activeBroker.onOrdersParametersUpdated.subscribe((orders: MT5Order[]) => {
                    this.updatePL(orders);
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
        const mt5Broker = this._brokerService.activeBroker as MT5Broker;
        if (!mt5Broker) {
            callback();
            return;
        }

        let isSL = false;
        let isTP = false;

        if (id.toString().startsWith("sl_")) {
            isSL = true;
        } 
        
        if (id.toString().startsWith("tp_")) {
            isTP = true;
        }

        const orderId = Number(id.toString().replace("sl_", "").replace("tp_", ""));
        let order: MT5Order;

        for (const o of mt5Broker.orders) {
            if (o.Id === orderId) {
                order = o;
                break;
            }
        }

        if (!order) {
            callback();
            return;
        }

        const updateData = {};

        if (isSL) {
            updateData["sl"] = price;
        }
        if (isTP) {
            updateData["tp"] = price;
        }

        if (!isSL && !isTP) {
            updateData["price"] = price;
        }

        this._dialog.open(MT5OrderEditModalComponent, {
            data: {
                order: order,
                updateParams: updateData
            }
        }).afterClosed().subscribe(() => {
            callback();
        });
    }

    public IsTradingEnabledHandler(): boolean {
        if (!this._brokerService.activeBroker || !this._chart) {
            return false;
        }

        if (this._brokerService.activeBroker instanceof MT5Broker) {
            const mt5Broker = this._brokerService.activeBroker as MT5Broker;
            return mt5Broker.instrumentToBrokerFormat(this._chart.instrument.symbol) !== null;
        } else {
            return false;
        }
    }

    public PlaceLimitOrder(price: number): void {
        if (this._brokerService.activeBroker instanceof MT5Broker) {
            const mt5Broker = this._brokerService.activeBroker as MT5Broker;
            const orderConfig = MT5OrderConfig.create();
            const pricePrecision = mt5Broker.instrumentDecimals(this._chart.instrument.symbol);
            orderConfig.type = OrderTypes.Limit;
            orderConfig.fillPolicy = OrderFillPolicy.FF;
            orderConfig.instrument = mt5Broker.instrumentToBrokerFormat(this._chart.instrument.symbol);
            orderConfig.price = Math.roundToDecimals(price, pricePrecision);
            this._dialog.open(MT5OrderConfiguratorModalComponent, {
                data: {
                    tradeConfig: orderConfig
                }
            });
        }
    }

    public refresh() {
        if (!this._chart) {
            return;
        }

        this.clearChart();
        if (!(this._brokerService.activeBroker instanceof MT5Broker)) {
            return;
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

        if (this._brokerService.activeBroker instanceof MT5Broker) {
            const mt5Broker = this._brokerService.activeBroker as MT5Broker;
            const symbol = mt5Broker.instrumentToBrokerFormat(this._chart.instrument.symbol);
            if (!symbol) {
                return;
            }

            const shapes = [];
            for (const order of mt5Broker.orders) {
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

    private setShapeSL(sl_shape: TradingChartDesigner.ShapeOrderLine, order: MT5Order) {
        sl_shape.linePrice = order.SL;
        if (order.Side === OrderSide.Buy) {
            sl_shape.boxText = `SL: Trigger <= ${order.SL}`;
        } else {
            sl_shape.boxText = `SL: Trigger >= ${order.SL}`;
        }
    }
    
    private setShapeTP(tp_shape: TradingChartDesigner.ShapeOrderLine, order: MT5Order) {
        tp_shape.linePrice = order.TP;
        if (order.Side === OrderSide.Buy) {
            tp_shape.boxText = `TP: Trigger >= ${order.TP}`;
        } else {
            tp_shape.boxText = `TP: Trigger <= ${order.TP}`;
        }
    }

    private setShapePriceAndBox(shape: TradingChartDesigner.ShapeOrderLine, order: MT5Order) {
        shape.linePrice = order.Price;

        if (order.Type === OrderTypes.Market) {
            this.setLinePL(shape, order);
            shape.isEditable = false;
        }

        if (order.Type === OrderTypes.Limit) {
            shape.boxText = `L: ${order.Price}`;
        }

        if (order.Type === OrderTypes.Stop) {
            shape.boxText = `S: ${order.Price}`;
        }
    }

    private createBaseShape(order: MT5Order): TradingChartDesigner.ShapeOrderLine {
        const shape = new TradingChartDesigner.ShapeOrderLine();
        shape.showClose = true;
        shape.isEditable = true;
        shape.boxSize = order.Size.toString();
        return shape;
    }

    private getType(order: MT5Order): string {
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
        if (!(this._brokerService.activeBroker instanceof MT5Broker)) {
            callback();
            return;
        }

        const mt5Broker = this._brokerService.activeBroker as MT5Broker;
        let order: MT5Order;

        for (const o of mt5Broker.orders) {
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
                        mt5Broker.cancelOrder(order.Id, OrderFillPolicy.FOK)
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
            this._dialog.open(MT5OrderCloseModalComponent, {
                data: order
            }).afterClosed().subscribe(() => {
                callback();
            });
        }
    }

    private setLinePL(shape: TradingChartDesigner.ShapeOrderLine, order: MT5Order) {
        shape.boxText = order.NetPL ? order.NetPL.toFixed(2) : "-";
    }

    private updatePL(orders: MT5Order[]) {
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
