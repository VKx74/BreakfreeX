import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, mapTo, switchMap, tap} from 'rxjs/operators';
import {
    ActionTypes,
    LoadRunningScriptsAction,
    LoadRunningScriptsFailedAction,
    LoadRunningScriptsSuccessAction,
    StartScriptAction,
    StartScriptFailedAction,
    StopScriptAction,
    StopScriptFailedAction,
    StopScriptSuccessAction,
    StartScriptSuccessAction,
    CreateDraftScriptAction, CompileScriptAction, CompileScriptFailedAction, CompileScriptSuccessAction
} from "@scripting/store/actions";
import {ScriptCloudRepositoryService} from "@scripting/services/script-cloud-repository.service";
import {BehaviorSubject, EMPTY} from "rxjs";
import {select, Store} from "@ngrx/store";
import {Script} from "@scripting/models/Script";
import {
    CompilationResponse,
    RunningMetadata
} from "@scripting/models/IScriptCloudRepositoryService";
import {ScriptCloudExecutorService} from "@scripting/services/script-cloud-executor.service";
import * as fromPlatform from "@platform/store/actions/platform.actions";
import {selectedScriptSelector} from "@scripting/store/selectors";

@Injectable()
export class ScriptingEffects {
    selectedScript$ = new BehaviorSubject<Script>(null);

    constructor(private actions$: Actions,
                private _store: Store<any>,
                private _scriptsRepository: ScriptCloudRepositoryService,
                private _scriptsExecutor: ScriptCloudExecutorService) {

        this._store
            .pipe(select(selectedScriptSelector))
            .subscribe((script: Script) => {
                this.selectedScript$.next(script);
            });
    }

    @Effect({dispatch: false})
    loadRunningScripts = this.actions$.pipe(
        ofType(ActionTypes.LoadRunningScripts),
        switchMap((action: LoadRunningScriptsAction) => {
            return this._scriptsRepository.loadRunningScripts()
                .pipe(
                    catchError((e) => {
                        console.error(e);
                        this._store.dispatch(new LoadRunningScriptsFailedAction(e));

                        return EMPTY;
                    }),
                );
        }),
        tap((data: RunningMetadata[]) => {
            this._store.dispatch(new LoadRunningScriptsSuccessAction(data));
        })
    );

    @Effect({dispatch: false})
    startScript = this.actions$.pipe(
        ofType(ActionTypes.StartScript),
        switchMap((action: StartScriptAction) => {
            return this._scriptsExecutor.startScript(action.payload.scriptName, action.payload.params)
                .pipe(
                    catchError((e) => {
                        console.error(e);
                        this._store.dispatch(new StartScriptFailedAction(e));

                        return EMPTY;
                    }),
                );
        }),
        tap((data: RunningMetadata) => {
            this._store.dispatch(new StartScriptSuccessAction(data));
        })
    );

    @Effect({dispatch: false})
    stopScript = this.actions$.pipe(
        ofType(ActionTypes.StopScript),
        switchMap((action: StopScriptAction) => {
            return this._scriptsExecutor.stopScript(action.payload)
                .pipe(
                    catchError((e) => {
                        console.error(e);
                        this._store.dispatch(new StopScriptFailedAction(e));

                        return EMPTY;
                    }),
                    mapTo(action.payload)
                );
        }),
        tap((runningId: string) => {
            this._store.dispatch(new StopScriptSuccessAction(runningId));
        })
    );

    @Effect()
    showCode = this.actions$.pipe(
        ofType(fromPlatform.ActionTypes.ShowCode),
        map((action: fromPlatform.ShowCodeAction) => {
            const code = action.payload;
            const script = Script.createNew();
            script.code = code;

            return new CreateDraftScriptAction(script);
        })
    );

    @Effect({dispatch: false})
    compileScript = this.actions$.pipe(
        ofType(ActionTypes.CompileScript),
        switchMap((action: CompileScriptAction) => {
            return this._scriptsRepository.compileScript(action.payload.code, action.payload.scriptName)
                .pipe(
                    catchError((e) => {
                        if (this.selectedScript$.value && this.selectedScript$.value.name === action.payload.scriptName) {
                            this._store.dispatch(new CompileScriptFailedAction(e));
                        }

                        return EMPTY;
                    }),
                    map((resp: CompilationResponse) => {
                        return {
                            scriptName: action.payload.scriptName,
                            resp
                        };
                    })
                );
        }),
        tap((result: { scriptName: string, resp: CompilationResponse }) => {
            if (this.selectedScript$.value && this.selectedScript$.value.name === result.scriptName) {
                this._store.dispatch(new CompileScriptSuccessAction({
                    scriptName: result.scriptName,
                    result: result.resp
                }));
            }
        })
    );
}
