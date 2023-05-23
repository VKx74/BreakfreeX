import { Component, Injector, Inject, ViewChild } from '@angular/core';
import { BaseGoldenLayoutItemComponent } from "@layout/base-golden-layout-item.component";
import { TranslateService } from '@ngx-translate/core';
import { GoldenLayoutItemState } from "angular-golden-layout";
import { LinkingAction } from '@linking/models';
import { BaseLayoutItem } from '@layout/base-layout-item';
import { WatchListTranslateService } from 'modules/Watchlist/localization/token';
import { ITrendIndexComponentState } from '../trendIndex/trendIndex.component';

@Component({
    selector: 'TrendIndexWidget',
    templateUrl: './trendIndexWidget.component.html',
    styleUrls: ['./trendIndexWidget.component.scss']
})
export class TrendIndexWidgetComponent extends BaseGoldenLayoutItemComponent {
    static componentName = 'TrendIndexWidget';
    static previewImgClass = 'crypto-icon-watchlist';

    @ViewChild("TrendIndex", {static: false}) private _component: BaseLayoutItem;
    
    protected useDefaultLinker(): boolean {
        return true;
    }

    constructor(@Inject(WatchListTranslateService) private _watchlistTranslateService: TranslateService,
        @Inject(GoldenLayoutItemState) protected _state: ITrendIndexComponentState,
        protected _injector: Injector) {
        super(_injector);
        super.setTitle(
            this._watchlistTranslateService.stream('trendIndexWidgetName')
        );
    }

    handleOpenChart(action: LinkingAction) {
        this.linker.sendAction(action);
    }

    componentInitialized(component: BaseLayoutItem) {
        component.setState(this._state);
    }

    componentStateChanged(component: BaseLayoutItem) {
        this.fireStateChanged();
    }

    protected loadState(state: ITrendIndexComponentState) {

    }

    protected getComponentState() {
        return this._component.getState();
    }

}

