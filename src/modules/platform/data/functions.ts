import {BottomPanelComponentGroups, BottomPanelComponents} from "@platform/data/enums";

export function bottomPanelComponentGroup(component: BottomPanelComponents): BottomPanelComponentGroups {
    if (component === BottomPanelComponents.ScriptEditor
        || component === BottomPanelComponents.RunningScripts
        || component === BottomPanelComponents.HistoryDataManager) {
        return BottomPanelComponentGroups.Scripting;
    }

    if (component === BottomPanelComponents.TradeManager) {
        return BottomPanelComponentGroups.Trading;
    }

    if (component === BottomPanelComponents.Backtest
        || component === BottomPanelComponents.RunBacktest) {
        return BottomPanelComponentGroups.Backtest;
    }

    throw new Error('Unknown bottom panel component');
}

export function defaultBottomPanelGroupComponent(group: BottomPanelComponentGroups): BottomPanelComponents {
    if (group === BottomPanelComponentGroups.Scripting) {
        return BottomPanelComponents.ScriptEditor;
    }

    if (group === BottomPanelComponentGroups.Trading) {
        return BottomPanelComponents.TradeManager;
    }

    if (group === BottomPanelComponentGroups.Backtest) {
        return BottomPanelComponents.RunBacktest;
    }

    throw new Error('Unknown bottom panel component group');
}
