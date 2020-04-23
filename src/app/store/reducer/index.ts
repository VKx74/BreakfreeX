import {AppActions} from "@app/store/actions";

export interface AppState {
}

export const DefaultAppState = {};

export const appReducer = (state: AppState = DefaultAppState, action: AppActions): AppState => {
    return state;
};
