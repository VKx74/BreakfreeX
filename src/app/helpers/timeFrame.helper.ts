import {ITimeFrame} from "../models/common/timeFrame";
import {IPeriodicity} from "../models/common/periodicity";
import {AppTranslateService} from "@app/localization/token";
import {Inject, Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";

export const TimeSpan = {
    MILLISECONDS_IN_YEAR: 31622400000,
    MILLISECONDS_IN_MONTH: 2678400000,
    MILLISECONDS_IN_WEEK: 604800000,
    MILLISECONDS_IN_DAY: 86400000,
    MILLISECONDS_IN_HOUR: 3600000,
    MILLISECONDS_IN_MINUTE: 60000,
    MILLISECONDS_IN_SECOND: 1000
};

@Injectable()
export class TimeFrameHelper {
    static shortPeriodicity(periodicity: IPeriodicity): string {
        const _map = {
            [IPeriodicity.minute]: 'm',
            [IPeriodicity.hour]: 'h',
            [IPeriodicity.day]: 'd',
            [IPeriodicity.week]: 'w',
            [IPeriodicity.month]: 'M',
            [IPeriodicity.year]: 'y'
        };

        return _map[periodicity];
    }

    static timeFrameToInterval(timeFrame: ITimeFrame): number {
        switch (timeFrame.periodicity) {
            case IPeriodicity.minute:
                return 1000 * 60 * timeFrame.interval;
            case IPeriodicity.hour:
                return 1000 * 60 * 60 * timeFrame.interval;
            case IPeriodicity.day:
                return 1000 * 60 * 60 * 24 * timeFrame.interval;
            case IPeriodicity.week:
                return 1000 * 60 * 60 * 24 * 7 * timeFrame.interval;
            case IPeriodicity.month:
                return 1000 * 60 * 60 * 24 * 31 * timeFrame.interval;
            case IPeriodicity.year:
                return 1000 * 60 * 60 * 24 * 365 * timeFrame.interval;
        }
    }

    static intervalToTimeFrame(intervalInMs: number): ITimeFrame {

        if (intervalInMs >= TimeSpan.MILLISECONDS_IN_YEAR) {
            return {
                periodicity: IPeriodicity.year,
                interval: intervalInMs / TimeSpan.MILLISECONDS_IN_YEAR
            };
        }
        if (intervalInMs >= TimeSpan.MILLISECONDS_IN_MONTH) {
            return {
                periodicity: IPeriodicity.month,
                interval: intervalInMs / TimeSpan.MILLISECONDS_IN_MONTH
            };
        }
        if (intervalInMs >= TimeSpan.MILLISECONDS_IN_WEEK && intervalInMs % TimeSpan.MILLISECONDS_IN_WEEK === 0) {
            return {
                periodicity: IPeriodicity.week,
                interval: intervalInMs / TimeSpan.MILLISECONDS_IN_WEEK
            };
        }
        if (intervalInMs >= TimeSpan.MILLISECONDS_IN_DAY) {
            return {
                periodicity: IPeriodicity.day,
                interval: intervalInMs / TimeSpan.MILLISECONDS_IN_DAY
            };
        }
        if (intervalInMs >= TimeSpan.MILLISECONDS_IN_HOUR) {
            return {
                periodicity: IPeriodicity.hour,
                interval: intervalInMs / TimeSpan.MILLISECONDS_IN_HOUR
            };
        }
        if (intervalInMs >= TimeSpan.MILLISECONDS_IN_MINUTE) {
            return {
                periodicity: IPeriodicity.minute,
                interval: intervalInMs / TimeSpan.MILLISECONDS_IN_MINUTE
            };
        }

        throw new Error(`Unsupported time interval: ${intervalInMs}`);
    }

    static TCDTimeFrameToTimeFrame(timeFrame: TradingChartDesigner.ITimeFrame): ITimeFrame {
        return {
            interval: timeFrame.interval,
            periodicity: TimeFrameHelper.TCDPeriodicityToPeriodicity(timeFrame.periodicity)
        };
    }

    static TCDPeriodicityToPeriodicity(periodicity: string): IPeriodicity {
        const map = {
            [TradingChartDesigner.Periodicity.MINUTE]: IPeriodicity.minute,
            [TradingChartDesigner.Periodicity.HOUR]: IPeriodicity.hour,
            [TradingChartDesigner.Periodicity.DAY]: IPeriodicity.day,
            [TradingChartDesigner.Periodicity.WEEK]: IPeriodicity.week,
            [TradingChartDesigner.Periodicity.MONTH]: IPeriodicity.month,
            [TradingChartDesigner.Periodicity.YEAR]: IPeriodicity.year
        };

        return map[periodicity];
    }

    constructor(@Inject(AppTranslateService) private _translateService: TranslateService) {
    }

    timeFrameToStr(timeFrame: ITimeFrame): Observable<string> {
        const key = `${timeFrame.interval}${TimeFrameHelper.shortPeriodicity(timeFrame.periodicity)}`;

        return this._translateService.stream(`timeFrameToStr.${key}`);
    }
}
