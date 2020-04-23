import {Script} from "@scripting/models/Script";
import {ProcessState, ProcessStateType} from "@app/helpers/ProcessState";
import * as fromPlatform from '../actions/platform.actions';
import {
    Actions,
    ActionTypes,
    CreateScriptSuccessAction,
    DeleteScriptSuccessAction,
    LoadScriptsSuccessAction,
    RenameScriptSuccessAction, UpdateScriptSuccessAction,
} from "../actions/scripts.actions";


export interface IScriptsState {
    scripts: Script[];
    loadScriptProcessState: ProcessState;
}

export const DefaultState: IScriptsState = {
    scripts: [],
    loadScriptProcessState: new ProcessState(ProcessStateType.None)
};

export const reducer = (state: IScriptsState = DefaultState, action: Actions | fromPlatform.PlatformActions) => {
    switch (action.type) {
        case ActionTypes.LoadScripts: {
            if (state.loadScriptProcessState.isNone()) {
                return {
                    ...state,
                    loadScriptProcessState: new ProcessState(ProcessStateType.Pending)
                };
            }

            return {...state};
        }

        case ActionTypes.LoadScriptsSuccess: {
            const scripts = (action as LoadScriptsSuccessAction).payload;

            return {
                ...state,
                scripts: scripts,
                loadScriptProcessState: new ProcessState(ProcessStateType.Succeeded)
            };
        }

        case ActionTypes.LoadScriptsFailed: {
            return {
                ...state,
                loadScriptProcessState: new ProcessState(ProcessStateType.Failed)
            };
        }

        case ActionTypes.DeleteScriptSuccess: {
            const script = (action as DeleteScriptSuccessAction).payload;

            return {
                ...state,
                scripts: state.scripts.filter(s => s.name !== script.name)
            };
        }

        case ActionTypes.CreateScriptSuccess: {
            const {script} = (action as CreateScriptSuccessAction).payload;

            return {
                ...state,
                scripts: [].concat(...state.scripts, script)
            };
        }

        case ActionTypes.UpdateScriptSuccess: {
            const updatedScript = (action as UpdateScriptSuccessAction).payload;
            const scripts = state.scripts.map((s) => {
                if (s.name === updatedScript.name) {
                    return updatedScript;
                }

                return s;
            });

            return {
                ...state,
                scripts: scripts
            };
        }

        case ActionTypes.RenameScriptSuccess: {
            const {script, prevName} = (action as RenameScriptSuccessAction).payload;

            return {
                ...state,
                scripts: state.scripts.map(s => s.name === prevName ? script : s)
            };
        }
    }

    return state;
};
