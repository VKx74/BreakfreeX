import {Component, ViewChild} from '@angular/core';
import {
    GetNotificationsParams,
    SystemNotification,
    SystemNotificationsResponseModel
} from "../../../Notifications/models/models";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmModalComponent, ManualSearchComponent, SearchHandler} from "UI";
import {NotificationEditorComponent} from "../notification-editor/notification-editor.component";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {SystemNotificationsService} from "../../../Notifications/services/system-notifications.service";
import {TzUtils} from "TimeZones";
import {PaginationResponse, PaginationComponent, IPaginationResponse} from "@app/models/pagination.model";
import {PageEvent} from "@angular/material/typings/paginator";
import {ComponentIdentifier} from "@app/models/app-config";
import {JsUtil} from "../../../../utils/jsUtil";
import {MarketModel} from "@app/models/exchange/models";

class NotificationFiltrationParams implements GetNotificationsParams {
    startDate: string;
    endDate: string;
    search: string;

    clearDateParams() {
        this.startDate = '';
        this.endDate = '';
    }

    clear() {
        this.clearDateParams();
        this.search = '';
    }

    toObject() {
        return {
            search: this.search,
            startDate: this.getFormatedDate(this.startDate),
            endDate: this.getFormatedDate(this.endDate),
        };
    }

    private getFormatedDate(date: string | Date) {
        return date ? TzUtils.localToUTCTz(new Date(date)).getTime() / 1000 : null;
    }
}

@Component({
    selector: 'notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent extends PaginationComponent<SystemNotification> {
    processing = false;
    filtrationParameters = new NotificationFiltrationParams();
    notifications: SystemNotification[] = [];
    ComponentIdentifier = ComponentIdentifier;

    get fromDate() {
        return this.filtrationParameters.startDate;
    }

    set fromDate(value: string) {
        this.filtrationParameters.startDate = value;
    }

    get toDate() {
        return this.filtrationParameters.endDate;
    }

    set toDate(value: string) {
        this.filtrationParameters.endDate = value;
    }

    constructor(private _systemNotifiactionsUserService: SystemNotificationsService,
                private _dialog: MatDialog,
                private _route: ActivatedRoute) {
        super();
    }

    ngOnInit() {
        (this._route.snapshot.data['notifications'] as Observable<PaginationResponse<SystemNotification>>)
            .subscribe({
                next: (res: PaginationResponse<SystemNotification>) => {
                    this.setPaginationHandler(res);
                }
            });
        // this.searchHandler = {
        //     onSearch: (query: string) => {
        //         return this.handleSearch(query);
        //     },
        //     onSearchCompleted: (result: SystemNotificationsResponseModel) => {
        //         this.processing = false;
        //         this.notifications = result['items'];
        //         // this.notifications = result.notifications.sort((a, b) => b.startDate - a.startDate);
        //     },
        //     onSearchError: (error: any, query: string) => {
        //         this.processing = false;
        //     }
        // };
    }

    searchNotifications(searchTerm: string) {
        this.filtrationParameters.search = searchTerm;
        this.resetPagination();
    }

    addNotification() {
        this._dialog.open(NotificationEditorComponent, {
            data: {
                isEditMode: false,
                notification: new SystemNotification(),
                submitHandler: (model: SystemNotification) => this._systemNotifiactionsUserService.createNotification(model)
            }
        })
            .afterClosed()
            .subscribe((data) => {
                if (data) {
                    this.resetPagination();
                }
            }, e => {
                console.log(e);
            });
    }

    editNotification(notification: SystemNotification) {
        this._dialog.open(NotificationEditorComponent, {
            data: {
                isEditMode: true,
                notification: notification,
                submitHandler: (model: SystemNotification) => this._systemNotifiactionsUserService.updateNotification(model)
            }
        })
            .afterClosed()
            .subscribe((data: SystemNotification) => {
                if (data) {
                    this.notifications = JsUtil.replaceArrayItem(this.notifications,
                        (sn: SystemNotification) => sn.id === data.id, data);
                }
            }, e => {
                console.log(e);
            });
    }

    deleteNotification(notification: SystemNotification) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: 'Do you really want to remove this notification?'
            }
        } as any)
            .afterClosed()
            .subscribe((isConfirmed) => {
                if (isConfirmed) {
                    this.processing = true;
                    this._systemNotifiactionsUserService.deleteNotification(notification.id)
                        .subscribe((id: string) => {
                            this.processing = false;
                            // this.notifications = this.notifications.filter(value => id !== value.id);
                            this.resetPagination();
                        }, e => {
                            this.processing = false;
                            console.log(e);
                        });
                }
            });
    }

    clearDatePickers() {
        this.filtrationParameters.clearDateParams();
        this.resetPagination();
    }

    getItems() {
        return this._systemNotifiactionsUserService.getNotificationsByFilter(this.paginationParams, this.filtrationParameters.toObject());
    }

    responseHandler(response: [IPaginationResponse<SystemNotification>, PageEvent]): void {
        this.notifications = response[0].items;
    }

    utcTimeToLocal(time: number): number {
        return TzUtils.utcToLocalTz(new Date(time)).getTime();
    }

    private _localTimeToUtc(time: number): number {
        return TzUtils.localToUTCTz(new Date(time)).getTime();
    }

}
