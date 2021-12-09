import { Component, Injector, Inject } from '@angular/core';
import {BaseGoldenLayoutItemComponent} from "@layout/base-golden-layout-item.component";
import {GoldenLayoutItemState} from "angular-golden-layout";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';

@Component({
    selector: 'binance-scanner-widget',
    templateUrl: './BinanceScannerWidget.component.html',
    styleUrls: ['./BinanceScannerWidget.component.scss']
})
export class BinanceScannerWidgetComponent extends BaseGoldenLayoutItemComponent {
    static componentName = 'BinanceScannerWidget';

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
        super.setTitle(
            this._bftTranslateService.stream('BinanceScannerWidgetComponentName')
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