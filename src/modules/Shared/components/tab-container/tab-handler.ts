import {Subject} from "rxjs";

export class TabHandler {
    private _onActivate$ = new Subject<any>();
    private _onDeactivate$ = new Subject<any>();

    onActivate(fn: () => void) {
        this._onActivate$.subscribe(fn);
    }

    onDeactivate(fn: () => void) {
        this._onDeactivate$.subscribe(fn);
    }

    activate() {
        this._onActivate$.next();
    }

    deactivate() {
        this._onDeactivate$.next();
    }

    destroy() {
        this._onActivate$.complete();
        this._onDeactivate$.complete();
    }
}
