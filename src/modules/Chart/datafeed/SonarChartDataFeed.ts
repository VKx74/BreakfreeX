import {DataFeedBase} from './DataFeedBase';
import {Injectable} from "@angular/core";
import {HistoryService} from "../../../app/services/history.service";
import {EExchange} from "../../../app/models/common/exchange";
import {IHistoryResponse} from "../../../app/models/common/historyResponse";
import {IHistoryRequest} from "../../../app/models/common/historyRequest";
import {IPeriodicity} from "../../../app/models/common/periodicity";
import {IInstrument} from "../../../app/models/common/instrument";
import {ITimeFrame} from "../../../app/models/common/timeFrame";
import {TimeZoneManager, UTCTimeZone} from "TimeZones";
import {TzUtils} from "../../TimeZones/utils/TzUtils";
import {JsUtil} from "../../../utils/jsUtil";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EMarketType } from '@app/models/common/marketType';
import { ReplayModeSync } from '@chart/services/replay-mode-sync.service';

@Injectable()
export class SonarChartDataFeed extends DataFeedBase {
    private _endDate: Date;
    
    constructor(protected _timeZoneManager: TimeZoneManager,
                private _historyService: HistoryService) {

        super(_timeZoneManager);
        this._visibleCount = 80;
        this._visibleCountRatio = 0.6; 
        this._refreshOnRequestCompleted = false; 
    }

    /**
     * @inheritDoc
     */
    sendRequest(request: TradingChartDesigner.IBarsRequest) {
        super.sendRequest(request);
        this._sendRequest(request);
    }

    destroy() {
        super.destroy();
    }

    setEndDate(date: Date) {
        this._endDate = date;
    }

    private async _sendRequest(request: TradingChartDesigner.IBarsRequest) {
        const instrument = request.instrument || request.chart.instrument;
        const endDate = this._getRequestEndDate();
        const startDate = this._getRequestStartDate(request, endDate);
        const requestMsg: IHistoryRequest = {
            instrument: await this._mapInstrument(instrument),
            timeFrame: this._mapTimeFrame(request),
            endDate: endDate,
            startDate: startDate,
        };

        this._historyService.getHistory(requestMsg).subscribe((response: IHistoryResponse) => {
            if (!response) {
                this._processResult(response, request, requestMsg.instrument);
            } else {
                if (this.requestBusy(request)) {
                    this._processResult(response, request, requestMsg.instrument);
                }
            }
        }, (error) => {
            this.cancel(request);
            console.error(error);
        });
    }

    private _getRequestEndDate(): Date {
        if (!this._endDate) {
            return new Date();
        }

        return this._endDate;
    }

    private _getRequestStartDate(request: TradingChartDesigner.IBarsRequest, endDate: Date): Date {
        if (ReplayModeSync.IsChartReplay && !ReplayModeSync.IsChartReplayStarted) {
            return new Date(ReplayModeSync.ReplayModeStartTime);
        }

        let count = request.count;
        const timeFrame = request.chart.timeFrame;
        let type = (request.chart.instrument as any).type;

        if (TradingChartDesigner.Periodicity.MINUTE === timeFrame.periodicity && type !== EMarketType.Crypto) {

            let backHistory = 60 * 24 * 2;
            if (count < backHistory)
                count = backHistory;
        }

        const endDateTimestamp = TzUtils.dateTimestamp(endDate, this._timeZoneManager.timeZone);
        const startDateTimestamp = endDateTimestamp - (count * request.chart.timeInterval);
        let startDate = TzUtils.convertDateTz(JsUtil.UTCDate(startDateTimestamp), UTCTimeZone, this._timeZoneManager.timeZone);
        const day = startDate.getDay();
        const oneDayTimeShift = 1000 * 60 * 60 * 24;
        
        if (day === 0) {
            // Sunday
            startDate.setTime(startDate.getTime() - (oneDayTimeShift * 3));
        } else if (day === 6) {
            // Saturday
            startDate.setTime(startDate.getTime() - (oneDayTimeShift * 2));
        }

        return startDate;
    }

    private async _mapInstrument(instrument: TradingChartDesigner.IInstrument): Promise<IInstrument> {
        return {
            baseInstrument: (instrument as any).baseInstrument,
            dependInstrument: (instrument as any).dependInstrument,
            company: instrument.company,
            datafeed: instrument.datafeed as EExchangeInstance,
            exchange: instrument.exchange as EExchange,
            id: instrument.id,
            pricePrecision: (instrument as any).pricePrecision,
            symbol: instrument.symbol,
            tickSize: instrument.tickSize,
            type: (instrument as any).type as EMarketType,
            tickSizeCorrect: (instrument as any).tickSizeCorrect
        };
    }

    private _mapTimeFrame(request: TradingChartDesigner.IBarsRequest): ITimeFrame {
        const timeFrame = request.chart.timeFrame;
        const res: ITimeFrame = {
            periodicity: IPeriodicity.minute,
            interval: timeFrame.interval
        };

        switch (timeFrame.periodicity) {
            case TradingChartDesigner.Periodicity.MINUTE:
                res.periodicity = IPeriodicity.minute; break;
            case TradingChartDesigner.Periodicity.HOUR:
                res.periodicity = IPeriodicity.hour; break;
            case TradingChartDesigner.Periodicity.DAY:
                res.periodicity = IPeriodicity.day; break;
            case TradingChartDesigner.Periodicity.WEEK:
                res.periodicity = IPeriodicity.week; break;
            case TradingChartDesigner.Periodicity.MONTH:
                res.periodicity = IPeriodicity.month; break;
            case TradingChartDesigner.Periodicity.YEAR:
                res.periodicity = IPeriodicity.year; break;
        }

        return res;
    }

    private _processResult(response: IHistoryResponse, request: TradingChartDesigner.IBarsRequest, instrument: IInstrument) {
        const chart = request.chart;
        const isChartMainSeries = !instrument || (instrument.symbol === chart.instrument.symbol && instrument.exchange === chart.instrument.exchange);

        if (isChartMainSeries && response.pricePrecision && !instrument.tickSizeCorrect) {
            chart.instrument.pricePrecision = response.pricePrecision;
            chart.instrument.tickSize = this._buildTickSizeByPricePrecision(response.pricePrecision);
            chart.invokeValueChanged(TradingChartDesigner.ChartEvent.INSTRUMENT_CHANGED);
        }

        this.onRequestCompleted(request, response.data);

        chart.canLoadMoreBars = false;
    }
}
