import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { TradingTranslateService } from "../../../localization/token";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from "@app/services/broker.service";
import { IOrder, IPosition, TradeManagerTab } from 'modules/Trading/models/models';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { AlertService } from '@alert/services/alert.service';
import { InstrumentService } from '@app/services/instrument.service';
import { IInstrument } from '@app/models/common/instrument';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { DataHighlightService, ITradePanelDataHighlight } from "modules/Trading/services/dataHighlight.service";
import { SymbolMappingComponent } from "../../forex.components/mt/symbol-mapping/symbol-mapping.component";
import { BinanceFuturesBroker } from "@app/services/binance-futures/binance-futures.broker";
import { Actions, LinkingAction } from '@linking/models/models';

@Component({
    selector: 'binance-futures-trade-manager',
    templateUrl: 'binance-futures-trade-manager.component.html',
    styleUrls: ['binance-futures-trade-manager.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class BinanceFuturesTradeManagerComponent {
    protected _onTradePanelDataHighlightSubscription: Subscription;
    protected get _binanceBroker(): BinanceFuturesBroker {
        return this.brokerService.activeBroker as BinanceFuturesBroker;
    }
    
    @Output() onOpenChart = new EventEmitter<LinkingAction>();

    get positionsAmount(): number {
        const broker = this._binanceBroker;
        if (!broker || !broker.positions) {
            return 0;
        }

        return broker.positions.length;
    }

    public get pendingAmount(): number {
        const broker = this.brokerService.activeBroker;
        if (!broker || !broker.orders) {
            return 0;
        }

        return broker.orders.length;
    }

    selectedIndex: number;
    selectedTabIndex: number;
    @ViewChild('tabGroup', {static: true}) tabGroup: MatTabGroup;

    constructor(private _dialog: MatDialog,
        private brokerService: BrokerService,
        protected _alertService: AlertService,
        protected _instrumentService: InstrumentService,
        protected _dataHighlightService: DataHighlightService) {

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

    tabChanged(data: MatTabChangeEvent) {
        this.selectedTabIndex = data.index;
    }

    public handlePositionClose(position: IPosition) {
        const broker = this._binanceBroker;
        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Close position',
                message: `Are you sure you want close '${position.Symbol}' position?`,
                onConfirm: () => {
                    broker.closePosition(position.Symbol).subscribe((result) => {
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
        });
    }

    public handleOrderClose(order: IOrder) {
        const broker = this._binanceBroker;
        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Cancel order',
                message: `Are you sure you want cancel #'${order.Id}' order?`,
                onConfirm: () => {
                    broker.cancelOrder(order.Id).subscribe((result) => {
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

    public handleOrderEdit(order: any) {
        this._alertService.info("Broker not order editing");
    }

    public handleOpenChart(order: IOrder) { 
        const broker = this.brokerService.activeBroker as BinanceFuturesBroker;
        if (!broker) {
            return;
        }

        const symbol = order.Symbol;

        this._instrumentService.instrumentToDatafeedFormat(symbol).subscribe((instrument: IInstrument) => {
            if (!instrument) {
                broker.getInstruments(null, symbol).subscribe((brokerInstruments) => {
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
            this.onOpenChart.emit(linkAction);
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

    private _handleHighlight(data: ITradePanelDataHighlight) {
        if (!data) {
            return;
        }

        switch (data.ActivateTab) {
            case TradeManagerTab.Positions: this.selectedIndex = 0; break;
            case TradeManagerTab.ActiveOrders: this.selectedIndex = 1; break;
            case TradeManagerTab.OrderHistory: this.selectedIndex = 2; break;
            case TradeManagerTab.TradeHistory: this.selectedIndex = 3; break;
            case TradeManagerTab.Assets: this.selectedIndex = 4; break;
            case TradeManagerTab.AccountInfo: this.selectedIndex = 5; break;
        }
    }
}
