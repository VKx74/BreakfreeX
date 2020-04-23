import {Injectable} from "@angular/core";
import {EMPTY} from "rxjs";
import {Script} from "@scripting/models/Script";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {Store} from "@ngrx/store";
import {ScriptCloudRepositoryService} from "@scripting/services/script-cloud-repository.service";
import {
    CreateScriptAction,
    CreateScriptFailedAction,
    CreateScriptSuccessAction,
    DeleteScriptAction,
    DeleteScriptFailedAction, DeleteScriptSuccessAction,
    LoadScriptsFailedAction,
    LoadScriptsSuccessAction, RenameScriptAction, RenameScriptFailedAction, RenameScriptSuccessAction,
    ActionTypes,
    UpdateScriptAction,
    UpdateScriptFailedAction,
    UpdateScriptSuccessAction
} from "../actions/scripts.actions";
import {catchError, map, mapTo, switchMap, tap} from "rxjs/operators";
import {CreateScriptResponse} from "@scripting/models/IScriptCloudRepositoryService";

@Injectable()
export class ScriptsEffects {
    constructor(private actions$: Actions,
                private _store: Store<any>,
                private _scriptsRepository: ScriptCloudRepositoryService) {
    }

    @Effect({dispatch: false})
    loadScripts = this.actions$.pipe(
        ofType(ActionTypes.LoadScripts),
        switchMap(() => {
            return this._scriptsRepository.loadScripts()
                .pipe(
                    catchError((e) => {
                        console.error(e);
                        this._store.dispatch(new LoadScriptsFailedAction(e));

                        return EMPTY;
                    })
                );
        }),
        tap((scripts: Script[]) => {
            this._store.dispatch(new LoadScriptsSuccessAction(scripts));
        })
    );

    @Effect({dispatch: false})
    createScript = this.actions$.pipe(
        ofType(ActionTypes.CreateScript),
        switchMap((action: CreateScriptAction) => {
            return this._scriptsRepository.createScript({
                name: action.payload.scriptName,
                code: action.payload.script.code,
                description: action.payload.script.description
            })
                .pipe(
                    catchError((e) => {
                        console.error(e);
                        this._store.dispatch(new CreateScriptFailedAction(e));

                        return EMPTY;
                    }),
                    map((resp) => {
                        return {
                            resp: resp,
                            prevScriptId: action.payload.script.name
                        };
                    })
                );
        }),
        tap((result: { resp: CreateScriptResponse, prevScriptId: string }) => {
            if (result.resp.success) {
                this._store.dispatch(new CreateScriptSuccessAction({
                    script: result.resp.script,
                    prevScriptId: result.prevScriptId
                }));
            } else {
                this._store.dispatch(new CreateScriptFailedAction("Failed to create script"));
            }
        })
    );

    @Effect({dispatch: false})
    updateScript = this.actions$.pipe(
        ofType(ActionTypes.UpdateScript),
        switchMap((action: UpdateScriptAction) => {
            return this._scriptsRepository.updateScript(action.payload.oldScriptName, {
                name: action.payload.newScript.name,
                code: action.payload.newScript.code,
                description: action.payload.newScript.description
            })
                .pipe(
                    catchError((e) => {
                        console.error(e);
                        this._store.dispatch(new UpdateScriptFailedAction(e));

                        return EMPTY;
                    })
                );
        }),
        tap((resp: CreateScriptResponse) => {
            if (resp.success) {
                this._store.dispatch(new UpdateScriptSuccessAction(resp.script));
            } else {
                this._store.dispatch(new UpdateScriptFailedAction("Failed to update script"));
            }
        })
    );

    @Effect({dispatch: false})
    deleteScript = this.actions$.pipe(
        ofType(ActionTypes.DeleteScript),
        switchMap((action: DeleteScriptAction) => {
            return this._scriptsRepository.deleteScript(action.payload.name)
                .pipe(
                    catchError((e) => {
                        console.error(e);
                        this._store.dispatch(new DeleteScriptFailedAction(e));

                        return EMPTY;
                    }),
                    mapTo(action.payload)
                );
        }),
        tap((script: Script) => {
            this._store.dispatch(new DeleteScriptSuccessAction(script));
        })
    );

    @Effect()
    renameScript = this.actions$.pipe(
        ofType(ActionTypes.RenameScript),
        switchMap((action: RenameScriptAction) => {
            const {script, newName} = (action).payload;

            return this._scriptsRepository.updateScript(script.name, {
                name: newName,
                code: script.code,
                description: script.description
            })
                .pipe(
                    catchError((e) => {
                        console.error(e);
                        this._store.dispatch(new RenameScriptFailedAction(e));

                        return EMPTY;
                    }),
                    map((resp) => {
                        if (resp.success) {
                            return new RenameScriptSuccessAction({
                                script: resp.script,
                                prevName: script.name
                            });
                        } else {
                            return new RenameScriptFailedAction(resp.output);
                        }
                    })
                );
        })
    );
}
