import {LocalTimeZone, TimeZone, UTCTimeZone} from "../models/models";
import {Inject, Injectable} from "@angular/core";
import {TimeZonesTranslateService} from "../localization/token";
import {TranslateService} from "@ngx-translate/core";
import {Observable, of} from "rxjs";
import {map} from "rxjs/operators";
import {IDateMapper} from "@app/models/filtration-params";

@Injectable()
export class TzUtils {
    constructor(@Inject(TimeZonesTranslateService) private _timeZonesTranslateService: TranslateService) {
    }

    static convertDateTz(date: Date, fromTimeZone: TimeZone, toTimeZone: TimeZone): Date {
        if (fromTimeZone.id === toTimeZone.id) {
            return date;
        }

        const dateStr = moment(date).format('YYYY-MM-DD HH:mm:ss');
        let convertedMoment = null;

        if (fromTimeZone.isLocal) {
            convertedMoment = (moment(date).clone() as any).tz(toTimeZone.timeZoneName);
        } else if (toTimeZone.isLocal) {
            convertedMoment = (moment as any).tz(dateStr, fromTimeZone.timeZoneName).local();
        } else {
            convertedMoment = (moment as any).tz(dateStr, fromTimeZone.timeZoneName).clone().tz(toTimeZone.timeZoneName);
        }

        const convertedDate = new Date(
            convertedMoment.year(),
            convertedMoment.month(),
            convertedMoment.date(),
            convertedMoment.hour(),
            convertedMoment.minutes(),
            convertedMoment.second(),
            convertedMoment.millisecond()
        );

        return convertedDate;
    }

    static localToUTCTz(date: Date): Date {
        return TzUtils.convertDateTz(date, LocalTimeZone, UTCTimeZone);
    }

    static localToUTCTzSeconds(date: Date): number {
        return TzUtils.convertDateTz(date, LocalTimeZone, UTCTimeZone).getTime() / 1000;
    }

    static utcToLocalTz(date: Date): Date {
        return TzUtils.convertDateTz(date, UTCTimeZone, LocalTimeZone);
    }

    static dateTimestamp(date: Date, timeZone: TimeZone): number {
        const utcDate = TzUtils.convertDateTz(date, timeZone, UTCTimeZone);

        return Date.UTC(
            utcDate.getFullYear(),
            utcDate.getMonth(),
            utcDate.getDate(),
            utcDate.getHours(),
            utcDate.getMinutes(),
            utcDate.getSeconds(),
            utcDate.getMilliseconds()
        );
    }

    getTimeZoneCaption(timeZone: TimeZone, addBrackets: boolean = true): Observable<string> {
        if (timeZone.abbreviation) {
            if (timeZone.abbreviation === 'UTC') {
                return of(timeZone.abbreviation);
            }

            return of(
                `${addBrackets ? '(' : ''}${timeZone.abbreviation} ${this._UTCShiftCaption(timeZone)}${addBrackets ? ')' : ''}`
            );
        }

        if (timeZone.isLocal) {
            return this._timeZonesTranslateService.get('local')
                .pipe(
                    map((caption: string) => `${addBrackets ? '(' : ''}${caption}${addBrackets ? ')' : ''}`)
                );
        }

        return this._timeZonesTranslateService.get(`cities.${timeZone.city}`)
            .pipe(
                map((city: string) =>
                    `${addBrackets ? '(' : ''}${this._UTCShiftCaption(timeZone)}${addBrackets ? ')' : ''} ${city}`
                )
            );
    }

    private _UTCShiftCaption(timeZone: TimeZone): string {
        if (timeZone.shift == null) {
            return '';
        }

        let caption = timeZone.shift.h >= 0 ? `UTC+${timeZone.shift.h}` : `UTC${timeZone.shift.h}`;

        if (timeZone.shift.m) {
            caption = `${caption}:${timeZone.shift.m}`;
        }

        return caption;
    }

}

(window as any).temp = TzUtils;
