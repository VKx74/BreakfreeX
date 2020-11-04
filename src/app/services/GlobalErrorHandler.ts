import { Injectable } from "@angular/core";
import { ErrorHandler } from '@angular/core';
import {Store} from "@ngrx/store";
import {AppState} from "@app/store/reducer";
import { GlobalErrorAction } from '@app/store/actions/platform.actions';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private _store: Store<AppState>) { }
    handleError(error) {
        if (error && error.stack) {
            const tcdInCallStack = error.stack.indexOf("TradingChartDesigne");
            if (tcdInCallStack >= 0) {
                this._store.dispatch(new GlobalErrorAction());
            }
        }
        // IMPORTANT: Rethrow the error otherwise it gets swallowed
        throw error;
    }

}
