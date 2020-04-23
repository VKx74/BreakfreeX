import {Component, EventEmitter, Injector, Output} from '@angular/core';
import {Script, IScriptCategory, ScriptBasedOn, IScript, ScriptKind, ScriptOrigin} from "@scripting/models/Script";
import {ScriptCloudRepositoryService} from "@scripting/services/script-cloud-repository.service";
import {TranslateService} from "@ngx-translate/core";
import {AlertService} from "@alert/services/alert.service";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmModalComponent} from "UI";
import {merge, Observable, of} from "rxjs";
import {ProcessState} from "@app/helpers/ProcessState";
import {Modal} from "Shared";
import {Store} from "@ngrx/store";
import {selectedScriptSelector, userScriptsSelector} from "@scripting/store/selectors";
import {first, tap} from "rxjs/operators";
import {SelectScriptAction, CreateDraftScriptAction} from "@scripting/store/actions";
import * as fromScripts from '@platform/store/actions/scripts.actions';
import {Actions, ofType} from "@ngrx/effects";
import {ScriptsTranslateService} from "@scripting/localization/token";
import {AppState} from "@app/store/reducer";
import {loadScriptsStateSelector} from "@platform/store/selectors";

@Component({
    selector: 'users-scripts-modal',
    templateUrl: './users-scripts-modal.component.html',
    styleUrls: ['./users-scripts-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ScriptsTranslateService
        }
    ]
})
export class UsersScriptsModalComponent extends Modal {
    scripts: Observable<Script[]>;
    builtInScripts: Observable<string[]>;
    selectedScript: Observable<Script>;
    loadScriptsState: Observable<ProcessState>;
    buildInScriptCategories: IScriptCategory[];

    constructor(_injector: Injector,
                private _store: Store<AppState>,
                private _actions$: Actions,
                private _scriptsRepository: ScriptCloudRepositoryService,
                private _translateService: TranslateService,
                private _alertService: AlertService,
                private _dialog: MatDialog) {
        super(_injector);

        this._scriptsRepository.loadBuiltInScripts().subscribe((res) => {
            this.buildInScriptCategories = res;
        }, error => {

        });
    }

    ngOnInit() {
        this.loadScriptsState = this._store.select(loadScriptsStateSelector);
        this.scripts = this._store.select(userScriptsSelector);
        this.selectedScript = this._store.select(selectedScriptSelector);

        this.loadScriptsState.pipe(first())
            .subscribe((state: ProcessState) => {
                if (state.isNone()) {
                    this._store.dispatch(new fromScripts.LoadScriptsAction());
                }
            });
    }

    handleScriptSelected(script: Script) {
        this._store.dispatch(new SelectScriptAction(script));
    }

    handleDefaultScriptSelected(selectedScript: IScript) {
        this._scriptsRepository.loadBuiltInScriptCode(selectedScript.name).subscribe((code) => {
            const script = new Script();
            script.code = code;
            script.name = selectedScript.name;
            script.description = selectedScript.description;
            script.properties = selectedScript.properties;
            script.scriptKind = ScriptKind.strategy;
            script.scriptOrigin = selectedScript.scriptOrigin;
            this._store.dispatch(new CreateDraftScriptAction(script));
        }, error => {

        });
    }

    getCategoryName(category: IScriptCategory): string {
        switch (category.name) {
            case ScriptBasedOn.TrendBased: return "Trend Based";
            default: return category.name;
        }
    }

    handleDeleteScript(script: Script) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                onConfirm: () => {
                    this._store.dispatch(new fromScripts.DeleteScriptAction(script));

                    merge(
                        this._actions$.pipe(
                            ofType(fromScripts.ActionTypes.DeleteScriptFailed),
                            tap(() => {
                                this._alertService.error(this._translateService.get('failedToDeleteScript'));
                            })
                        ),

                        this._actions$.pipe(ofType(fromScripts.ActionTypes.DeleteScriptSuccess))
                    ).pipe(
                        first()
                    ).subscribe();
                }
            }
        });
    }
    
    ngOnDestroy() {
    }
}
