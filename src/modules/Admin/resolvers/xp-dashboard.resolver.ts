import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {Observable, of} from "rxjs";
import {DepositDTO} from "@app/models/exchange/models";
import {BaseResolver} from "./base-resolver";
import {ExchangeManagementApiService} from "../services/exchange-management-api.service";
import {PaginationParams, IPaginationResponse} from "@app/models/pagination.model";
import {DiscussionDTO} from "../../DiscussionForum/data/api";
import {DiscussionsService} from "../../DiscussionForum/services/discussions.service";
import { XPDashboardItemDTO } from "../data/xp-dashboard/models";
import { XPDashboardService } from "../services/xp-dashboard.service";

@Injectable()
export class XPDashboardResolver extends BaseResolver<IPaginationResponse<XPDashboardItemDTO>> {
    constructor(private _xpService: XPDashboardService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPaginationResponse<XPDashboardItemDTO>> {
        return this._xpService.getXPDashboard();
    }
}
