import { Component, Injector, Inject } from '@angular/core';
import {BaseGoldenLayoutItemComponent} from "@layout/base-golden-layout-item.component";
import {GoldenLayoutItemState} from "angular-golden-layout";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';

@Component({
    selector: 'BreakfreeTradingBacktestWidget',
    templateUrl: './BreakfreeTradingBacktestWidget.component.html',
    styleUrls: ['./BreakfreeTradingBacktestWidget.component.scss']
})
export class BreakfreeTradingBacktestWidgetComponent extends BaseGoldenLayoutItemComponent {
    static componentName = 'BreakfreeTradingBacktest';

    static previewImgClass = 'crypto-icon-watchlist';
    
    constructor(@Inject(GoldenLayoutItemState) protected _state: any, 
        @Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        protected _injector: Injector) {
        super(_injector);

         if (_state) {
            this._loadState(_state);
        }
    }

    ngOnInit() {
        // component visible and UI elements accessible
        super.setTitle(
            this._bftTranslateService.stream('BreakfreeTradingBacktestComponentName')
        );
    }

    getComponentState() {
        return null;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    protected useLinker(): boolean { 
        return false;
    }

    private _loadState(state: any) {
    }
}