import {createSelector} from "@ngrx/store";
import {State, ScriptingState} from "@scripting/store/reducers";
import {scriptsSelector} from "@platform/store/selectors";
import {Script} from "@scripting/models/Script";

export const scriptingStateSelector = createSelector(
    (state: State) => state.scripting,
    (state: ScriptingState) => state
);

export const selectedScriptSelector = createSelector(
    scriptingStateSelector,
    scriptsSelector,
    (state: ScriptingState, scripts: Script[]) => {
        const draftScript = state.draftScript;
        const selectedScriptId = state.selectedScriptId;
        let selectedScript = scripts.find(s => s.name === selectedScriptId);

        if (!selectedScript) {
            selectedScript = draftScript;
        }

        return selectedScript;
    }
);

export const userScriptsSelector = createSelector(
    scriptsSelector,
    (scripts: Script[]) => scripts
);

export const isSelectedScriptDraft = createSelector(
    scriptingStateSelector,
    (state: ScriptingState) => {
        return state.draftScript && state.selectedScriptId === state.draftScript.name;
    }
);

export const loadRunningScriptsStateSelector = createSelector(
    scriptingStateSelector,
    (state: ScriptingState) => {
        return state.loadRunningState;
    }
);

export const runningScriptsSelector = createSelector(
    scriptingStateSelector,
    (state: ScriptingState) => {
        return state.runningScripts;
    }
);

export const compilationResultSelector = createSelector(
    scriptingStateSelector,
    (state: ScriptingState) => {
        return state.compilationResult;
    }
);

export const selectedScriptCodeSelector = createSelector(
    scriptingStateSelector,
    (state: ScriptingState) => {
        return state.selectedScriptCode;
    }
);
