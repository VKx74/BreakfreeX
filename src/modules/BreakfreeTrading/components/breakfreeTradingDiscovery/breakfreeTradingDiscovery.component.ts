import { Component, EventEmitter, Input, Output, Injector, Inject } from '@angular/core';
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import { BreakfreeTradingDiscoveryService } from 'modules/BreakfreeTrading/services/breakfreeTradingDiscovery.service';
import {GoldenLayoutItemState, LayoutManagerService} from "angular-golden-layout";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';

export interface IBFTDiscoveryComponentState {
}

@Component({
    selector: 'BreakfreeTradingDiscovery',
    templateUrl: './breakfreeTradingDiscovery.component.html',
    styleUrls: ['./breakfreeTradingDiscovery.component.scss']
})
export class BreakfreeTradingDiscoveryComponent extends BaseLayoutItemComponent {

    static componentName = 'BreakfreeTradingDiscovery';

    static previewImgClass = 'crypto-icon-watchlist';
    
    constructor(@Inject(GoldenLayoutItemState) protected _state: IBFTDiscoveryComponentState, 
        @Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        protected _bftService: BreakfreeTradingDiscoveryService, protected _injector: Injector) {
        super(_injector);

         if (_state) {
            this._loadState(_state);
        }
    }

    ngOnInit() {
        // component visible and UI elements accessible
        super.setTitle(
            this._bftTranslateService.stream('breakfreeTradingDiscoveryComponentName')
        );
    }

    getComponentState(): IBFTDiscoveryComponentState {
        // save your state
        return {
        };
    }

    private _loadState(state: IBFTDiscoveryComponentState) {
        if (state) {
            // restore your state
        }
    }
}