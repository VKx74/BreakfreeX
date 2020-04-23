import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {BaseResolver} from "./base-resolver";
import {EventUserService} from "@calendarEvents/services/event-user.service";
import {EconomicEvent, EconomicEventResponseModel} from "@calendarEvents/models/models";
import {PaginationResponse, PaginationParams} from "@app/models/pagination.model";

@Injectable()
export class EventConsolidatorResolver extends BaseResolver<PaginationResponse<EconomicEvent>> {
    constructor(private _eventUserService: EventUserService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PaginationResponse<EconomicEvent>> {
        return this._eventUserService.getEventsList(new PaginationParams());
    }
}
