import {Injectable} from "@angular/core";
import {Effect} from "@ngrx/effects";
import {NavigationCancel, NavigationEnd, NavigationError, Router} from "@angular/router";
import {tap} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {ResetStoreAction} from "@platform/store/actions/platform.actions";
import {AppState} from "@app/store/reducer";

@Injectable()
export class PlatformEffects {
    constructor(private _store: Store<AppState>,
                private _router: Router) {
    }

    @Effect({dispatch: false})
    resetState = this._router.events
        .pipe(
            tap((event: any) => {
                if (event instanceof NavigationEnd || event instanceof NavigationError || event instanceof NavigationCancel) {
                    this._store.dispatch(new ResetStoreAction());
                }
            })
        );
}
