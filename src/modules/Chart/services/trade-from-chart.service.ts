import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from '@app/services/broker.service';
import { MT5OrderConfiguratorModalComponent } from 'modules/Trading/components/forex.components/mt5/order-configurator-modal/mt5-order-configurator-modal.component';
import { MT5OrderConfig } from 'modules/Trading/components/forex.components/mt5/order-configurator/mt5-order-configurator.component';
import { OrderFillPolicy, OrderSide, OrderTypes } from 'modules/Trading/models/models';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import { Subscription } from 'rxjs';
import { MT5Order } from 'modules/Trading/models/forex/mt/mt.models';

@Injectable()
export class TradeFromChartService {
    private _chart: TradingChartDesigner.Chart;
    private _brokerStateChangedSubscription: Subscription;
    private _ordersUpdatedSubscription: Subscription;

    constructor(private _brokerService: BrokerService, private _dialog: MatDialog) {
        this._brokerStateChangedSubscription = this._brokerService.activeBroker$.subscribe((data) => {
            this.refresh();
            if (this._brokerService.activeBroker instanceof MT5Broker) {
                this._ordersUpdatedSubscription = this._brokerService.activeBroker.onOrdersUpdated.subscribe(() => {
                    this.refresh();
                });
            } else if (this._ordersUpdatedSubscription) {
                this._ordersUpdatedSubscription.unsubscribe();
                this._ordersUpdatedSubscription = null;
            }
        });
    }

    public setChart(chart: TradingChartDesigner.Chart) {
        this._chart = chart;
        this.refresh();
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
                const shape = new TradingChartDesigner.ShapeOrderLine();
                shape.lineId = order.Id.toString();
                shape.lineText = `#${order.Id}`;
                shape.linePrice = order.Price;
                shape.lineType = this.getType(order);
                shapes.push(shape);

                if (order.SL) {
                    const sl_shape = new TradingChartDesigner.ShapeOrderLine();
                    sl_shape.lineId = `sl_${order.Id.toString()}`;
                    sl_shape.lineText = `#${order.Id} - SL`;
                    sl_shape.linePrice = order.SL;
                    sl_shape.lineType = "sl";
                    shapes.push(sl_shape);
                }

                if (order.TP) {
                    const tp_shape = new TradingChartDesigner.ShapeOrderLine();
                    tp_shape.lineId = `TP_${order.Id.toString()}`;
                    tp_shape.lineText = `#${order.Id} - TP`;
                    tp_shape.linePrice = order.TP;
                    tp_shape.lineType = "tp";
                    shapes.push(tp_shape);
                }
            }

            if (shapes.length) {
                this._chart.primaryPane.addShapes(shapes);
            }
        }
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
}
