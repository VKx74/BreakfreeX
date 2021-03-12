import { Component, ViewChild } from "@angular/core";
import { TradingTranslateService } from "../../../localization/token";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from "@app/services/broker.service";
import { MTBroker } from '@app/services/mt/mt.broker';
import { OrderTypes, TradeManagerTab } from 'modules/Trading/models/models';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { AlertService } from '@alert/services/alert.service';
import { InstrumentService } from '@app/services/instrument.service';
import { IInstrument } from '@app/models/common/instrument';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { DataHighlightService, ITradePanelDataHighlight } from "modules/Trading/services/dataHighlight.service";
import { SymbolMappingComponent } from "../../forex.components/mt/symbol-mapping/symbol-mapping.component";
import { BinanceBroker } from "@app/services/binance/binance.broker";

@Component({
    selector: 'binance-trade-manager',
    templateUrl: 'binance-trade-manager.component.html',
    styleUrls: ['binance-trade-manager.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class BinanceTradeManagerComponent {
    protected _onTradePanelDataHighlightSubscription: Subscription;
    protected get _binanceBroker(): BinanceBroker {
        return this.brokerService.activeBroker as BinanceBroker;
    }

    selectedIndex: number;
    selectedTabIndex: number;
    @ViewChild('tabGroup', {static: true}) tabGroup: MatTabGroup;

    get fundsAmount(): number {
        const broker = this._binanceBroker;
        return 0;
        // if (!broker || !broker.accountInfo || !broker.accountInfo.Funds) {
        //     return 0;
        // }

        // return broker.accountInfo.Funds.length;
    }

    public get pendingAmount(): number {
        const broker = this.brokerService.activeBroker;
        if (!broker || !broker.orders) {
            return 0;
        }

        return broker.orders.filter(_ => _.Type !== OrderTypes.Market).length;
    }

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

    public handleOrderClose(order: any) {
        // if (order.Type === OrderTypes.Market) {
        //     this._dialog.open(MTOrderCloseModalComponent, {
        //         data: order
        //     });
        // } else {
        //     const broker = this.brokerService.activeBroker as MTBroker;
        //     this._dialog.open(ConfirmModalComponent, {
        //         data: {
        //             title: 'Cancel order',
        //             message: `Are you sure you want cancel #'${order.Id}' order?`,
        //             onConfirm: () => {
        //                 broker.cancelOrder(order.Id, OrderFillPolicy.FOK).subscribe((result) => {
        //                     if (result.result) {
        //                         this._alertService.success("Order canceled");
        //                     } else {
        //                         this._alertService.error("Failed to cancel order: " + result.msg);
        //                     }
        //                 }, (error) => {
        //                     this._alertService.error("Failed to cancel order: " + error);
        //                 });
        //             }
        //         }
        //     });
        // }
    }

    public handleOrderEdit(order: any) { 
        // this._dialog.open(MTOrderEditModalComponent, {
        //     data: {
        //         order: order
        //     }
        // });
    }

    public handleOpenChart(order: any) { 
        // const broker = this.brokerService.activeBroker;
        // if (!broker) {
        //     return;
        // }

        // const symbol = order.Symbol;
        // let tf: number = null;
        // if ((order as any).Comment) {
        //     const comment = (order as any).Comment;
        //     tf = MTHelper.getTradeTimeframeFromTechnicalComment(comment);
        // } else {
        //     const marketOrders = broker.;

        //     for (const marketOrder of marketOrders) {
        //         if (marketOrder.Symbol === symbol && (marketOrder as any).Comment) {
        //             const comment = (marketOrder as any).Comment;
        //             tf = MTHelper.getTradeTimeframeFromTechnicalComment(comment);

        //             if (tf) {
        //                 break;
        //             }
        //         }
        //     }
        // }

        // this._instrumentService.instrumentToDatafeedFormat(symbol).subscribe((instrument: IInstrument) => {
        //     if (!instrument) {
        //         broker.getInstruments(null, symbol).subscribe((brokerInstruments) => {
        //             let brokerInstrument: IInstrument = null;
        //             for (const i of brokerInstruments) {
        //                 if (i.symbol.toLowerCase() === symbol.toLowerCase()) {
        //                     brokerInstrument = i;
        //                     break;
        //                 }
        //             }
        //             this.showMappingConfirmation(brokerInstrument);
        //         });
        //         return;
        //     }
        //     const linkAction: LinkingAction = {
        //         type: Actions.ChangeInstrument,
        //         data: instrument
        //     };

        //     if (tf) {
        //         linkAction.type = Actions.ChangeInstrumentAndTimeframe;
        //         linkAction.data = {
        //             instrument: instrument,
        //             timeframe: tf
        //         };
        //     }
        //     // this.linker.sendAction(linkAction);
        // }, (error) => {
        //     this._alertService.warning("Failed to view chart by order symbol");
        // });
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
            case TradeManagerTab.Funds: this.selectedIndex = 0; break;
            case TradeManagerTab.ActiveOrders: this.selectedIndex = 1; break;
            case TradeManagerTab.OrderHistory: this.selectedIndex = 2; break;
            case TradeManagerTab.TradeHistory: this.selectedIndex = 3; break;
        }
    }
}
