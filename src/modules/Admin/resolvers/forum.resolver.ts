import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {DepositDTO} from "@app/models/exchange/models";
import {BaseResolver} from "./base-resolver";
import {ExchangeManagementApiService} from "../services/exchange-management-api.service";
import {PaginationParams, IPaginationResponse} from "@app/models/pagination.model";
import {DiscussionDTO} from "../../DiscussionForum/data/api";
import {DiscussionsService} from "../../DiscussionForum/services/discussions.service";

@Injectable()
export class ForumResolver extends BaseResolver<IPaginationResponse<DiscussionDTO>> {
    constructor(private _discussionService: DiscussionsService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPaginationResponse<DiscussionDTO>> {
        return this._discussionService.getDiscussionsList();
    }
}
