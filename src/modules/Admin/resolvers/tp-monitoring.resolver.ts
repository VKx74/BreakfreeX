import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { IPaginationResponse } from "@app/models/pagination.model";
import { Observable } from "rxjs";
import { UserMTAccounts } from "../data/tp-monitoring/TPMonitoringDTO";
import { TPMonitoringService } from "../services/tp-monitoring.service";
import { BaseResolver } from "./base-resolver";

@Injectable()
export class TPMonitoringResolver extends BaseResolver<IPaginationResponse<UserMTAccounts>> {
    constructor(private _tpmService: TPMonitoringService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPaginationResponse<UserMTAccounts>> {
        return this._tpmService.getUsers();
    }
}