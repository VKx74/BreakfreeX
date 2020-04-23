 import {Inject, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {Observable, Observer} from "rxjs";
import {WebsocketBase} from "@app/interfaces/socket/socketBase";
import {EventWebsocketService} from "./event-websocket.service";
import {EconomicEvent, EconomicEventNotification, EconomicEventResponseModel, GetEventsParams} from "../models/models";
import {JsUtil} from "../../../utils/jsUtil";
import {PaginationResponse, PaginationParams} from "@app/models/pagination.model";
import {map} from "rxjs/operators";
import {QueryParamsConstructor} from "../../Admin/data/models";

@Injectable({
    providedIn: 'root'
})
export class EventUserService {
    private _subscribers: { [token: string]: Observer<EconomicEventNotification> } = {};

    constructor(@Inject(EventWebsocketService) private _socket: WebsocketBase,
                private _http: HttpClient) {
        this._socket.onMessage.subscribe((value: any) => {
            this._handleNotification(value);
        });
    }

    subscribeOnNotification(): Observable<EconomicEventNotification> {
        return new Observable<any>((observer: Observer<any>) => {
            const token = JsUtil.generateGUID();

            this._socket.open()
                .subscribe({
                    next: () => {
                        this._subscribers[token] = observer;
                    },
                    error: (error: Error) => {
                        observer.error(error);
                    }
                });

            return () => {
                this._unsubscribe(token);
            };
        });
    }

    private _unsubscribe(token: string) {
        delete this._subscribers[token];

        if (Object.keys(this._subscribers).length === 0) {
            this._socket.close();
        }
    }

    open(): Observable<any> {
        return new Observable((observer: Observer<any>) => {
            this._socket.open().subscribe(value => {
                observer.next(value);
            }, error => {
                observer.error(error);
            });
        });
    }

    close(): void {
        return this._socket.close();
    }

    getEvents(params: GetEventsParams = {}): Observable<EconomicEventResponseModel> {
        return this._http.get<EconomicEventResponseModel>(`${AppConfigService.config.apiUrls.eventConsolidatorUserApiREST}`,
            {params: this._convertGetEventsParams(params)}
        );
    }

    getEventsList(params: PaginationParams, filtrationParams?: GetEventsParams): Observable<PaginationResponse<EconomicEvent>> {
        return this._http.get<EconomicEventResponseModel>(`${AppConfigService.config.apiUrls.eventConsolidatorUserApiREST}`,
            {params: QueryParamsConstructor.fromObjects(params.toSkipLimit(), filtrationParams)}
        ).pipe(
            map(res => new PaginationResponse(res.tradingEvents, res.count))
        );
    }

    getEvent(eventId: string) {
        return this._http.get(`${AppConfigService.config.apiUrls.identityUrl}Events/${eventId}`);
    }

    private _convertGetEventsParams(params: GetEventsParams): HttpParams {
        let paramsOptions = {
            fromObject: {
            }
        };

        if (params.startDate != null) {
            paramsOptions.fromObject['StartDate'] = params.startDate.toString();
        }

        if (params.endDate != null) {
            paramsOptions.fromObject['EndDate'] = params.endDate.toString();
        }

        if (params.volatility != null) {
            paramsOptions.fromObject['Volatility'] = params.volatility.toString();
        }

        if (params.search != null) {
            paramsOptions.fromObject['Search'] = params.search.toString();
        }

        if (params.skip != null) {
            paramsOptions.fromObject['Skip'] = params.skip.toString();
        }

        if (params.limit != null) {
            paramsOptions.fromObject['Limit'] = params.limit.toString();
        }

        if (params.symbols != null) {
            paramsOptions.fromObject['Symbols'] = params.symbols;
        }

        return new HttpParams(paramsOptions);
    }

    private _handleNotification(notification: EconomicEventNotification) {
        Object.values(this._subscribers).forEach((subscriber: Observer<EconomicEventNotification>) => {
            subscriber.next(notification);
        });
    }
}
