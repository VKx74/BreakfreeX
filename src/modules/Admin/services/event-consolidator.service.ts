import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {Observable} from "rxjs";
import {EconomicEvent} from "@calendarEvents/models/models";

@Injectable()
export class EventConsolidatorService {
    constructor(private _http: HttpClient) {
    }

    deleteEvent(eventId: string): Observable<any> {
        return this._http.delete(`${AppConfigService.config.apiUrls.eventConsolidatorAdminApiREST}${eventId}`, {
            responseType: 'text'
        });
    }

    createEvent(event: EconomicEvent): Observable<any> {
        delete event.id;

        return this._http.post(`${AppConfigService.config.apiUrls.eventConsolidatorAdminApiREST}`, event, {
            responseType: 'text'
        });
    }

    updateEvent(event: EconomicEvent): Observable<any> {
        return this._http.put(`${AppConfigService.config.apiUrls.eventConsolidatorAdminApiREST}`, event, {
            responseType: 'text'
        });
    }
}