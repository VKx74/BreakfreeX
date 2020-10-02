import { ChangeDetectionStrategy, Component, Injector } from "@angular/core";
import { TradingTranslateService } from "../../../localization/token";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from "@app/services/broker.service";
import { MT5OrderConfiguratorModalComponent } from './order-configurator-modal/mt5-order-configurator-modal.component';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import { OrderFillPolicy, OrderTypes } from 'modules/Trading/models/models';
import { Linker, LinkerFactory } from "@linking/linking-manager";
import { MT5Order, MT5Position } from 'modules/Trading/models/forex/mt/mt.models';
import { MT5OrderCloseModalComponent } from './order-close-modal/mt5-order-close-modal.component';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { AlertService } from '@alert/services/alert.service';
import { MT5OrderEditModalComponent } from './order-edit-modal/mt5-order-edit-modal.component';
import { MT5PositionCloseModalComponent } from './position-close-modal/mt5-position-close-modal.component';
import { InstrumentService } from '@app/services/instrument.service';
import { IInstrument } from '@app/models/common/instrument';
import { Actions, LinkingAction } from '@linking/models/models';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
    selector: 'mt5-trade-manager',
    templateUrl: 'mt5-trade-manager.component.html',
    styleUrls: ['mt5-trade-manager.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class MT5TradeManagerComponent {
    protected linker: Linker;
    
    selectedTabIndex: number;

    get linkerColor(): string {
        return this.linker.getLinkingId();
    }

    get brokerConnected(): boolean {
        return this._broker != null;
    }

    get positionsAmount(): number {
        const mt5Broker = this.brokerService.activeBroker as MT5Broker;
        if (!mt5Broker || !mt5Broker.positions) {
            return 0;
        }

        return mt5Broker.positions.length;
    }

    public get ordersAmount(): number {
        const mt5Broker = this.brokerService.activeBroker as MT5Broker;
        if (!mt5Broker || !mt5Broker.orders) {
            return 0;
        }

        return mt5Broker.orders.filter(_ => _.Type === OrderTypes.Market).length;
    }

    public get pendingAmount(): number {
        const mt5Broker = this.brokerService.activeBroker as MT5Broker;
        if (!mt5Broker || !mt5Broker.orders) {
            return 0;
        }

        return mt5Broker.orders.filter(_ => _.Type !== OrderTypes.Market).length;
    }

    public get historyAmount(): number {
        const mt5Broker = this.brokerService.activeBroker as MT5Broker;
        if (!mt5Broker || !mt5Broker.ordersHistory) {
            return 0;
        }

        return mt5Broker.ordersHistory.length;
    }


    private get _broker(): MT5Broker {
        return this.brokerService.activeBroker as MT5Broker;
    }

    constructor(private _dialog: MatDialog,
        private brokerService: BrokerService,
        protected _alertService: AlertService,
        protected _instrumentService: InstrumentService,
        protected _injector: Injector) {

        this.linker = this._injector.get(LinkerFactory).getLinker();
        this.linker.setDefaultLinking();
    }

    placeOrder() {
        this._dialog.open(MT5OrderConfiguratorModalComponent);
    }

    reconnect() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Reconnect',
                message: `Reconnect to current broker account?`,
                onConfirm: () => {
                   this._reconnect();
                }
            }
        });
    }

    tabChanged(data: MatTabChangeEvent) {
        this.selectedTabIndex = data.index;
    }

    public handleColorSelected(color: string) {
        this.linker.setLinking(color);
    }

    public handlePositionClose(position: MT5Position) { 
        this._dialog.open(MT5PositionCloseModalComponent, {
            data: position
        });
    }

    public handleOrderClose(order: MT5Order) {
        if (order.Type === OrderTypes.Market) {
            this._dialog.open(MT5OrderCloseModalComponent, {
                data: order
            });
        } else {
            const mt5Broker = this.brokerService.activeBroker as MT5Broker;
            this._dialog.open(ConfirmModalComponent, {
                data: {
                    title: 'Cancel order',
                    message: `Are you sure you want cancel #'${order.Id}' order?`,
                    onConfirm: () => {
                        mt5Broker.cancelOrder(order.Id, OrderFillPolicy.FOK).subscribe((result) => {
                            if (result.result) {
                                this._alertService.success("Order canceled");
                            } else {
                                this._alertService.error("Failed to cancel order: " + result.msg);
                            }
                        }, (error) => {
                            this._alertService.error("Failed to cancel order: " + error);
                        });
                    }
                }
            });
        }
    }

    public handleOrderEdit(order: MT5Order) { 
        this._dialog.open(MT5OrderEditModalComponent, {
            data: {
                order: order
            }
        });
    }

    public handleOpenChart(order: MT5Order | MT5Position) { 
        this._instrumentService.getInstrumentsBySymbol(order.Symbol).subscribe((data: IInstrument[]) => {
            if (!data || !data.length) {
                this._alertService.warning("Failed to view chart by order symbol");
                return;
            }
            const instrument = data[0];
            const linkAction: LinkingAction = {
                type: Actions.ChangeInstrument,
                data: instrument
            };
            this.linker.sendAction(linkAction);
        }, (error) => {
            this._alertService.warning("Failed to view chart by order symbol");
        });
    }

    private _reconnect() {
        this._alertService.info("Reconnecting");
        this.brokerService.reconnect().subscribe((res) => {
            if (res.result) {
                this._alertService.success("Broker reconnected");
            } else {
                this._alertService.warning("Failed to reconnect to broker");
            }
        }, (error) => {
            this._alertService.warning("Failed to reconnect to broker");
        });
    }
}
