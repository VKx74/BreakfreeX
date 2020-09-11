import { Component, EventEmitter, Input, Output, Injector, Inject, ElementRef, ViewChild } from '@angular/core';
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import { BreakfreeTradingNavigatorService, INavigatorItem } from 'modules/BreakfreeTrading/services/breakfreeTradingNavigator.service';
import {GoldenLayoutItemState, LayoutManagerService} from "angular-golden-layout";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';
import { BreakfreeTradingService } from 'modules/BreakfreeTrading/services/breakfreeTrading.service';
import bind from "bind-decorator";
import { of, Subscription } from 'rxjs';
import { IInstrument } from '@app/models/common/instrument';
import { ClipboardService } from 'ngx-clipboard';
import {AlertService} from "@alert/services/alert.service";
import { ITimeFrame } from '@app/services/algo.service';
import { BrokerService } from '@app/services/broker.service';
import { MatDialog } from '@angular/material/dialog';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import { MT5OrderConfig } from 'modules/Trading/components/forex.components/mt5/order-configurator/mt5-order-configurator.component';
import { OrderTypes, OrderSide } from 'modules/Trading/models/models';
import { MT5OrderConfiguratorModalComponent } from 'modules/Trading/components/forex.components/mt5/order-configurator-modal/mt5-order-configurator-modal.component';

export interface IBFTNavigatorComponentState {
}

@Component({
    selector: 'BreakfreeTradingNavigator',
    templateUrl: './breakfreeTradingNavigator.component.html',
    styleUrls: ['./breakfreeTradingNavigator.component.scss']
})
export class BreakfreeTradingNavigatorComponent extends BaseLayoutItemComponent {

    static componentName = 'BreakfreeTradingNavigator';

    static previewImgClass = 'crypto-icon-watchlist';

    @ViewChild('content', {static: false}) contentBox: ElementRef;

    private _itemAdded: Subscription;
    private _itemRemoved: Subscription;

    
    public objective: string;
    public status: string;
    public suggestedrisk: string;
    public positionsize: string;
    public pas: string;
    public macrotrend: string;
    public n_currencySymbol: string;

    public get Items(): INavigatorItem[] {
        return this._bftNavigatorService.Items;
    }

    public SelectedItem: INavigatorItem;

    public get Data(): any {
        return this.SelectedItem ? this.SelectedItem.data : null;
    }
    
    public get Instrument(): IInstrument {
        return this.SelectedItem ? this.SelectedItem.parameters.instrument : null;
    } 

    public get ReplayBack(): number {
        return this.SelectedItem ? this.SelectedItem.parameters.replay_back : null;
    } 
    
    public get Timeframe(): ITimeFrame {
        return this.SelectedItem ? this.SelectedItem.parameters.timeframe : null;
    }
    
    constructor(@Inject(GoldenLayoutItemState) protected _state: IBFTNavigatorComponentState, 
        @Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        private _clipboardService: ClipboardService, private _alertService: AlertService,
        private _brokerService: BrokerService, private _dialog: MatDialog,
        protected _bftNavigatorService: BreakfreeTradingNavigatorService, protected _injector: Injector) {
        super(_injector);

        if (_state) {
            this._loadState(_state);
        }
    }

    ngOnInit() {
        super.setTitle(
            this._bftTranslateService.stream('breakfreeTradingNavigatorComponentName')
        );

        this._selectDefaultItem();

        this._itemAdded = this._bftNavigatorService.onItemAdded.subscribe(this._handleItemAdded.bind(this));
        this._itemRemoved = this._bftNavigatorService.onItemRemoved.subscribe(this._handleItemRemoved.bind(this));
    }

    getComponentState(): IBFTNavigatorComponentState {
        // save your state
        return {
        };
    }

    @bind
    captionText(value: INavigatorItem) {
        const tf = value.parameters.timeframe;
        const instr = value.parameters.instrument;
        const params = `${instr.symbol} - ${instr.exchange} - ${tf.interval}${tf.periodicity}`;
        return of (params);
    }
    
    itemSelected(item: INavigatorItem) {
        this.SelectedItem = item;
    }

    copyToClipboard() {
        this._clipboardService.copy(this._getContentText());
        this._alertService.success("Copied");
    }

    copyToClipboardSingleValue(event: MouseEvent) {
        this._clipboardService.copy($(event.target).text().trim());
        this._alertService.success("Copied");
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this._itemAdded) {
            this._itemAdded.unsubscribe();
        }
        if (this._itemRemoved) {
            this._itemRemoved.unsubscribe();
        }
    }

    tradePossible() {
        if (!this._brokerService.activeBroker || !this.Data) {
            return false;
        }
        
        if (this._brokerService.activeBroker instanceof MT5Broker) {
            const mt5Broker = this._brokerService.activeBroker as MT5Broker;
            return mt5Broker.isInstrumentAvailable(this.SelectedItem.parameters.instrument);
        } else {
            return false;
        }
    }

    placeOrder(entry_number: number) { 
        if (!this.Data) {
            return;
        }

        if (this._brokerService.activeBroker instanceof MT5Broker) {
            const mt5Broker = this._brokerService.activeBroker as MT5Broker;
            const orderConfig = MT5OrderConfig.create();
            const pricePrecision = mt5Broker.instrumentDecimals(this.SelectedItem.parameters.instrument.symbol);
            orderConfig.type = OrderTypes.Limit;
            orderConfig.instrument = this.SelectedItem.parameters.instrument;
            orderConfig.useTP = true;
            orderConfig.useSL = true;
            orderConfig.side = this.Data.algo_Entry > this.Data.algo_TP2 ? OrderSide.Sell : OrderSide.Buy;

            if (entry_number === 1) {
                orderConfig.price = Math.roundToDecimals(this.Data.algo_Entry_low, pricePrecision);
                orderConfig.tp = Math.roundToDecimals(this.Data.algo_TP1_low, pricePrecision);
            } else if (entry_number === 2) {
                orderConfig.price = Math.roundToDecimals(this.Data.algo_Entry, pricePrecision);
                orderConfig.tp = Math.roundToDecimals(this.Data.algo_TP1_high, pricePrecision);
            } else {
                orderConfig.price = Math.roundToDecimals(this.Data.algo_Entry_high, pricePrecision);
                orderConfig.tp = Math.roundToDecimals(this.Data.algo_TP2, pricePrecision);
            }

            orderConfig.sl = Math.roundToDecimals(this.Data.algo_Stop, pricePrecision);
            
            this._dialog.open(MT5OrderConfiguratorModalComponent, {
                data: {
                    tradeConfig: orderConfig
                }
            });
        }
    }

    protected useLinker(): boolean { 
        return false;
    }

    private _getContentText(): string {
        const $contentBox = $(this.contentBox.nativeElement);
        const items = $contentBox.children();
        let response = "";
        for (const item of items) {
            const title = $(item).find(".value1").text();
            const value = $(item).find(".value2").text();

            response += `${title} ${value} \n`;
        }
        return response;
    }

    private _handleItemAdded(newItem: INavigatorItem) {
        if (!this.SelectedItem) {
            this._selectDefaultItem();
        }
    }

    private _handleItemRemoved(removedItem: INavigatorItem) {
        if (this.SelectedItem.indicatorId === removedItem.indicatorId) {
            this._selectDefaultItem();
        }
    }

    private _selectDefaultItem() {
        if (this.Items && this.Items.length) {
            this.SelectedItem = this.Items[0];
        } else {
            this.SelectedItem = null;
        }
    }

    private _loadState(state: IBFTNavigatorComponentState) {
        if (state) {
            // restore your state
        }
    }
}

