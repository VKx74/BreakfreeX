import {Action} from "@ngrx/store";
import {Script} from "@scripting/models/Script";
import {ScriptDTO} from "@scripting/models/IScriptCloudRepositoryService";

export enum ActionTypes {
    LoadScripts = '[Scripts] Load Scripts',
    LoadScriptsSuccess = '[Scripts] Load Scripts Success',
    LoadScriptsFailed = '[Scripts] Load Scripts Failed',

    DeleteScript = '[Scripts] Delete Script',
    DeleteScriptSuccess = '[Scripts] Delete Script Success',
    DeleteScriptFailed = '[Scripts] Delete Script Failed',

    CreateScript = '[Scripts] Create Script',
    CreateScriptSuccess = '[Scripts] Create Script Success',
    CreateScriptFailed = '[Scripts] Create Script Failed',

    UpdateScript = '[Scripts] Save Script',
    UpdateScriptSuccess = '[Scripts] Save Script Success',
    UpdateScriptFailed = '[Scripts] Save Script Failed',

    RenameScript = '[Scripts] Rename Script',
    RenameScriptFailed = '[Scripts] Rename Script Failed',
    RenameScriptSuccess = '[Scripts] Rename Script Success',
}

export class LoadScriptsAction implements Action {
    readonly type = ActionTypes.LoadScripts;
}

export class LoadScriptsSuccessAction implements Action {
    readonly type = ActionTypes.LoadScriptsSuccess;

    constructor(public payload: Script[]) {
    }
}

export class LoadScriptsFailedAction implements Action {
    readonly type = ActionTypes.LoadScriptsFailed;

    constructor(public payload: any) {
    }
}

export class DeleteScriptAction implements Action {
    readonly type = ActionTypes.DeleteScript;

    constructor(public payload: Script) {
    }
}

export class DeleteScriptSuccessAction implements Action {
    readonly type = ActionTypes.DeleteScriptSuccess;

    constructor(public payload: Script) {
    }
}

export class DeleteScriptFailedAction implements Action {
    readonly type = ActionTypes.DeleteScriptFailed;

    constructor(public payload: Script) {
    }
}


export class CreateScriptAction implements Action {
    readonly type = ActionTypes.CreateScript;

    constructor(public payload: { script: Script, scriptName: string }) {
    }
}

export class CreateScriptSuccessAction implements Action {
    readonly type = ActionTypes.CreateScriptSuccess;

    constructor(public payload: { script: Script, prevScriptId: string }) {
    }
}

export class CreateScriptFailedAction implements Action {
    readonly type = ActionTypes.CreateScriptFailed;

    constructor(public payload: any) {
    }
}


export class UpdateScriptAction implements Action {
    readonly type = ActionTypes.UpdateScript;

    constructor(public payload: { oldScriptName: string, newScript: ScriptDTO }) {
    }
}

export class UpdateScriptSuccessAction implements Action {
    readonly type = ActionTypes.UpdateScriptSuccess;

    constructor(public payload: Script) {
    }
}

export class UpdateScriptFailedAction implements Action {
    readonly type = ActionTypes.UpdateScriptFailed;

    constructor(public payload: any) {
    }
}


export class RenameScriptAction implements Action {
    readonly type = ActionTypes.RenameScript;

    constructor(public payload: { script: Script, newName: string }) {
    }
}

export class RenameScriptSuccessAction implements Action {
    readonly type = ActionTypes.RenameScriptSuccess;

    constructor(public payload: { script: Script, prevName: string }) {
    }
}

export class RenameScriptFailedAction implements Action {
    readonly type = ActionTypes.RenameScriptFailed;

    constructor(public payload: any) {
    }
}

export type Actions = LoadScriptsAction
    | LoadScriptsSuccessAction
    | LoadScriptsFailedAction
    | DeleteScriptAction
    | DeleteScriptSuccessAction
    | DeleteScriptFailedAction
    | CreateScriptAction
    | CreateScriptSuccessAction
    | CreateScriptFailedAction
    | UpdateScriptAction
    | UpdateScriptSuccessAction
    | UpdateScriptFailedAction
    | RenameScriptAction
    | RenameScriptSuccessAction
    | RenameScriptFailedAction;
