import {TzUtils} from "TimeZones";

type DateInput = string | Date | number;


export abstract class FiltrationParams<T = any> {
    abstract toObject(): T;

    clear() {
        Object.keys(this).forEach(key => this[key] = null);
    }

    public toJSON(date: DateInput) {
        return date ? new Date(date).toJSON() : null;
    }

    public toUTCMilliseconds(date: DateInput): number {
        return TzUtils.localToUTCTz(new Date(date)).getTime();
    }

    public toUTCSeconds(date: DateInput) {
        return this.toUTCMilliseconds(date) / 1000;
    }

    public toUTCSecondsString(date: DateInput): string {
        return date ? this.toUTCSeconds(date).toString() : '';
    }

    public toUTCDayEndSeconds(date: DateInput): number {
        return this.toUTCSeconds(this._getTimeAtTheDayEnd(date));
    }

    public toUTCDayEndSecondsString(date: DateInput): string {
        return date ? this.toUTCDayEndSeconds(date).toString() : '';
    }

    private _getTimeAtTheDayEnd(date: DateInput): number {
        return new Date(date).setHours(23, 59, 59);
    }
}

export type IDateMapper<K> = (date: DateInput) => K;
export const DEFAULT_DATE_MAPPER: IDateMapper<number> = TzUtils.localToUTCTzSeconds;


export class DateRangeParams<DateType extends DateInput, MapperType = any> {
    private readonly dateMapper: IDateMapper<DateType>;
    private _from: DateType;
    private _to: DateType;

    get from() {
        return this._from;
    }

    set from(value) {
        if (value) {
            this._from = this.dateMapper(value);
        }
    }

    get to() {
        return this._to;
    }

    set to(value) {
        if (value) {
            this._to = this.dateMapper(value);
        }
    }

    constructor(from: DateType = null, to: DateType = null, dateMapper = TzUtils.localToUTCTzSeconds) {
        this.from = from;
        this.to = to;
        this.dateMapper = dateMapper as IDateMapper<DateType>;
    }

    clear() {
        this.from = null;
        this.to = null;
    }

    toParams(): {[key: string]: DateType} {
        return {
            from: this.from,
            to: this.to,
        };
    }
}


