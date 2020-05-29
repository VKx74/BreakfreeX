import { Component, EventEmitter, Input, Output, Injector, Inject } from '@angular/core';
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import { BreakfreeTradingNavigatorService } from 'modules/BreakfreeTrading/services/breakfreeTradingNavigator.service';
import {GoldenLayoutItemState, LayoutManagerService} from "angular-golden-layout";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';

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
    
    constructor(@Inject(GoldenLayoutItemState) protected _state: IBFTNavigatorComponentState, 
        @Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        protected _bftService: BreakfreeTradingNavigatorService, protected _injector: Injector) {
        super(_injector);

         if (_state) {
            this._loadState(_state);
        }
    }

    ngOnInit() {
        // component visible and UI elements accessible
        super.setTitle(
            this._bftTranslateService.stream('breakfreeTradingNavigatorComponentName')
        );
    }

    getComponentState(): IBFTNavigatorComponentState {
        // save your state
        return {
        };
    }

    private _loadState(state: IBFTNavigatorComponentState) {
        if (state) {
            // restore your state
        }
    }
}