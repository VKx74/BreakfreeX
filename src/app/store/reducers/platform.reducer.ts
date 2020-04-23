import {BottomPanelComponents, RightSidePanelComponent} from "@platform/data/enums";
import {
    PlatformActions,
    ActionTypes,
    SelectBottomComponentAction,
    SelectRightSideComponentAction
} from "@platform/store/actions/platform.actions";


export interface IPlatformState {
    activeBottomComponent: BottomPanelComponents;
    activeRightSideComponent: RightSidePanelComponent;
}

export const DefaultPlatformState: IPlatformState = {
    activeBottomComponent: null,
    activeRightSideComponent: null
};

export const reducer = (state: IPlatformState = DefaultPlatformState, action: PlatformActions) => {
    switch (action.type) {
        case ActionTypes.SelectBottomComponent: {
            return {
                ...state,
                activeBottomComponent: (<SelectBottomComponentAction>action).payload
            };
        }

        case ActionTypes.SelectRightSideComponent: {
            return {
                ...state,
                activeRightSideComponent: (<SelectRightSideComponentAction>action).payload
            };
        }

        case ActionTypes.ShowCode: {
            return {
                ...state,
                activeBottomComponent: BottomPanelComponents.ScriptEditor
            };
        }

        case ActionTypes.ResetStore: {
            return {
                ...state,
                activeBottomComponent: null,
                activeRightSideComponent: null
            };
        }
    }

    return state;
};
