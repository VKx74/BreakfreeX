import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { IdentityService } from "@app/services/auth/identity.service";
import { BaseLayoutItem } from "@layout/base-layout-item";
import { LinkingAction } from "@linking/models";
import { IScannerState } from "modules/BreakfreeTrading";
import { ISonarSetupFilters } from "modules/BreakfreeTradingSocial/services/sonar.feed.service";
import { SonarFeedWidgetComponent } from "../sonar-feed-widget/sonar-feed-widget.component";

export enum ActiveSonarComponent {
    New = "New",
    Legacy = "Legacy"
}

interface ISonarWidgetState {
    wallState?: ISonarSetupFilters;
    legacyState?: IScannerState;
    activeComponent?: ActiveSonarComponent;
}

@Component({
    selector: 'sonar-feed',
    templateUrl: './sonar-feed.component.html',
    styleUrls: ['./sonar-feed.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SonarFeedComponent extends BaseLayoutItem implements OnInit {
    private _active_component: ActiveSonarComponent;
    private _state: ISonarWidgetState = {};

    ActiveSonarComponent = ActiveSonarComponent;

    get state(): ISonarSetupFilters {
        return this._state ? this._state.wallState : null;
    }

    get legacyState(): IScannerState {
        return this._state ? this._state.legacyState : null;
    }

    get active_component(): ActiveSonarComponent {
        return this._active_component;
    }

    get componentId(): string {
        return SonarFeedWidgetComponent.componentName;
    }

    constructor(protected _identityService: IdentityService, protected _cdr: ChangeDetectorRef) {
        super();
    }

    legacyScannerComponentInitialized(component: BaseLayoutItem) {
        component.setState(this.legacyState);
    }

    setLegacyView() {
        this._active_component = ActiveSonarComponent.Legacy;
        this._state.activeComponent = this.active_component;
        this.stateChanged.next(this);
    }

    setNewView() {
        this._active_component = ActiveSonarComponent.New;
        this._state.activeComponent = this.active_component;
        this.stateChanged.next(this);
    }

    getState() {
        return this._state;
    }

    handleLegacyStateChanged(component: BaseLayoutItem) {
        if (component) {
            const state = component.getState();
            if (state) {
                this._state.legacyState = state;
                this.stateChanged.next(this);
            }
        }
    }

    handleWallStateChanged(state: ISonarSetupFilters) {
        if (state) {
            this._state.wallState = state;
            this.stateChanged.next(this);
        }
    }

    setState(state: ISonarWidgetState) {
        if (state.legacyState || state.wallState) {
            this._state = state;
        }

        if (state.activeComponent) {
            this._active_component = state.activeComponent;
        }
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