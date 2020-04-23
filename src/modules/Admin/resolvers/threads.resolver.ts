import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {BaseResolver} from "./base-resolver";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {IThread} from "../../Chat/models/thread";
import {IPaginationResponse} from "@app/models/pagination.model";
import {ChatApiService} from "../../Chat/services/chat.api.service";

@Injectable()
export class ThreadsResolver extends BaseResolver<IPaginationResponse<IThread>> {
    constructor(private _threadService: ChatApiService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPaginationResponse<IThread>> {
        return this._threadService.getAdminPanelPublicThreads();
    }
}
