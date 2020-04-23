import {Component, OnInit, ViewChild} from '@angular/core';
import {EconomicEvent, EconomicEventResponseModel, GetEventsParams} from "@calendarEvents/models/models";
import {Observable, of} from "rxjs";
import {EventUserService} from "@calendarEvents/services/event-user.service";
import {MatDialog} from "@angular/material/dialog";
import {EventEditorAction, EventEditorComponent} from "../event-editor/event-editor.component";
import {EventConsolidatorService} from "../../services/event-consolidator.service";
import {ActivatedRoute} from "@angular/router";
import {EEventVolatility} from "@calendarEvents/models/enums";
import {MatSelectChange} from "@angular/material/select";
import {ConfirmModalComponent, ManualSearchComponent, SearchHandler} from "UI";
import {TzUtils} from "TimeZones";
import {
    PaginationResponse,
    PaginationComponent,
    PaginationParams,
    IPaginationResponse
} from "@app/models/pagination.model";
import {PageEvent} from "@angular/material/typings/paginator";
import {memoize} from "@decorators/memoize";
import {ComponentIdentifier} from "@app/models/app-config";
import {JsUtil} from "../../../../utils/jsUtil";
import {SystemNotification} from "../../../Notifications/models/models";

enum EEventVolatilityFilter {
    All = 0,
    Lowest = EEventVolatility.Lowest,
    Low = EEventVolatility.Low,
    Medium = EEventVolatility.Medium,
    High = EEventVolatility.High,
    Highest = EEventVolatility.Highest
}

@Component({
    selector: 'event-consolidator',
    templateUrl: './event-consolidator.component.html',
    styleUrls: ['./event-consolidator.component.scss']
})
export class EventConsolidatorComponent extends PaginationComponent<EconomicEvent> implements OnInit {
    events: EconomicEvent[];
    processing = false;
    searchHandler: SearchHandler;
    searchTerm = '';
    selectedEventsVolatilityFilter = EEventVolatilityFilter.All;
    selectedEventsFromDateFilter: Date;
    selectedEventsToDateFilter: Date;
    eventVolatilityFilters: EEventVolatilityFilter[] = [
        EEventVolatilityFilter.All,
        EEventVolatilityFilter.Lowest,
        EEventVolatilityFilter.Low,
        EEventVolatilityFilter.Medium,
        EEventVolatilityFilter.High,
        EEventVolatilityFilter.Highest,
    ];

    @ViewChild(ManualSearchComponent, {static: false}) search: ManualSearchComponent;

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    get EEventVolatility() {
        return EEventVolatility;
    }

    constructor(private _route: ActivatedRoute,
                private _eventUserService: EventUserService,
                private _eventConsolidatorService: EventConsolidatorService,
                private _dialog: MatDialog) {
        super();
    }

    ngOnInit() {
        (this._route.snapshot.data['events'] as Observable<PaginationResponse<EconomicEvent>>)
            .subscribe({
                next: (data) =>  this.setPaginationHandler(data)
            });
    }

    onSearchValueChange(searchTerm: string) {
        this.searchTerm = searchTerm;
        this.resetPagination();
    }

    addEvent() {
        this._dialog.open(EventEditorComponent, {
            data: {
                mode: EventEditorAction.Create,
                event: new EconomicEvent()
            }
        })
            .afterClosed()
            .subscribe((data) => {
                if (data) {
                    this.resetPagination();
                }
            });
    }

    editEvent(event: EconomicEvent) {
        this._dialog.open(EventEditorComponent, {
            data: {
                mode: EventEditorAction.Update,
                event: event
            }
        }).afterClosed()
            .subscribe((data) => {
                if (data) {
                    // this.resetPagination();
                    this.events = JsUtil.replaceArrayItem(this.events,
                        (sn: SystemNotification) => sn.id === data.id, data);
                }
            });
    }

    setEventActual(event: EconomicEvent) {
        this._dialog.open(EventEditorComponent, {
            data: {
                mode: EventEditorAction.SetActual,
                event: event
            }
        })
            .afterClosed()
            .subscribe((data) => {
                if (data) {
                    this.resetPagination();
                }
            });
    }

    deleteEvent(event: EconomicEvent) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: 'Do you really want to remove this event?'
            }
        } as any)
            .afterClosed()
            .subscribe((isConfirmed) => {
                if (isConfirmed) {
                    this._eventConsolidatorService.deleteEvent(event.id)
                        .subscribe(() => {
                            this.resetPagination();
                        }, (e) => {
                            console.log('Error: ' + e);
                        });
                }
            });
    }

    handleVolatilityFilterChange(change: MatSelectChange) {
        this.selectedEventsVolatilityFilter = change.value;
        this.resetPagination();
    }

    @memoize()
    getFilterStr(statusFilter: EEventVolatilityFilter): string {
        return EEventVolatility[statusFilter] || 'All';
    }

    clearDatePickers() {
        this.selectedEventsFromDateFilter = null;
        this.selectedEventsToDateFilter = null;
        this.resetPagination();
    }

    utcTimeToLocal(time: number) {
        return TzUtils.utcToLocalTz(new Date(time));
    }

    private _localTimeToUtc(time: number): number {
        return TzUtils.localToUTCTz(new Date(time)).getTime();
    }

    getItems(): Observable<IPaginationResponse<EconomicEvent>> {
        return this._eventUserService.getEventsList(this.paginationParams, this.getFiltrationParams());
    }

    responseHandler(response: [IPaginationResponse<EconomicEvent>, PageEvent]): void {
        this.events = response[0].items;
    }

    private getFiltrationParams(): GetEventsParams  {
        return {
            startDate: this.selectedEventsFromDateFilter ? this._localTimeToUtc(this.selectedEventsFromDateFilter.getTime()) : null,
            endDate: this.selectedEventsToDateFilter ? this._localTimeToUtc(this.selectedEventsToDateFilter.getTime()) : null,
            volatility: this.selectedEventsVolatilityFilter,
            search: this.searchTerm,
        } as GetEventsParams ;
    }
}
