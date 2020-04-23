import {ActionReducer} from "@ngrx/store";
import * as fromPlatform from '../actions/platform.actions';

export function resetReducer(reducer: ActionReducer<any, fromPlatform.PlatformActions>): ActionReducer<any, fromPlatform.PlatformActions> {
    return (state, action: fromPlatform.PlatformActions) => {
        if (action.type === fromPlatform.ActionTypes.ResetStore) {
            return reducer(undefined, action);
        }

        return reducer(state, action);
    };
}
