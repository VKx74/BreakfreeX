import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {Observable} from "rxjs";
import {
    CheckIsNewSystemNotificationsModel,
    GetNotificationsParams,
    SystemNotification,
    SystemNotificationsResponseModel
} from "../models/models";
import {IdentityService} from "@app/services/auth/identity.service";
import {PaginationResponse, PaginationParams} from "@app/models/pagination.model";
import {QueryParamsConstructor} from "../../Admin/data/models";
import {map} from "rxjs/operators";

export enum ExchangeStatus {
    OpenNormal,
    OpenRestricted,
    PreOpen,
    Maintenance,
    Closed,
}

@Injectable({
    providedIn: 'root'
})
export class SystemNotificationsService {
    private readonly _interval = 180000; // equals 3 min in milliseconds
    userId: string;
    userTags: string[] = [];
    isNewNotification: boolean = false;
    exchangeStatus: ExchangeStatus = ExchangeStatus.Closed;

    constructor(private _http: HttpClient,
                private _identityService: IdentityService) {
        this.userId = this._identityService.id;
        this.userTags = this._identityService.tags;
        // this._checkIsUnreadNotification();
        // this.getExchangeStatus()
        //     .subscribe(status => {
        //         this.exchangeStatus = status;
        //     }, error1 => {
        //         this.exchangeStatus = ExchangeStatus.Closed;
        //     });

        // setInterval(() => {
        //     this._checkIsUnreadNotification();
        // }, this._interval);
    }

    getNotifications(paginationParams = new PaginationParams()): Observable<SystemNotificationsResponseModel> {
        return this._http.get<SystemNotificationsResponseModel>(`${AppConfigService.config.apiUrls.systemNotificationApiRest}SystemNotification/user`,
            {params: QueryParamsConstructor.fromObjects(paginationParams.toSkipLimit())});
    }

    deleteNotification(notificationId: string): Observable<string> {
        return this._http.delete(`${AppConfigService.config.apiUrls.systemNotificationApiRest}SystemNotification/?id=${notificationId}`, {
            responseType: "text"
        });
    }

    updateNotification(notification: SystemNotification): Observable<SystemNotification> {
        return this._http.put<SystemNotification>(`${AppConfigService.config.apiUrls.systemNotificationApiRest}SystemNotification/?id=${notification.id}`, notification);
    }

    createNotification(notification: SystemNotification): Observable<SystemNotification> {
        return this._http.post<SystemNotification>(`${AppConfigService.config.apiUrls.systemNotificationApiRest}SystemNotification/`, notification);
    }


    getNotificationsByFilter(paginationParams = new PaginationParams(), filtrationParams?: GetNotificationsParams): Observable<PaginationResponse<SystemNotification>> {
        return this._http.get<SystemNotificationsResponseModel>(`${AppConfigService.config.apiUrls.systemNotificationApiRest}SystemNotification/`,
            {params: QueryParamsConstructor.fromObjects(paginationParams.toSkipLimit(), filtrationParams)})
            .pipe(
                map(res => new PaginationResponse(res.notifications, res.count))
            );
    }

    getExchangeStatus(): Observable<ExchangeStatus> {
        return this._http.get<ExchangeStatus>(`${AppConfigService.config.apiUrls.systemNotificationApiRest}ExchangeStatus`);
    }

    updateExchangeStatus(newStatus: ExchangeStatus): Observable<any> {
        return this._http.put(`${AppConfigService.config.apiUrls.systemNotificationApiRest}ExchangeStatus/${newStatus}`, null);
    }

    private _checkIsUnreadNotification() {
        this._http.get<CheckIsNewSystemNotificationsModel>(`${AppConfigService.config.apiUrls.systemNotificationApiRest}SystemNotification/user/new`)
            .subscribe((value) => {
                this.isNewNotification = value.haveNewNotifications;
            }, e => {
                console.log(e);
            });
    }
}
