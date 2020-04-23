import {Component, OnInit} from '@angular/core';
import {ServiceStatus} from "../services-health-check/services-health-check.component";
import {IEventLogFiltrationParams, SystemMonitoringService} from "../../../services/system-monitoring.service";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {MatDialog} from "@angular/material/dialog";
import {PaginationComponent, IPaginationResponse} from "@app/models/pagination.model";
import {PageEvent} from "@angular/material/typings/paginator";
import {
    IJSONViewDialogData,
    JSONViewDialogComponent
} from "../../../../Shared/components/json-view/json-view-dialog.component";
import {FiltrationParams} from "@app/models/filtration-params";
import {ComponentIdentifier} from "@app/models/app-config";
import {IEventsLogItem, EventsLogRequestParams, IEventsLogResolvedData} from "../../../data/system-monitoring.models";
import {ActivatedRoute} from "@angular/router";

class EventLogFiltrationParams extends FiltrationParams<EventsLogRequestParams> implements EventsLogRequestParams {
    statusCode;
    serviceName;
    from: string;
    to: string;
    requestMethod: string;

    constructor() {
        super();
    }

    clearDateParams() {
        this.from = null;
        this.to = null;
    }

    clear() {
        this.clearDateParams();
        this.statusCode = null;
        this.serviceName = null;
    }

    toObject(): EventsLogRequestParams {
        return {
            from: this.toJSON(this.from),
            to: this.toJSON(this.to),
            serviceName: this.serviceName === 'All' ? null : this.serviceName,
            statusCode: this.statusCode === 'All' ? null : this.statusCode,
        };
    }
}

@Component({
    selector: 'events-log',
    templateUrl: './events-log.component.html',
    styleUrls: ['./events-log.component.scss']
})
export class EventsLogComponent extends PaginationComponent<IEventsLogItem> implements OnInit {
    filtrationParams$: Observable<IEventLogFiltrationParams>;
    filtrationParams = new EventLogFiltrationParams();
    logs: IEventsLogItem[] = [];
    ServiceStatus = ServiceStatus;
    loading = false;

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    get from() {
        return this.filtrationParams.from;
    }

    set from(value) {
        this.filtrationParams.from = value;
    }

    get to() {
        return this.filtrationParams.to;
    }

    set to(value) {
        this.filtrationParams.to = value;
    }

    constructor(private _systemMonitoringService: SystemMonitoringService,
                private _route: ActivatedRoute,
                private _dialog: MatDialog) {
        super();
    }

    ngOnInit() {
        this.setPaginationHandler((this._route.snapshot.data as IEventsLogResolvedData).logs);

        this.filtrationParams$ = this._systemMonitoringService.getFiltrationParameters()
            .pipe(
                map(params => {
                    Object.keys(params).forEach(key => params[key] = ['All', ...params[key]]);
                    return params;
                }),
                catchError(() => of(null))
            );
    }

    responseHandler(res: [IPaginationResponse<IEventsLogItem>, PageEvent]) {
        this.logs = res[0].items;
    }

    getItems() {
        return this._systemMonitoringService.getEventsLog(this.paginationParams, this.filtrationParams.toObject());
    }

    clearDatePickers() {
        this.filtrationParams.clearDateParams();
        this.resetPagination();
    }

    showItemDetailsDialog(data: IEventsLogItem) {
        this._dialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Log details',
                json: data
            }
        });
    }

    handleServiceNameChange(event) {
        this.filtrationParams.serviceName = event.value;
        this.resetPagination();
    }

    private handleStatusCodeChange(event) {
        this.filtrationParams.statusCode = event.value;
        this.resetPagination();
    }
}
