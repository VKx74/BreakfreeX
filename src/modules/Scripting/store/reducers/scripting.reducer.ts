import {Script} from "@scripting/models/Script";
import {
    Actions, ActionTypes,
    ChangeCodeAction,
    CompileScriptSuccessAction,
    CreateDraftScriptAction,
    LoadRunningScriptsSuccessAction,
    SelectScriptAction,
    StartScriptSuccessAction,
    StopScriptSuccessAction
} from "@scripting/store/actions";
import {ProcessState, ProcessStateType} from "@app/helpers/ProcessState";
import {RunningMetadata} from "@scripting/models/IScriptCloudRepositoryService";
import {CompilationStatus} from "@scripting/models";
import {COMPILE_STATUS} from "@scripting/models/enums";

import * as fromPlatform from '@platform/store/actions/platform.actions';
import * as fromScripts from '@platform/store/actions/scripts.actions';


export interface State {
    selectedScriptId: string;
    draftScript: Script;
    runningScripts: RunningMetadata[];
    loadRunningState: ProcessState;
    compilationResult: CompilationStatus;
    selectedScriptCode: string;
}

export const DefaultState: State = {
    selectedScriptId: null,
    draftScript: null,
    runningScripts: [],
    loadRunningState: new ProcessState(ProcessStateType.None),
    compilationResult: {
        status: COMPILE_STATUS.NEEDED
    },
    selectedScriptCode: null
};


function selectScript(state: State, script: Script): State {
    return {
        ...state,
        selectedScriptId: script.name,
        selectedScriptCode: script.code,
        compilationResult: {
            status: COMPILE_STATUS.NEEDED
        }
    };
}

function selectDraftScript(state: State, script: Script): State {
    return {
        ...selectScript(state, script),
        draftScript: script
    };
}

export function reducer(state = DefaultState, action: Actions | fromScripts.Actions | fromPlatform.PlatformActions) {
    switch (action.type) {
        case ActionTypes.SelectScript: {
            const script = (action as SelectScriptAction).payload;

            return selectScript(state, script);
        }

        case fromScripts.ActionTypes.DeleteScriptSuccess: {
            const script = (action as fromScripts.DeleteScriptSuccessAction).payload;
            const isScriptSelected = state.selectedScriptId === script.name;
            const draftScript = Script.createNew();

            if (isScriptSelected) {
                return {
                    ...selectScript(state, draftScript),
                    draftScript: draftScript,
                };
            } else {
                return {
                    ...state,
                };
            }
        }

        case ActionTypes.CreateDraftScript: {
            const script = (action as CreateDraftScriptAction).payload;

            return {
                ...selectDraftScript(state, script)
            };
        }

        case ActionTypes.ChangeCode: {
            const {code} = (action as ChangeCodeAction).payload;

            return {
                ...state,
                selectedScriptCode: code,
                compilationResult: {
                    status: COMPILE_STATUS.NEEDED
                }
            };
        }

        case fromScripts.ActionTypes.CreateScriptSuccess: {
            const {script, prevScriptId} = (action as fromScripts.CreateScriptSuccessAction).payload;

            if (state.draftScript && state.draftScript.name === prevScriptId) {
                return {
                    ...selectScript(state, script),
                    draftScript: null
                };
            } else {
                return {
                    ...state
                };
            }
        }

        case ActionTypes.LoadRunningScripts: {
            return {
                ...state,
                loadRunningState: new ProcessState(ProcessStateType.Pending)
            };
        }

        case ActionTypes.LoadRunningScriptsSuccess: {
            const running: RunningMetadata[] = (action as LoadRunningScriptsSuccessAction).payload;

            return {
                ...state,
                runningScripts: running,
                loadRunningState: new ProcessState(ProcessStateType.Succeeded)
            };
        }

        case ActionTypes.LoadRunningScriptsFailed: {
            return {
                ...state,
                loadRunningState: new ProcessState(ProcessStateType.Failed)
            };
        }

        case ActionTypes.StartScriptSuccess: {
            const data: RunningMetadata = (action as StartScriptSuccessAction).payload;

            return {
                ...state,
                runningScripts: [data, ...state.runningScripts]
            };
        }

        case ActionTypes.StopScriptSuccess: {
            const runningId: string = (action as StopScriptSuccessAction).payload;

            return {
                ...state,
                runningScripts: state.runningScripts.filter(r => r.runningId !== runningId)
            };
        }

        case fromScripts.ActionTypes.RenameScriptSuccess: {
            const {script, prevName} = (action as fromScripts.RenameScriptSuccessAction).payload;

            return {
                ...state,
                selectedScriptId: state.selectedScriptId === prevName ? script.name : state.selectedScriptId,
                runningScripts: state.runningScripts.map((s) => {
                    return s.scriptName === prevName
                        ? {...s, scriptName: script.name}
                        : s;
                })
            };
        }

        case ActionTypes.CompileScript: {
            return {
                ...state,
                compilationResult: {
                    status: COMPILE_STATUS.COMPILING
                }
            };
        }

        case ActionTypes.CompileScriptSuccess: {
            const {scriptName, result} = (action as CompileScriptSuccessAction).payload;

            if (scriptName === state.selectedScriptId) { // TODO: ADD id
                return {
                    ...state,
                    compilationResult: {
                        status: result.success ? COMPILE_STATUS.SUCCESS : COMPILE_STATUS.FAILED,
                        problems: result.success ? null : result.output
                    }
                };
            }

            return state;
        }

        case ActionTypes.CompileScriptFailed: {
            return {
                ...state,
                compilationResult: {
                    status: COMPILE_STATUS.NEEDED
                }
            };
        }
    }

    return state;
}
