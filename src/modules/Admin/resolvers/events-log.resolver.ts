import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {BaseResolver} from "./base-resolver";
import {EventUserService} from "@calendarEvents/services/event-user.service";
import {EconomicEvent, EconomicEventResponseModel} from "@calendarEvents/models/models";
import {PaginationResponse, PaginationParams} from "@app/models/pagination.model";
import {EventsLogComponent} from "../components/system-monitoring/events-log/events-log.component";
import {SystemMonitoringService} from "../services/system-monitoring.service";

@Injectable()
export class EventsLogResolver implements Resolve<any> {
    constructor(private _elService: SystemMonitoringService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return this._elService.getEventsLog();
    }
}
