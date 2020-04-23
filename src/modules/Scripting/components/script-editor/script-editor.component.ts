import {AfterContentInit, Component, Input, OnInit} from '@angular/core';
import {Script, ScriptOrigin} from "../../models/Script";
import {ThemeService} from "@app/services/theme.service";
import {BehaviorSubject, merge, Observable} from "rxjs";
import {delay, first, flatMap, map, take, takeUntil, tap} from "rxjs/operators";
import {AlertService} from "@alert/services/alert.service";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {MatDialog} from "@angular/material/dialog";
import {IInstrument} from "@app/models/common/instrument";
import {IPeriodicity} from "@app/models/common/periodicity";
import {HistoryParameters, ScriptStartParameters} from "../../models/IScriptCloudExecutorService";
import {HistoryHelperService} from "@app/helpers/history.helper.service";
import {TranslateService} from "@ngx-translate/core";
import {Theme} from "@app/enums/Theme";
import {concat} from "@decorators/concat";
import {UsersScriptsModalComponent} from "@scripting/components/users-scripts-modal/users-scripts-modal.component";
import {
    IScriptNameModalConfig,
    ScriptNameModalComponent,
    ScriptNameModalMode
} from "@scripting/components/script-name-modal/script-name-modal.component";
import {select, Store} from "@ngrx/store";
import {
    compilationResultSelector,
    isSelectedScriptDraft, selectedScriptCodeSelector,
    selectedScriptSelector
} from "@scripting/store/selectors";
import {
    ActionTypes,
    ChangeCodeAction, CompileScriptAction, CompileScriptFailedAction,
    CreateDraftScriptAction,
    StartScriptAction
} from "@scripting/store/actions";
import * as fromScripts from '@platform/store/actions/scripts.actions';

import {Actions, ofType} from "@ngrx/effects";
import {
    RunAutotradingComponent,
    RunAutoTradingComponentValues
} from "@scripting/components/run-autotrading/run-autotrading.component";
import {ScriptsTranslateService} from "@scripting/localization/token";
import {CompilationStatus} from "@scripting/models";
import {AppState} from "@app/store/reducer";
import {ObservableUtils} from "../../../../utils/observable.utils";
import {IScriptProperty} from "@scripting/components/script-params/script-params.component";
import {ComponentIdentifier} from "@app/models/app-config";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'script-editor',
    templateUrl: './script-editor.component.html',
    styleUrls: ['./script-editor.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ScriptsTranslateService
        }
    ]
})
export class ScriptEditorComponent implements OnInit {
    private _isNew = true;
    script: Script;

    public get isSelectedScriptNew(): boolean {
        // console.log('SCRIPT', this.script);
        return this._isNew && this.script.scriptOrigin !== ScriptOrigin.builtIn;
    }

    public get isSelectedScriptBuiltIn(): boolean {
        // console.log('SCRIPT', this.script);
        return this.script.scriptOrigin === ScriptOrigin.builtIn;
    }

    selectedScriptCode$: Observable<string>;
    documentationVisible: boolean;

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    get theme(): Theme {
        return this._themeService.getActiveTheme();
    }

    get Theme() {
        return Theme;
    }

    editorOptions: any;
    compilationStatus: CompilationStatus;

    constructor(private _store: Store<AppState>,
                private actions$: Actions,
                private _themeService: ThemeService,
                private _dialog: MatDialog,
                private _route: ActivatedRoute,
                private _translateService: TranslateService,
                private _alertService: AlertService) {
    }

    ngOnInit() {
        // this.selectedScriptCode$ = this._route.queryParamMap
        //     .pipe(
        //         map(p => (p as any).params.code),
        //         tap(d => console.log('query params changed', d))
        //     )


        this.editorOptions = this._getEditorOptions();

        this._store.pipe(
            select(compilationResultSelector),
            takeUntil(componentDestroyed(this))
        ).subscribe((result: CompilationStatus) => {
            this.compilationStatus = result;
        });

        this._store.pipe(
            select(selectedScriptSelector),
            takeUntil(componentDestroyed(this)),
        )
            .subscribe((script: Script) => {
                this.script = script;
            });

        this._store.pipe(
            select(isSelectedScriptDraft),
            takeUntil(componentDestroyed(this))
        ).subscribe((isNew: boolean) => {
            this._isNew = isNew;
        });

        this._store.pipe(
            select(selectedScriptSelector),
            first()
        ).subscribe((selectedScript: Script) => {
            if (!selectedScript) {
                this._store.dispatch(new CreateDraftScriptAction(Script.createNew()));
            }
        });

        this.actions$.pipe(
            ofType(ActionTypes.CompileScriptFailed),
            takeUntil(componentDestroyed(this))
        ).subscribe((action: CompileScriptFailedAction) => {
            console.error(action.payload);
            this._alertService.error('');
        });



            this.selectedScriptCode$ = this._store.pipe(
                select(selectedScriptCodeSelector)
            );
    }



    rename(script: Script) {
        this._dialog.open(ScriptNameModalComponent, {
            data: {
                mode: ScriptNameModalMode.Rename,
                scriptName: script.name,
                submitHandler: (scriptName: string, modal: ScriptNameModalComponent) => {
                    this._store.dispatch(new fromScripts.RenameScriptAction({
                        script: script,
                        newName: scriptName
                    }));

                    return merge(
                        this.actions$.pipe(
                            ofType(fromScripts.ActionTypes.RenameScriptSuccess),
                            tap(() => {
                                this._alertService.success(this._translateService.get('success'));
                                modal.close();
                            })
                        ),

                        this.actions$.pipe(
                            ofType(fromScripts.ActionTypes.RenameScriptFailed),
                            tap(() => {
                                this._alertService.error(this._translateService.get('failedToSaveScript'));
                            })
                        )
                    ).pipe(take(1));
                }
            } as IScriptNameModalConfig
        });
    }

    createScript() {
        this._store.dispatch(new CreateDraftScriptAction(Script.createNew()));
    }

    openScript() {
        this._dialog.open(UsersScriptsModalComponent);
    }

    compile() {
        this._store.dispatch(new CompileScriptAction({
            scriptName: this.script.name,
            code: ObservableUtils.instant<string>(this.selectedScriptCode$)
        }));
    }

    save(script: Script) {
        if (this.isSelectedScriptNew || this.isSelectedScriptBuiltIn) {
            this._createScript(script);
        } else {
            this._updateScript(script);
        }
    }

    toggleDocumentation() {
        this.documentationVisible = !this.documentationVisible;
    }

    private _createScript(script: Script) {
        this._dialog.open(ScriptNameModalComponent, {
            data: {
                mode: ScriptNameModalMode.Create,
                submitHandler: (scriptName: string, modal: ScriptNameModalComponent) => {
                    return this._getSelectedScriptCode()
                        .pipe(
                            tap((code: string) => {
                                const copy = Script.clone(script);
                                copy.code = code;

                                this._store.dispatch(new fromScripts.CreateScriptAction({
                                    script: copy,
                                    scriptName: scriptName
                                }));
                            }),
                            flatMap(() => {
                                return merge(
                                    this.actions$.pipe(
                                        ofType(fromScripts.ActionTypes.CreateScriptSuccess),
                                        tap(() => {
                                            this._alertService.success(this._translateService.get('success'));
                                            modal.close();
                                        })
                                    ),

                                    this.actions$.pipe(
                                        ofType(fromScripts.ActionTypes.CreateScriptFailed),
                                        tap(() => {
                                            this._alertService.error(this._translateService.get('failedToSaveScript'));
                                        })
                                    )
                                ).pipe(take(1));
                            })
                        );
                }
            } as IScriptNameModalConfig
        });
    }

    @concat()
    private _updateScript(script: Script) {
        return this._getSelectedScriptCode()
            .pipe(
                tap((code: string) => {
                    this._store.dispatch(new fromScripts.UpdateScriptAction({
                        oldScriptName: script.name,
                        newScript: {
                            name: script.name,
                            code: code,
                            description: script.description
                        }
                    }));
                }),
                flatMap(() => {
                    return merge(
                        this.actions$.pipe(
                            ofType(fromScripts.ActionTypes.UpdateScriptSuccess),
                            tap(() => {
                                this._alertService.success(this._translateService.get('success'));
                            })
                        ),

                        this.actions$.pipe(
                            ofType(fromScripts.ActionTypes.UpdateScriptFailed),
                            tap(() => {
                                this._alertService.error(this._translateService.get('failedToSaveScript'));
                            })
                        )
                    ).pipe(take(1));
                })
            ).subscribe();
    }

    runScript() {
        const script = this.script;

        this._getScriptRunningParams(script)
            .subscribe((params: ScriptStartParameters) => {
                if (params) {
                    this._store.dispatch(new StartScriptAction({
                        scriptName: script.name,
                        params: params
                    }));

                    merge(
                        this.actions$.pipe(
                            ofType(ActionTypes.StartScriptFailed),
                            tap((error) => {
                                console.error(error);
                                this._alertService.error(this._translateService.get('failedToStartAutoTrading'));
                            })
                        ),
                        this.actions$.pipe(ofType(ActionTypes.StartScriptSuccess),
                            tap(success => {
                                this._alertService.success((this._translateService.get('compilationStatus.SUCCESS')));
                            }))
                    )
                        .pipe(first())
                        .subscribe();
                }
            });
    }

    handleCodeChanged(code: string) {
        this._store.dispatch(new ChangeCodeAction({
            script: this.script,
            code: code
        }));
    }

    private _getEditorOptions(): any {
        return {
            language: 'fintaSharp',
            minimap: {
                enabled: false
            },
            fontFamily: 'Consolas',
            automaticLayout: true
        };
    }

    private _getScriptRunningParams(script: Script): Observable<ScriptStartParameters> {
        return this._dialog.open(RunAutotradingComponent, {
            data: {
                script: script,
            }
        } as any)
            .afterClosed()
            .pipe(
                map((data: RunAutoTradingComponentValues) => {
                    if (data == null) {
                        return null;
                    }

                    return this._createRunningParameters(data.instrument, data.interval, data.periodicity, data.barsCount, data.properties);
                })
            );
    }

    private _createRunningParameters(instrument: IInstrument, interval: number, periodicity: IPeriodicity, barsCount: number, properties?: IScriptProperty): ScriptStartParameters {
        // const timeDiff = request.endDate.getTime() - request.startDate.getTime();
        const granularity = HistoryHelperService.getGranularity({
            periodicity: periodicity,
            interval: interval
        });
        const historyParams: HistoryParameters = {
            kind: "barsback",
            granularity: granularity,
            barsCount: barsCount
        };
        const startParams: ScriptStartParameters = {
            symbol: instrument.symbol,
            datafeed: instrument.exchange,
            exchange: instrument.exchange,
            historyParameters: historyParams,
            scriptName: this.script.name,
            properties: properties
        };

        return startParams;
    }

    private _getSelectedScriptCode(): Observable<string> {
        return this.selectedScriptCode$
            .pipe(first());
    }

    ngOnDestroy() {
    }
}
