import {Component, OnInit} from '@angular/core';
import {select, Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {ProcessState} from "@app/helpers/ProcessState";
import {loadRunningScriptsStateSelector, runningScriptsSelector} from "@scripting/store/selectors";
import {RunningMetadata} from "@scripting/models/IScriptCloudRepositoryService";
import {
    ActionTypes,
    LoadRunningScriptsAction,
    StopScriptAction
} from "@scripting/store/actions";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmModalComponent} from "UI";
import {TranslateService} from "@ngx-translate/core";
import {ScriptsTranslateService} from "@scripting/localization/token";
import {AppState} from "@app/store/reducer";
import {ComponentIdentifier} from "@app/models/app-config";
import {Actions, ofType} from "@ngrx/effects";
import {AlertService} from "@alert/services/alert.service";

@Component({
    selector: 'running-scripts',
    templateUrl: './running-scripts.component.html',
    styleUrls: ['./running-scripts.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ScriptsTranslateService
        }
    ]
})
export class RunningScriptsComponent implements OnInit {
    loadRecordsProcessState: Observable<ProcessState>;
    records: Observable<RunningMetadata[]>;

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(private _store: Store<AppState>,
                private _actions: Actions,
                private _dialog: MatDialog,
                private _alertService: AlertService,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this.loadRecordsProcessState = this._store.pipe(select(loadRunningScriptsStateSelector));
        this.records = this._store.pipe(select(runningScriptsSelector));

        this._actions.pipe(
            ofType(ActionTypes.StopScriptFailed)
        ).subscribe(() => {
            this._alertService.error(this._translateService.get('failedToStopAutoTrading'));
        });

        this._store.dispatch(new LoadRunningScriptsAction());
    }

    stopScript(data: RunningMetadata) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                onConfirm: () => {
                    this._store.dispatch(new StopScriptAction(data.runningId));
                }
            }
        });
    }

    ngOnDestroy() {
    }
}
