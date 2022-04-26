import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { IUserWalletResponse } from "modules/Companion/models/models";
import { CompanionUserTrackerService } from "../services/companion.user.tracker.service";


@Injectable()
export class CompanionWalletDetailsResolver implements Resolve<IUserWalletResponse> {
    constructor(private _companionUserTrackerService: CompanionUserTrackerService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IUserWalletResponse> {
        const id = route.params['id'];

        return this._companionUserTrackerService.getWalletDetailsList(id)
            .pipe(
                catchError(() => of(null))
            );
    }
}
