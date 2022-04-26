import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { PaginationParams, IPaginationResponse } from "@app/models/pagination.model";
import { IUserWalletResponse } from "modules/Companion/models/models";
import { CompanionUserTrackerService } from "../services/companion.user.tracker.service";

@Injectable()
export class CompanionResolver implements Resolve<IPaginationResponse<IUserWalletResponse>> {
    constructor(private _companionUserTrackerService: CompanionUserTrackerService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPaginationResponse<IUserWalletResponse>> {
        return this._companionUserTrackerService.getWalletsList(new PaginationParams())
            .pipe(
                catchError(() => of(null))
            );
    }
}


