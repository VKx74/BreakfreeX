import { Component, Injector, Inject, ViewChild } from '@angular/core';
import { BaseGoldenLayoutItemComponent } from "@layout/base-golden-layout-item.component";
import { TranslateService } from '@ngx-translate/core';
import { GoldenLayoutItemState } from "angular-golden-layout";
import { LinkingAction } from '@linking/models';
import { BaseLayoutItem } from '@layout/base-layout-item';
import { IWatchlistComponentState } from '../watchlist/watchlist.component';
import { WatchListTranslateService } from 'modules/Watchlist/localization/token';

@Component({
    selector: 'WatchlistWidget',
    templateUrl: './watchlist.widget.html',
    styleUrls: ['./watchlist.widget.scss']
})
export class WatchlistWidget extends BaseGoldenLayoutItemComponent {
    static componentName = 'WatchlistWidget';
    static previewImgClass = 'crypto-icon-watchlist';
    protected useDefaultLinker(): boolean {
        return true;
    }

    @ViewChild("watchlist", {static: false}) private _component: BaseLayoutItem;

    constructor(@Inject(WatchListTranslateService) private _watchlistTranslateService: TranslateService,
        @Inject(GoldenLayoutItemState) protected _state: IWatchlistComponentState,
        protected _injector: Injector) {
        super(_injector);
        super.setTitle(
            this._watchlistTranslateService.stream('watchlistWidgetName')
        );
    }

    handleOpenChart(action: LinkingAction) {
        this.linker.sendAction(action);
    }

    componentInitialized(component: BaseLayoutItem) {
        component.setState(this._state);
    }

    protected loadState(state: IWatchlistComponentState) {

    }

    protected getComponentState() {
        return this._component.getState();
    }

}

