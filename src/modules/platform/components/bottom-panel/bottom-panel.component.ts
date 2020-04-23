import {Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ScriptsTranslateService} from "@scripting/localization/token";
import {TranslateService} from "@ngx-translate/core";
import {HistoryStorageTranslateService} from "@historyStorage/localization/token";
import {select, Store} from "@ngrx/store";
import {activeBottomComponent, activeBottomComponentGroup} from "@platform/store/selectors";
import {takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {BottomPanelComponentGroups, BottomPanelComponents} from "@platform/data/enums";
import {SelectBottomComponentAction} from "@platform/store/actions/platform.actions";
import {AppState} from "@app/store/reducer";
import {BacktestTranslateService} from "../../../backtest/localization/token";
import {TradingTranslateService} from "../../../Trading/localization/token";
import {PlatformTranslateService} from "@platform/localization/token";

@Component({
    selector: 'bottom-panel',
    templateUrl: './bottom-panel.component.html',
    styleUrls: ['./bottom-panel.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: PlatformTranslateService
        }
    ]
})
export class BottomPanelComponent implements OnInit {
    selectedBottomComponentGroup: BottomPanelComponentGroups;
    selectedBottomComponent: BottomPanelComponents;

    constructor(private _store: Store<AppState>,
                @Inject(ScriptsTranslateService) public scriptsTranslateService: TranslateService,
                @Inject(HistoryStorageTranslateService) public historyStorageTranslateService: TranslateService,
                @Inject(BacktestTranslateService) public backtestTranslateService: TranslateService,
                @Inject(TradingTranslateService) public tradingTranslateService: TranslateService) {
    }

    ngOnInit() {
        this._store.pipe(
            select(activeBottomComponentGroup),
            takeUntil(componentDestroyed(this))
        ).subscribe((group: BottomPanelComponentGroups) => {
            this.selectedBottomComponentGroup = group;
        });

        this._store.pipe(
            select(activeBottomComponent),
            takeUntil(componentDestroyed(this))
        ).subscribe((component: BottomPanelComponents) => {
            this.selectedBottomComponent = component;
        });
    }

    ngOnDestroy() {
    }

}
