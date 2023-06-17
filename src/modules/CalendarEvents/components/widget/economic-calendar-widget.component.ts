import { Component, Injector, Inject, ViewChild } from '@angular/core';
import { BaseGoldenLayoutItemComponent } from "@layout/base-golden-layout-item.component";
import { TranslateService } from '@ngx-translate/core';
import { GoldenLayoutItemState } from "angular-golden-layout";
import { LinkingAction } from '@linking/models';
import { BaseLayoutItem } from '@layout/base-layout-item';
import { EconomicCalendarService } from '@calendarEvents/localization/token';

@Component({
    selector: 'economic-calendar-widget',
    templateUrl: './economic-calendar-widget.component.html',
    styleUrls: ['./economic-calendar-widget.component.scss']
})
export class EconomicCalendarWidgetComponent extends BaseGoldenLayoutItemComponent {
    static componentName = 'EconomicCalendarWidget';
    static previewImgClass = 'crypto-icon-watchlist';

    @ViewChild("EconomicCalendar", {static: false}) private _component: BaseLayoutItem;
    
    protected useDefaultLinker(): boolean {
        return true;
    }

    constructor(@Inject(EconomicCalendarService) private _economicCalendarService: TranslateService,
        @Inject(GoldenLayoutItemState) protected _state: any,
        protected _injector: Injector) {
        super(_injector);
        super.setTitle(
            this._economicCalendarService.stream('economicCalendarWidgetName')
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

    protected loadState(state: any) {

    }

    protected getComponentState() {
        return this._component.getState();
    }

}

