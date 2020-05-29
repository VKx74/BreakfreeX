import { Component, EventEmitter, Input, Output, Injector, Inject } from '@angular/core';
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import { BreakfreeTradingProService } from 'modules/BreakfreeTrading/services/breakfreeTradingPro.service';
import {GoldenLayoutItemState, LayoutManagerService} from "angular-golden-layout";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';

export interface IBFTProComponentState {
}

@Component({
    selector: 'BreakfreeTradingPro',
    templateUrl: './breakfreeTradingPro.component.html',
    styleUrls: ['./breakfreeTradingPro.component.scss']
})
export class BreakfreeTradingProComponent extends BaseLayoutItemComponent {

    static componentName = 'BreakfreeTradingPro';

    static previewImgClass = 'crypto-icon-watchlist';
    
    constructor(@Inject(GoldenLayoutItemState) protected _state: IBFTProComponentState, 
        @Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        protected _bftService: BreakfreeTradingProService, protected _injector: Injector) {
        super(_injector);

         if (_state) {
            this._loadState(_state);
        }
    }

    ngOnInit() {
        // component visible and UI elements accessible
        super.setTitle(
            this._bftTranslateService.stream('breakfreeTradingProComponentName')
        );
    }

    getComponentState(): IBFTProComponentState {
        // save your state
        return {
        };
    }

    private _loadState(state: IBFTProComponentState) {
        if (state) {
            // restore your state
        }
    }
}