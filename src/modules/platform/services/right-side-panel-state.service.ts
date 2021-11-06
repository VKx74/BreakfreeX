import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

export class RightSidePanelState {
    public widgetState: {[key: string]: any};
    public component: Components;
}

export enum Components {
    // Sonar = "Sonar",
    SonarFeed = "Sonar Feed",
    Watchlist = "Watchlist",
    Alerts = "Alerts",
    Academy = "Academy",
    Backtest = "Backtest",
}

@Injectable()
export class RightSidePanelStateService {
    private _rightSidePanelState: RightSidePanelState;
    private _isInitialized$ = new BehaviorSubject<boolean>(false);

    get isInitialized(): boolean {
        return this._isInitialized$.value;
    }
    
    get isInitialized$(): Subject<boolean> {
        return this._isInitialized$;
    }

    stateChanged: Subject<RightSidePanelState> = new Subject<RightSidePanelState>();

    constructor() {
        this._rightSidePanelState = RightSidePanelStateService.GetDefaultState();
    }

    static GetDefaultState(component?: Components): RightSidePanelState {
        return {
            widgetState: {},
            component: component || Components.Academy
        };
    }

    getState(): RightSidePanelState {
        return this._rightSidePanelState;
    }

    getWidgetState(widget: string): any {
        if (!this._rightSidePanelState) {
            return null;
        }

        return this._rightSidePanelState[widget];
    }

    setWidgetState(widget: string, state: any) {
        if (!this._rightSidePanelState) {
            this._rightSidePanelState = RightSidePanelStateService.GetDefaultState();
        }
        
        this._rightSidePanelState[widget] = state;
        this.stateChanged.next(this._rightSidePanelState);
    }

    setActiveComponent(component: Components) {
        if (!this._rightSidePanelState) {
            this._rightSidePanelState = RightSidePanelStateService.GetDefaultState();
        }
        
        this._rightSidePanelState.component = component;
    }

    getActiveComponent(): Components {
        if (!this._rightSidePanelState) {
            return null;
        }

        if (this._rightSidePanelState.component === Components.Backtest) {
            return Components.Academy;
        }

        return this._rightSidePanelState.component;
    }

    initialize(state: RightSidePanelState) {
        if (this.isInitialized) {
            return;
        }

        this._rightSidePanelState = state;
        this._rightSidePanelState = state;
        this._isInitialized$.next(true);
    }
}