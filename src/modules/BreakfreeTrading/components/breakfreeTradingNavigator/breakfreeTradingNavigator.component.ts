import { Component, EventEmitter, Input, Output, Injector, Inject } from '@angular/core';
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import { BreakfreeTradingNavigatorService, INavigatorItem } from 'modules/BreakfreeTrading/services/breakfreeTradingNavigator.service';
import {GoldenLayoutItemState, LayoutManagerService} from "angular-golden-layout";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';
import { BreakfreeTradingService, ITimeFrame } from 'modules/BreakfreeTrading/services/breakfreeTrading.service';
import bind from "bind-decorator";
import { of, Subscription } from 'rxjs';
import { IInstrument } from '@app/models/common/instrument';

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

    private _itemAdded: Subscription;
    private _itemRemoved: Subscription;

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
    
    public get Timeframe(): ITimeFrame {
        return this.SelectedItem ? this.SelectedItem.parameters.timeframe : null;
    }
    
    constructor(@Inject(GoldenLayoutItemState) protected _state: IBFTNavigatorComponentState, 
        @Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        protected _bftNavigatorService: BreakfreeTradingNavigatorService, protected _injector: Injector) {
        super(_injector);

        if (_state) {
            this._loadState(_state);
        }
    }

    
    objective: string;
    status: string;
    suggestedrisk: string;
    positionsize: string;
    pas: string;
    macrotrend: string;
    n_currencySymbol: string;

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

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this._itemAdded) {
            this._itemAdded.unsubscribe();
        }
        if (this._itemRemoved) {
            this._itemRemoved.unsubscribe();
        }
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

