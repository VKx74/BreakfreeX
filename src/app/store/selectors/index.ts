import {createSelector} from "@ngrx/store";
import {State} from "@platform/store/reducers";
import {bottomPanelComponentGroup} from "@platform/data/functions";
import {IPlatformState} from "@platform/store/reducers/platform.reducer";
import {IScriptsState} from "@platform/store/reducers/scripts.reducer";

export const platformStateSelector = createSelector(
    (state: State) => state.platform,
    (state: IPlatformState) => state
);

export const scriptsStateSelector = createSelector(
    (state: State) => state.scripts,
    (state: IScriptsState) => state
);

export const loadScriptsStateSelector = createSelector(
    scriptsStateSelector,
    (state: IScriptsState) => state.loadScriptProcessState
);

export const scriptsSelector = createSelector(
    scriptsStateSelector,
    (state: IScriptsState) => state.scripts
);

export const isBottomPanelVisible = createSelector(
    platformStateSelector,
    (state: IPlatformState) => {
        return state.activeBottomComponent != null;
    }
);

export const activeBottomComponent = createSelector(
    platformStateSelector,
    (state: IPlatformState) => {
        return state.activeBottomComponent;
    }
);

export const activeBottomComponentGroup = createSelector(
    platformStateSelector,
    (state: IPlatformState) => {
        return state.activeBottomComponent != null ? bottomPanelComponentGroup(state.activeBottomComponent) : null;
    }
);

export const activeRightSideComponent = createSelector(
    platformStateSelector,
    (state: IPlatformState) => {
        return state.activeRightSideComponent;
    }
);
