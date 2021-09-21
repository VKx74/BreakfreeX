import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { IdentityService } from "@app/services/auth/identity.service";
import { BaseLayoutItem } from "@layout/base-layout-item";
import { LinkingAction } from "@linking/models";
import { ISonarSetupFilters } from "modules/BreakfreeTradingSocial/services/sonar.feed.service";
import { SonarFeedWidgetComponent } from "../sonar-feed-widget/sonar-feed-widget.component";

@Component({
    selector: 'sonar-feed',
    templateUrl: './sonar-feed.component.html',
    styleUrls: ['./sonar-feed.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SonarFeedComponent extends BaseLayoutItem  implements OnInit {
    private _state: ISonarSetupFilters;

    get state(): ISonarSetupFilters {
        return this._state;
    }
    
    get componentId(): string {
        return SonarFeedWidgetComponent.componentName;
    }

    constructor(protected _identityService: IdentityService, protected _cdr: ChangeDetectorRef) {
        super();
    }

    handleStateChanged(state: ISonarSetupFilters) {
        if (state) {
            this._state = state;
            this.stateChanged.next(this);
        }
    }

    getState() {
        return this._state;
    }

    setState(state: ISonarSetupFilters) {
        if (!state) {
            return;
        }

        this._state = state;
    }

    ngOnInit() {
        this.initialized.next(this);
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
        this.beforeDestroy.next(this);
    }

    viewOnChart(linkingAction: LinkingAction) {
        this.onOpenChart.next(linkingAction);
    }
}