import * as fromPlatform from './platform.reducer';
import * as fromScripts from './scripts.reducer';
import {ActionReducerMap} from "@ngrx/store";
import {AppState} from "@app/store/reducer";

export interface State extends AppState {
    platform: fromPlatform.IPlatformState;
    scripts: fromScripts.IScriptsState;
}

export const reducers: ActionReducerMap<State> = {
    platform: fromPlatform.reducer,
    scripts: fromScripts.reducer
};
