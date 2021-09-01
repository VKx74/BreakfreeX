import { Component, Injector, Inject } from '@angular/core';
import {BaseGoldenLayoutItemComponent} from "@layout/base-golden-layout-item.component";
import {GoldenLayoutItemState} from "angular-golden-layout";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';

@Component({
    selector: 'sonar-feed-widget',
    templateUrl: './sonar-feed-widget.component.html',
    styleUrls: ['./sonar-feed-widget.component.scss']
})
export class SonarFeedWidgetComponent extends BaseGoldenLayoutItemComponent {
    static componentName = 'SonarFeedWidget';

    static previewImgClass = 'crypto-icon-watchlist';
    
    constructor(@Inject(GoldenLayoutItemState) protected _state: any, 
        @Inject(BreakfreeTradingTranslateService) private _translateService: TranslateService,
        protected _injector: Injector) {
        super(_injector);
    }

    ngOnInit() {
        // component visible and UI elements accessible
        super.setTitle(
            this._translateService.stream('SonarFeedWidgetComponentName')
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