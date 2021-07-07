import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { AppState } from "@app/store/reducer";
import { PlatformTranslateService } from "@platform/localization/token";

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
    public Components = Components;
    public SelectedComponent: Components = Components.Sonar;

    constructor(private _store: Store<AppState>,
        @Inject(PlatformTranslateService) public platformTranslateService: TranslateService) {
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

}
