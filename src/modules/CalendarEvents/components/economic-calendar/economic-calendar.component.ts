import {Component, OnInit} from '@angular/core';
import {
    EconomicEvent, EconomicEventCreateNotification,
    EconomicEventDeleteNotification,
    EconomicEventNotification,
    EconomicEventUpdateNotification, GetEventsParams
} from "../../models/models";
import {EEconomicCalendarNotificationType, EEventVolatility} from "../../models/enums";
import {EventUserService} from "../../services/event-user.service";
import {takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {TranslateService} from "@ngx-translate/core";
import {AppTranslateService} from "@app/localization/token";
import {TzUtils} from "TimeZones";
import {ComponentIdentifier} from "@app/models/app-config";

@Component({
    selector: 'economic-calendar',
    templateUrl: './economic-calendar.component.html',
    styleUrls: ['./economic-calendar.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AppTranslateService
        }
    ]
})
export class EconomicCalendarComponent implements OnInit {
    readonly DayInMS = 86400000; // Equal 1 day in milliseconds
    readonly MaxNearestEventInterval = 14400000; // Equal 4 hour in milliseconds
    private readonly _interval: any;
    events: EconomicEvent[] = [];
    activeEvents: string[] = [];
    eventDate: Date;
    dateNow = new Date().getTime();
    volatilityClassMap = {
        [EEventVolatility.Lowest]: 'very-low-volatility',
        [EEventVolatility.Low]: 'low-volatility',
        [EEventVolatility.Medium]: 'medium-volatility',
        [EEventVolatility.High]: 'high-volatility',
        [EEventVolatility.Highest]: 'very-high-volatility'
    };

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(private _eventUserService: EventUserService) {
        this._interval = setInterval(() => {
            this.dateNow += 1000;
        }, 1000);

        this.eventDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        this.getEvents(this.eventDate.getTime(), this.eventDate.getTime() + this.DayInMS - 1000);
    }

    ngOnInit() {
        this._eventUserService.subscribeOnNotification()
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe((notification: EconomicEventNotification) => {
                if (notification && notification.type === EEconomicCalendarNotificationType.Update) {
                    this._updateEvent((notification as EconomicEventUpdateNotification).event);
                }
                if (notification && notification.type === EEconomicCalendarNotificationType.Delete) {
                    this._deleteEvent((notification as EconomicEventDeleteNotification).eventid);
                }
                if (notification && notification.type === EEconomicCalendarNotificationType.Create) {
                    this._addEvent((notification as EconomicEventCreateNotification).event);
                }
            });
    }

    isNearTimeToEvent(eventTime: number): boolean {
        return this.dateNow < eventTime && this.dateNow > eventTime - this.MaxNearestEventInterval;
    }

    nextDay() {
        this.eventDate = new Date(this.eventDate.getTime() + this.DayInMS);
        this.getEvents(this.eventDate.getTime(), this.eventDate.getTime() + this.DayInMS - 1000);
    }

    previousDay() {
        this.eventDate = new Date(this.eventDate.getTime() - this.DayInMS);
        this.getEvents(this.eventDate.getTime(), this.eventDate.getTime() + this.DayInMS - 1000);
    }

    showDescription(eventId: string) {
        const indexOfEvent = this.activeEvents.indexOf(eventId);
        if (indexOfEvent !== -1) {
            this.activeEvents.splice(indexOfEvent, 1);
        } else {
            if (this.activeEvents.length === 3) {
                this.activeEvents.shift();
            }
            this.activeEvents.push(eventId);
        }
    }

    utcTimeToLocal(time: number) {
        return TzUtils.utcToLocalTz(new Date(time)).getTime();
    }

    localTimeToUtc(time: number) {
        return TzUtils.localToUTCTz(new Date(time)).getTime();
    }

    getEvents(start?: number, end?: number, volatility?: number, search?: string, skip?: number, limit?: number) {
        const params: GetEventsParams = {
            startDate: this.localTimeToUtc(start),
            endDate: this.localTimeToUtc(end),
            volatility: volatility,
            search: search,
            skip: skip,
            limit: limit
        };
        this._eventUserService.getEvents(params)
            .subscribe((data) => {
                this.activeEvents = [];
                this.events = data.tradingEvents;
            });
    }

    private _deleteEvent(eventId: string) {
        for (let event of this.events) {
            if (event.id === eventId) {
                this.events.splice(this.events.indexOf(event), 1);
                break;
            }
        }
    }

    private _addEvent(event: EconomicEvent) {
        const eventLocalTimeAsUTC = this.localTimeToUtc(this.eventDate.getTime());
        if (event.time >= eventLocalTimeAsUTC && event.time < eventLocalTimeAsUTC + this.DayInMS) {
            this.events = [event, ...this.events];
            console.log(this.events);
            this.events.sort((a, b) => {
                return a.time - b.time;
            });
        }
    }

    private _updateEvent(event: EconomicEvent) {
        this._deleteEvent(event.id);
        this._addEvent(event);
    }

    ngOnDestroy() {
        clearInterval(this._interval);
    }

}
