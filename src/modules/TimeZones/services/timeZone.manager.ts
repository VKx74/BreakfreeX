import {TimeZone, TimeZones} from "../models/models";
import {Subject} from "rxjs";
import {TzUtils} from "../utils/TzUtils";
import {Injectable} from "@angular/core";

export interface TimeZoneChange {
    timeZone: TimeZone;
    prevTimeZone: TimeZone;
}

@Injectable({
    providedIn: 'root'
})
export class TimeZoneManager {
    private _timeZone: TimeZone;
    private _prevTimeZone: TimeZone;

    get timeZone(): TimeZone {
        return this._timeZone;
    }

    get prevTimeZone(): TimeZone {
        return this._prevTimeZone;
    }

    timeZoneChange$ = new Subject<TimeZoneChange>();

    constructor() {
        this._timeZone = TimeZones[0];
    }

    setTimeZone(timeZone: TimeZone) {
        const prevTimeZone = this.timeZone;

        if (prevTimeZone && prevTimeZone.timeZoneName === timeZone.timeZoneName) {
            return;
        }

        this._prevTimeZone = this.timeZone;
        this._timeZone = timeZone;
        this.timeZoneChange$.next({
            timeZone: timeZone,
            prevTimeZone: prevTimeZone
        });
    }

    convertDateTz(date: Date): Date {
        return TzUtils.convertDateTz(date, this.prevTimeZone, this.timeZone);
    }
}
