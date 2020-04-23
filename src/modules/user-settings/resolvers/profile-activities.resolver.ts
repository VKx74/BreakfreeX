import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {IdentityActivityLogInfo, IdentityLogsService} from "@app/services/identity-logs.service";
import {catchError, map} from "rxjs/operators";
import {BaseResolver} from "../../Admin/resolvers/base-resolver";

@Injectable()
export class ProfileActivitiesResolver extends BaseResolver<IdentityActivityLogInfo> {
    constructor(private _identityLogsService: IdentityLogsService) {
        super();
    }


    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IdentityActivityLogInfo> {
        return this._identityLogsService.getActivityLogs()
            .pipe(
                map(logs => logs.sort((a, b) => a.time > b.time ? -1 : a.time < b.time ? 1 : 0)),
                catchError(() => [])
            );
    }


}
