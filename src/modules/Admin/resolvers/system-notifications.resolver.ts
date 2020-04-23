import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {BaseResolver} from "./base-resolver";
import {SystemNotificationsService} from "../../Notifications/services/system-notifications.service";
import {SystemNotification, SystemNotificationsResponseModel} from "../../Notifications/models/models";
import {PaginationResponse} from "@app/models/pagination.model";

@Injectable()
export class SystemNotificationsResolver extends BaseResolver<PaginationResponse<SystemNotification>> {
    constructor(private _systemNotificationsService: SystemNotificationsService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PaginationResponse<SystemNotification>> {
        return this._systemNotificationsService.getNotificationsByFilter();
    }
}
