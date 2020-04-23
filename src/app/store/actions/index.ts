import {Action} from "@ngrx/store";

enum ActionTypes {
    LogoutSuccess = '[App] Logout Success'
}

export class LogoutSuccessAction implements Action {
    readonly type = ActionTypes.LogoutSuccess;

    constructor() {
    }
}

export const AppActionTypes = ActionTypes;
export type AppActions = LogoutSuccessAction;
