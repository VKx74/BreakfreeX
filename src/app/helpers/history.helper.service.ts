import {IPeriodicity} from "../models/common/periodicity";
import {IBarData} from "../models/common/barData";
import {IHistoryRequest} from "../models/common/historyRequest";
import {ITimeFrame} from "../models/common/timeFrame";

export class HistoryHelperService {
    public static getGranularity(tf: ITimeFrame): number {
        switch (tf.periodicity) {
            case IPeriodicity.minute:
                return 60 * tf.interval;
            case IPeriodicity.hour:
                return 3600 * tf.interval;
            case IPeriodicity.day:
                return 86400;
            case IPeriodicity.week:
                return 604800;
            case IPeriodicity.month:
                return 2629746;
            case IPeriodicity.year:
                return 86400;
        }
    }

    // combine some lower timeframe into higher because originally some TF is not supported by feed
    public static combineResponse(request: IHistoryRequest, bars: IBarData[]): IBarData[] {
        // if (request.timeFrame.periodicity === IPeriodicity.hour && request.timeFrame.interval === 4) {
        //     return this._combineBars(bars, this._4hComparer.bind(this));
        // }

        // if (request.timeFrame.periodicity === IPeriodicity.week && request.timeFrame.interval === 1) {
        //     return this._combineBars(bars, this._1weekComparer.bind(this));
        // }

        // if (request.timeFrame.periodicity === IPeriodicity.month && request.timeFrame.interval === 1) {
        //     return this._combineBars(bars, this._1monthComparer.bind(this));
        // }

        if (request.timeFrame.periodicity === IPeriodicity.year && request.timeFrame.interval === 1) {
            return this._combineBars(bars, this._1yearComparer.bind(this));
        }

        return bars;
    }

    private static  _combineBars(bars: IBarData[], comparer: (urrentBar: IBarData, prevBar: IBarData) => boolean): IBarData[] {
        const newBarsArray: IBarData[] = [];

        if (bars.length < 2) {
            return newBarsArray;
        }

        let bar: IBarData;

        for (let i = bars.length - 2; i >= 0; i--) {
            const currentBar = bars[i];
            const prevBar = bars[i + 1];

            if (comparer(currentBar, prevBar)) {
                if (bar) {
                    newBarsArray.push(bar);
                }
                bar = {
                    open: currentBar.open,
                    high: currentBar.high,
                    low: currentBar.low,
                    close: currentBar.close,
                    volume: currentBar.volume,
                    date: currentBar.date
                };
            } else {
                if (bar) {
                    bar.close = currentBar.close;
                    bar.volume += currentBar.volume;
                    bar.high = Math.max(bar.high, currentBar.high);
                    bar.low = Math.min(bar.low, currentBar.low);
                }
            }

        }

        if (bar) {
            newBarsArray.push(bar);
        }

        return newBarsArray.reverse();
    }

    private static  _getCombineBarIndex(barsHours: number[], date: Date) {
        const utcHour = moment.utc(date).hours();

        for (let i = 0; i < barsHours.length - 1; i++) {
            if (barsHours[i] <= utcHour && barsHours[i + 1] > utcHour)
                return i;
        }

        return barsHours.length - 1;
    }

    private static _4hComparer(currentBar: IBarData, prevBar: IBarData): boolean {
        const barsStartHours: number[] = [0, 4, 8, 12, 16, 20];
        const currentBarCombineIndex = this._getCombineBarIndex(barsStartHours, currentBar.date);
        const prevBarCombineIndex = this._getCombineBarIndex(barsStartHours, prevBar.date);
        return currentBarCombineIndex !== prevBarCombineIndex;
    }

    private static _1weekComparer(currentBar: IBarData, prevBar: IBarData): boolean {
        return currentBar.date.getDay() >= 1 && (prevBar.date.getDay() === 0 || prevBar.date.getDay() > currentBar.date.getDay());
    }

    private static  _1monthComparer(currentBar: IBarData, prevBar: IBarData): boolean {
        return currentBar.date.getMonth() !== prevBar.date.getMonth();
    }

    private static  _1yearComparer(currentBar: IBarData, prevBar: IBarData): boolean {
        return currentBar.date.getFullYear() !== prevBar.date.getFullYear();
    }

    public static convertPeriodicityForOandaBroker(periodicity: IPeriodicity): string {
        switch (periodicity) {
            case IPeriodicity.minute:
                return 'Minute';
            case IPeriodicity.hour:
                return 'Hour';
            case IPeriodicity.day:
                return 'Day';
            case IPeriodicity.week:
                return 'Weekly';
            case IPeriodicity.month:
                return 'Monthly';
            case IPeriodicity.year:
                return 'Yearly';
        }
    }
}
