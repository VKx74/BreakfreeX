import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

export class RightSidePanelState {
    public widgetState: {[key: string]: any};
}

@Injectable()
export class RightSidePanelStateService {
    private _rightSidePanelState: RightSidePanelState;
    private _isInitialized$ = new BehaviorSubject<boolean>(false);

    get isInitialized(): boolean {
        return this._isInitialized$.value;
    }

    stateChanged: Subject<RightSidePanelState> = new Subject<RightSidePanelState>();

    constructor() {
        this._rightSidePanelState = {
            widgetState: {}
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
            this._rightSidePanelState = {
                widgetState: {}
            };
        }
        
        this._rightSidePanelState[widget] = state;
        this.stateChanged.next(this._rightSidePanelState);
    }

    initialize(state: RightSidePanelState) {
        if (this.isInitialized) {
            return;
        }

        this._rightSidePanelState = state;
        this._isInitialized$.next(true);
    }
}