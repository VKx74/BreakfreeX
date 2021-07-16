import {Action} from "@ngrx/store";
import {BottomPanelComponents, RightSidePanelComponent} from "@platform/data/enums";

export enum ActionTypes {
    DeleteSession = '[Platform] Delete Session',
    AppTypeChanged = '[Platform] App Type Changed',
    ClearSession = '[Platform] Clear Session',
    GlobalError = '[Platform] Global Error',
    SelectBottomComponent = '[Platform] Select Bottom Component',
    SelectRightSideComponent = '[Platform] Select Right Side Component',
    ShowCode = '[Platform] Show Code',
    ResetStore = '[Platform] Reset Store',
    SaveState = '[Platform] Save State',
    ResetLayout = '[Platform] Reset Layout',
    SaveLayoutAsNew = '[Platform] Save Layout As New',
    OpenNewLayout = '[Platform] Open New Layout',
    LoadLayout = '[Platform] Load Layout'
}

export class SelectBottomComponentAction implements Action {
    readonly type = ActionTypes.SelectBottomComponent;

    constructor(public payload: BottomPanelComponents | null) {
    }
}

export class SelectRightSideComponentAction implements Action {
    readonly type = ActionTypes.SelectRightSideComponent;

    constructor(public payload: RightSidePanelComponent) {
    }

}

export class ShowCodeAction implements Action {
    readonly type = ActionTypes.ShowCode;

    constructor(public payload: string) {
    }

}

export class ResetStoreAction implements Action {
    readonly type = ActionTypes.ResetStore;

    constructor() {
    }
}

export class DeleteSessionAction implements Action {
    readonly type = ActionTypes.DeleteSession;

    constructor() {
    }
}

export class SaveStateAction implements Action {
    readonly type = ActionTypes.SaveState;

    constructor() {
    }
}

export class ResetLayoutAction implements Action {
    readonly type = ActionTypes.ResetLayout;

    constructor() {
    }
}

export class AppTypeChangedAction implements Action {
    readonly type = ActionTypes.AppTypeChanged;

    constructor() {
    }
}

export class ClearSessionAction implements Action {
    readonly type = ActionTypes.ClearSession;

    constructor() {
    }
}

export class GlobalErrorAction implements Action {
    readonly type = ActionTypes.GlobalError;

    constructor() {
    }
}

export type PlatformActions = SelectBottomComponentAction
    | SelectRightSideComponentAction
    | ShowCodeAction
    | ResetStoreAction
    | DeleteSessionAction
    | SaveStateAction
    | ResetLayoutAction
    | ClearSessionAction
    | GlobalErrorAction
    | AppTypeChangedAction;
