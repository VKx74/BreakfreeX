import { Component, EventEmitter, Inject, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { AppState } from "@app/store/reducer";
import { PlatformTranslateService } from "@platform/localization/token";
import { Linker, LinkerFactory } from "@linking/linking-manager";
import { LinkingAction } from "@linking/models";

export enum Components {
    Sonar = "Sonar",
    Watchlist = "Watchlist",
    Alerts = "Alerts",
    Academy = "Academy"
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

    get LinkerColor(): string {
        return this.linker.getLinkingId();
    }

    constructor(protected _store: Store<AppState>,
        protected _injector: Injector,
        @Inject(PlatformTranslateService) public platformTranslateService: TranslateService) {
        this.linker = this._injector.get(LinkerFactory).getLinker();
        this.linker.setDefaultLinking();
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    selectComponent(component: Components) {
        if (this.SelectedComponent !== component) {
            this.SelectedComponent = component;
        }
    }

    handleColorSelected(color: string) {
        this.linker.setLinking(color);
    }

    handleOpenChart(action: LinkingAction) {
        this.linker.sendAction(action);
    }

}
