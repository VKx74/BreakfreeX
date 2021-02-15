import { ChangeDetectionStrategy, Component, HostListener, Injector, ViewChild } from "@angular/core";
import { TradingTranslateService } from "../../../localization/token";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from "@app/services/broker.service";
import { MTOrderConfiguratorModalComponent } from './order-configurator-modal/mt-order-configurator-modal.component';
import { MTBroker } from '@app/services/mt/mt.broker';
import { OrderFillPolicy, OrderTypes, TradeManagerTab } from 'modules/Trading/models/models';
import { Linker, LinkerFactory } from "@linking/linking-manager";
import { MTOrder, MTPosition } from 'modules/Trading/models/forex/mt/mt.models';
import { MTOrderCloseModalComponent } from './order-close-modal/mt-order-close-modal.component';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { AlertService } from '@alert/services/alert.service';
import { MTOrderEditModalComponent } from './order-edit-modal/mt-order-edit-modal.component';
import { MTPositionCloseModalComponent } from './position-close-modal/mt-position-close-modal.component';
import { InstrumentService } from '@app/services/instrument.service';
import { IInstrument } from '@app/models/common/instrument';
import { Actions, LinkingAction } from '@linking/models/models';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { MTHelper } from "@app/services/mt/mt.helper";
import { SymbolMappingComponent } from "./symbol-mapping/symbol-mapping.component";
import { DataHighlightService, ITradePanelDataHighlight } from "modules/Trading/services/dataHighlight.service";

@Component({
    selector: 'mt-trade-manager',
    templateUrl: 'mt-trade-manager.component.html',
    styleUrls: ['mt-trade-manager.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class MTTradeManagerComponent {
    protected linker: Linker;
    protected _onTradePanelDataHighlightSubscription: Subscription;
    selectedIndex: number;
    selectedTabIndex: number;
    @ViewChild('tabGroup', {static: true}) tabGroup: MatTabGroup;
    
    get linkerColor(): string {
        return this.linker.getLinkingId();
    }

    get brokerConnected(): boolean {
        return this._broker != null;
    }
    
    get showCancelAll(): boolean {
        return this.selectedTabIndex === 2 && this._broker.pendingOrders && this._broker.pendingOrders.length > 0;
    }  

    get positionsAmount(): number {
        const mt5Broker = this.brokerService.activeBroker as MTBroker;
        if (!mt5Broker || !mt5Broker.positions) {
            return 0;
        }

        return mt5Broker.positions.length;
    }

    public get ordersAmount(): number {
        const mt5Broker = this.brokerService.activeBroker as MTBroker;
        if (!mt5Broker || !mt5Broker.orders) {
            return 0;
        }

        return mt5Broker.orders.filter(_ => _.Type === OrderTypes.Market).length;
    }

    public get pendingAmount(): number {
        const mt5Broker = this.brokerService.activeBroker as MTBroker;
        if (!mt5Broker || !mt5Broker.orders) {
            return 0;
        }

        return mt5Broker.orders.filter(_ => _.Type !== OrderTypes.Market).length;
    }

    public get historyAmount(): number {
        const mt5Broker = this.brokerService.activeBroker as MTBroker;
        if (!mt5Broker || !mt5Broker.ordersHistory) {
            return 0;
        }

        return mt5Broker.ordersHistory.length;
    }


    private get _broker(): MTBroker {
        return this.brokerService.activeBroker as MTBroker;
    }

    constructor(private _dialog: MatDialog,
        private brokerService: BrokerService,
        protected _alertService: AlertService,
        protected _instrumentService: InstrumentService,
        protected _dataHighlightService: DataHighlightService,
        protected _injector: Injector) {

        this.linker = this._injector.get(LinkerFactory).getLinker();
        this.linker.setDefaultLinking();
    }

    ngOnInit() {
        this._onTradePanelDataHighlightSubscription = this._dataHighlightService.onTradePanelDataHighlight.subscribe(this._handleHighlight.bind(this));
    }

    ngOnDestroy() {
        if (this._onTradePanelDataHighlightSubscription) {
            this._onTradePanelDataHighlightSubscription.unsubscribe();
            this._onTradePanelDataHighlightSubscription = null;
        }
    }

    ngAfterContentChecked() {
        if (this.tabGroup) {
            this.selectedTabIndex = this.tabGroup.selectedIndex;
        }
    }

    cancelAllPending() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Cancel orders',
                message: `Do you want to cancel all pending orders?`,
                onConfirm: () => {
                   this._cancelAllPending();
                }
            }
        });
    }

    placeOrder() {
        this._dialog.open(MTOrderConfiguratorModalComponent);
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

    disconnect() {        
        this.brokerService.disposeActiveBroker()
        .subscribe(() => {});      
    }

    showSymbolMapping() {    
        this._dialog.open(SymbolMappingComponent);    
    }

    tabChanged(data: MatTabChangeEvent) {
        this.selectedTabIndex = data.index;
    }

    public handleColorSelected(color: string) {
        this.linker.setLinking(color);
    }

    public handlePositionClose(position: MTPosition) { 
        this._dialog.open(MTPositionCloseModalComponent, {
            data: position
        });
    }

    public handleOrderClose(order: MTOrder) {
        if (order.Type === OrderTypes.Market) {
            this._dialog.open(MTOrderCloseModalComponent, {
                data: order
            });
        } else {
            const mt5Broker = this.brokerService.activeBroker as MTBroker;
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

    public handleOrderEdit(order: MTOrder) { 
        this._dialog.open(MTOrderEditModalComponent, {
            data: {
                order: order
            }
        });
    }

    public handleOpenChart(order: MTOrder | MTPosition) { 
        const mt5Broker = this.brokerService.activeBroker as MTBroker;
        if (!mt5Broker) {
            return;
        }

        const symbol = order.Symbol;
        let tf: number = null;
        if ((order as any).Comment) {
            const comment = (order as any).Comment;
            tf = MTHelper.getTradeTimeframeFromTechnicalComment(comment);
        } else {
            const symbol = order.Symbol;
            const marketOrders = mt5Broker.marketOrders;

            for (const marketOrder of marketOrders) {
                if (marketOrder.Symbol === symbol && (marketOrder as any).Comment) {
                    const comment = (marketOrder as any).Comment;
                    tf = MTHelper.getTradeTimeframeFromTechnicalComment(comment);

                    if (tf) {
                        break;
                    }
                }
            }
        }

        this._instrumentService.instrumentToDatafeedFormat(symbol).subscribe((instrument: IInstrument) => {
            if (!instrument) {
                mt5Broker.getInstruments(null, symbol).subscribe((brokerInstruments) => {
                    let brokerInstrument: IInstrument = null;
                    for (const i of brokerInstruments) {
                        if (i.symbol.toLowerCase() === symbol.toLowerCase()) {
                            brokerInstrument = i;
                            break;
                        }
                    }
                    this.showMappingConfirmation(brokerInstrument);
                });
                return;
            }
            const linkAction: LinkingAction = {
                type: Actions.ChangeInstrument,
                data: instrument
            };

            if (tf) {
                linkAction.type = Actions.ChangeInstrumentAndTimeframe;
                linkAction.data = {
                    instrument: instrument,
                    timeframe: tf
                };
            }
            this.linker.sendAction(linkAction);
        }, (error) => {
            this._alertService.warning("Failed to view chart by order symbol");
        });
    }

    private showMappingConfirmation(brokerInstrument: IInstrument) {
        return this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Symbol Mapping',
                message: `We are unable to find this market on your broker account, please map the market manually.`
            }
        }).afterClosed().subscribe((dialogResult: any) => {
            if (dialogResult) {
                this.showMappingModal(brokerInstrument);
            } else {
                this._alertService.warning("Failed to view chart by order symbol");
            }
        });
    }

    private showMappingModal(brokerInstrument: IInstrument): void {
        this._dialog.open(SymbolMappingComponent, {
            data: {
                SelectedBrokerInstrument: brokerInstrument
            }
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

    private _cancelAllPending() {
        this._alertService.info("Canceling");
        const pending =  this._broker.pendingOrders;
        const subjects = [];
        for (const order of pending) {
            const subj = this._broker.cancelOrder(order.Id, OrderFillPolicy.FOK);
            subjects.push(subj);
        }
        combineLatest(subjects).subscribe((response) => {
            this._alertService.success("Canceled");
          }, (error) => {
            // this._alertService.info("Error to cancel one of the orders");
        });
    }

    private _handleHighlight(data: ITradePanelDataHighlight) {
        if (!data) {
            return;
        }

        switch (data.ActivateTab) {
            case TradeManagerTab.Positions: this.selectedIndex = 0; break;
            case TradeManagerTab.MarketOrders: this.selectedIndex = 1; break;
            case TradeManagerTab.ActiveOrders: this.selectedIndex = 2; break;
            case TradeManagerTab.OrderHistory: this.selectedIndex = 3; break;
            case TradeManagerTab.AccountInfo: this.selectedIndex = 4; break;
            case TradeManagerTab.CurrencyRisk: this.selectedIndex = 5; break;
        }
    }
}
