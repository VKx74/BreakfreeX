import { Component, EventEmitter, Inject, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { AppState } from "@app/store/reducer";
import { PlatformTranslateService } from "@platform/localization/token";
import { Linker, LinkerFactory } from "@linking/linking-manager";
import { LinkingAction } from "@linking/models";
import { Intercom } from 'ng-intercom';
import { IdentityService } from '@app/services/auth/identity.service';

export enum Components {
    Sonar = "Sonar",
    Watchlist = "Watchlist",
    Alerts = "Alerts",
    Academy = "Academy",
    Backtest = "Backtest",
}

@Component({
    selector: 'right-panel',
    templateUrl: './right-panel.component.html',
    styleUrls: ['./right-panel.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: PlatformTranslateService
        }
    ]
})
export class RightPanelComponent implements OnInit {
    protected linker: Linker;

    public Components = Components;
    public SelectedComponent: Components = Components.Sonar;

    @Input() isCollapsed: boolean = false;
    @Output() isCollapsedChange = new EventEmitter<boolean>();

    get LinkerColor(): string {
        return this.linker.getLinkingId();
    }  
    
    get collapsed(): boolean {
        return this.isCollapsed;
    }

    set collapsed(value: boolean) {
        this.isCollapsed = value;
        this.isCollapsedChange.next(this.isCollapsed);
    }

    get isBacktestAllowed(): boolean {
        return this._identityService.isAdmin || this._identityService.isSupportOfficer;
    }

    constructor(protected _store: Store<AppState>,
        protected _injector: Injector,
        private _intercom: Intercom,
        private _identityService: IdentityService,
        @Inject(PlatformTranslateService) public platformTranslateService: TranslateService) {
        this.linker = this._injector.get(LinkerFactory).getLinker();
        this.linker.setDefaultLinking();
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    selectComponent(component: Components) {
        if (this.collapsed) {
            this.collapsed = false;
            this.SelectedComponent = component;
        } else {
            if (this.SelectedComponent !== component) {
                this.SelectedComponent = component;
            } else {
                this.collapsed = true;
            }
        }
    }

    handleColorSelected(color: string) {
        this.linker.setLinking(color);
    }

    handleOpenChart(action: LinkingAction) {
        this.linker.sendAction(action);
    }

    showSupport() {
        this._intercom.show();
    }

    collapse() {
        this.collapsed = true;
    }

    open() {
        this.collapsed = false;
    }

}
