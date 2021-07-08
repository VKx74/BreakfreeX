import { Component, Injector, Inject, ViewChild } from '@angular/core';
import { BaseGoldenLayoutItemComponent } from "@layout/base-golden-layout-item.component";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';
import { GoldenLayoutItemState } from "angular-golden-layout";
import { BreakfreeTradingScannerComponent, IScannerState } from '../breakfreeTradingScanner.component';
import { LinkingAction } from '@linking/models';
import { BaseLayoutItem } from '@layout/base-layout-item';

@Component({
    selector: 'BreakfreeTradingScannerWidget',
    templateUrl: './breakfreeTradingScanner.widget.html',
    styleUrls: ['./breakfreeTradingScanner.widget.scss']
})
export class BreakfreeTradingScannerWidget extends BaseGoldenLayoutItemComponent {
    static componentName = 'BreakfreeTradingScannerWidget';
    static previewImgClass = 'crypto-icon-news';
    protected useDefaultLinker(): boolean {
        return true;
    }

    @ViewChild("scanner", {static: false}) private _scanner: BaseLayoutItem;

    constructor(@Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        @Inject(GoldenLayoutItemState) protected _state: IScannerState,
        protected _injector: Injector) {
        super(_injector);
        super.setTitle(
            this._bftTranslateService.stream('BreakfreeTradingScannerWidgetName')
        );
    }

    handleOpenChart(action: LinkingAction) {
        this.linker.sendAction(action);
    }

    componentInitialized(component: BaseLayoutItem) {
        component.setState(this._state);
    }

    protected loadState(state: IScannerState) {

    }

    protected getComponentState() {
        return this._scanner.getState();
    }

}

