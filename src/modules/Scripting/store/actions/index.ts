import {Action} from '@ngrx/store';
import {Script} from "@scripting/models/Script";
import {CompilationResponse, RunningMetadata} from "@scripting/models/IScriptCloudRepositoryService";
import {ScriptStartParameters} from "@scripting/models/IScriptCloudExecutorService";

export enum ActionTypes {
    SelectScript = '[Scripting] Script Selected',
    CreateDraftScript = '[Scripting] Create Draft',
    ChangeCode = '[Scripting] Change Code',

    StartScript = '[Scripting] Start Script',
    StartScriptSuccess = '[Scripting] Start Script Success',
    StartScriptFailed = '[Scripting] Start Script Failed',

    LoadRunningScripts = '[Scripting] Load Running Scripts',
    LoadRunningScriptsSuccess = '[Scripting] Load Running Scripts Success',
    LoadRunningScriptsFailed = '[Scripting] Load Running Scripts Failed',


    StopScript = '[Scripting] Stop Script',
    StopScriptSuccess = '[Scripting] Stop Script Success',
    StopScriptFailed = '[Scripting] Stop Script Failed',

    CompileScript = '[Scripting] Compile Script',
    CompileScriptSuccess = '[Scripting] Compile Script Success',
    CompileScriptFailed = '[Scripting] Compile Script Failed'
}

export class SelectScriptAction implements Action {
    readonly type = ActionTypes.SelectScript;

    constructor(public payload: Script) {
    }
}

export class CreateDraftScriptAction implements Action {
    readonly type = ActionTypes.CreateDraftScript;

    constructor(public payload: Script) {
    }
}

export class ChangeCodeAction implements Action {
    readonly type = ActionTypes.ChangeCode;

    constructor(public payload: { script: Script, code: string }) {
    }
}

export class StartScriptAction implements Action {
    readonly type = ActionTypes.StartScript;

    constructor(public payload: { scriptName: string, params: ScriptStartParameters }) {
    }
}

export class StartScriptSuccessAction implements Action {
    readonly type = ActionTypes.StartScriptSuccess;

    constructor(public payload: RunningMetadata) {
    }
}

export class StartScriptFailedAction implements Action {
    readonly type = ActionTypes.StartScriptFailed;

    constructor(public payload: Script) {
    }
}

export class StopScriptAction implements Action {
    readonly type = ActionTypes.StopScript;

    constructor(public payload: string) {
    }
}

export class StopScriptSuccessAction implements Action {
    readonly type = ActionTypes.StopScriptSuccess;

    constructor(public payload: string) {
    }
}

export class StopScriptFailedAction implements Action {
    readonly type = ActionTypes.StopScriptFailed;

    constructor(public payload: RunningMetadata) {
    }
}

export class LoadRunningScriptsAction implements Action {
    readonly type = ActionTypes.LoadRunningScripts;

    constructor() {
    }
}

export class LoadRunningScriptsSuccessAction implements Action {
    readonly type = ActionTypes.LoadRunningScriptsSuccess;

    constructor(public payload: RunningMetadata[]) {
    }
}

export class LoadRunningScriptsFailedAction implements Action {
    readonly type = ActionTypes.LoadRunningScriptsFailed;

    constructor(public payload: any) {
    }
}

export class CompileScriptAction implements Action {
    readonly type = ActionTypes.CompileScript;

    constructor(public payload: {code: string, scriptName: string}) {
    }
}

export class CompileScriptSuccessAction implements Action {
    readonly type = ActionTypes.CompileScriptSuccess;

    constructor(public payload: { scriptName: string, result: CompilationResponse }) {
    }
}

export class CompileScriptFailedAction implements Action {
    readonly type = ActionTypes.CompileScriptFailed;

    constructor(public payload: any) {
    }
}

export type Actions =
    | SelectScriptAction
    | CreateDraftScriptAction
    | ChangeCodeAction
    | StartScriptAction
    | StartScriptSuccessAction
    | StartScriptFailedAction
    | StopScriptAction
    | StopScriptSuccessAction
    | StopScriptFailedAction
    | LoadRunningScriptsAction
    | LoadRunningScriptsSuccessAction
    | LoadRunningScriptsFailedAction
    | CompileScriptAction
    | CompileScriptSuccessAction
    | CompileScriptFailedAction;
