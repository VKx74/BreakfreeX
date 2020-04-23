import * as fromScripting from './scripting.reducer';
import * as fromRoot from '@platform/store/reducers';

export interface ScriptingState extends fromScripting.State {
}

export interface State extends fromRoot.State {
    scripting: ScriptingState;
}

export const reducer = fromScripting.reducer;
