import {DataFeedBase} from './DataFeedBase';
import {Injectable} from "@angular/core";
import {InstrumentService} from "../../../app/services/instrument.service";
import {RealtimeService} from "../../../app/services/realtime.service";
import {HistoryService} from "../../../app/services/history.service";
import {EExchange} from "../../../app/models/common/exchange";
import {IHistoryResponse} from "../../../app/models/common/historyResponse";
import {IHistoryRequest} from "../../../app/models/common/historyRequest";
import {IPeriodicity} from "../../../app/models/common/periodicity";
import {IInstrument} from "../../../app/models/common/instrument";
import {IBarData} from "../../../app/models/common/barData";
import {ITimeFrame} from "../../../app/models/common/timeFrame";
import {Subscription} from "rxjs";
import {ITick} from "../../../app/models/common/tick";
import {AlertService} from "../../Alert/services/alert.service";
import {TimeZoneManager, UTCTimeZone} from "TimeZones";
import {TzUtils} from "../../TimeZones/utils/TzUtils";
import {JsUtil} from "../../../utils/jsUtil";
import {TranslateService} from "@ngx-translate/core";
import {map} from "rxjs/operators";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EMarketType } from '@app/models/common/marketType';
import { ReplayModeSync } from '@chart/services/replay-mode-sync.service';

@Injectable()
export class DataFeed extends DataFeedBase {
    private _subscriptions: { [instrumentHash: string]: Subscription } = {};

    constructor(private _instrumentService: InstrumentService,
                private _realtimeService: RealtimeService,
                private _alertService: AlertService,
                private _translateService: TranslateService,
                protected _timeZoneManager: TimeZoneManager,
                private _historyService: HistoryService) {

        super(_timeZoneManager);
        const self = this;
        // TradingChartDesigner.getAllInstruments = () => {
        //     return self._instrumentService.getInstruments(EExchange.any).toPromise();
        // };
    }

    init(loadInstruments: boolean = true): Promise<DataFeedBase> {
        const self = this;

        return new Promise<DataFeedBase>(function (resolve, reject) {
            if (loadInstruments) {
                self._instrumentService.getInstruments().subscribe((instruments: IInstrument[]) => {
                    self.instruments = instruments;
                    resolve(self);
                });
            } else {
                resolve(self);
            }
        });
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
        for (let i in this._subscriptions) {
            if (this._subscriptions.hasOwnProperty(i)) {
                this._subscriptions[i].unsubscribe();
            }
        }

        this._subscriptions = {};
    }

    private async _sendRequest(request: TradingChartDesigner.IBarsRequest) {
        const instrument = request.instrument || request.chart.instrument;
        const endDate = this._getRequestEndDate(request);
        const startDate = this._getRequestStartDate(request, endDate);
        const requestMsg: IHistoryRequest = {
            instrument: await this._mapInstrument(instrument),
            timeFrame: this._mapTimeFrame(request),
            endDate: endDate,
            startDate: startDate,
        };

        if (!requestMsg.instrument) {
            this._alertService.error(this._translateService.get('unableFindSymbol')
                .pipe(map((value: string) => {
                    return value + instrument.symbol;
                })),
                this._translateService.get('dataFeed'));
            return;
        }

        if (!requestMsg.timeFrame) {
            this._alertService.error(this._translateService.get('unableLoadDataByTimeFrame'), this._translateService.get('dataFeed'));
            return;
        }

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
            this._alertService.error(this._translateService.get('unableLoadData'), this._translateService.get('dataFeed'));
        });
    }

    private _getRequestEndDate(request: TradingChartDesigner.IBarsRequest): Date {
        const timeFrame = request.chart.timeFrame;
        let goForward = TradingChartDesigner.Periodicity.MINUTE === timeFrame.periodicity ? 1 : 1;
        return request.endDate
            ? request.endDate
            : TzUtils.convertDateTz(JsUtil.UTCDate(new Date(Date.now() + (1000 * 60 * 60 * goForward))), UTCTimeZone, this._timeZoneManager.timeZone);
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
        // for (let i = 0; i < this.instruments.length; i++) {
        //     if (this.instruments[i].symbol === instrument.symbol && this.instruments[i].exchange === instrument.exchange) {
        //         return this.instruments[i];
        //     }
        // }

        // const instruments = await this._instrumentService.getInstruments(instrument.datafeed as EExchangeInstance, instrument.symbol).toPromise();
        // for (let i = 0; i < instruments.length; i++) {
        //     if (instruments[i].symbol === instrument.symbol && instruments[i].exchange === instrument.exchange) {
        //         return instruments[i];
        //     }
        // }

        // return null;
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
        this._subscribeToRealtime(instrument, request.chart);
    }

    protected _buildTickSizeByPricePrecision(pricePrecision: number) {
        let tickSize = "0.";
        for (let i = 0; i < pricePrecision - 1; i++) {
            tickSize += "0";
        }
        tickSize += "1";
        return Number.parseFloat(tickSize);
    }

    private _subscribeToRealtime(instrument: IInstrument, chart: TradingChartDesigner.Chart) {
        const instrumentHash = instrument.symbol + instrument.exchange;

        if (this._subscriptions[instrumentHash]) {
           return;
        }

        this._subscriptions[instrumentHash] = this._realtimeService.subscribeToTicks(instrument, async (tick: ITick) => {
            const tickInstrument = tick.instrument;
            const unsubscribeNeeded = await this._checkSubscriptionNeeded(tickInstrument, chart);
            if (unsubscribeNeeded) {
                this._processTick(tick, chart);
            } else {
                this._unsubscribeFromRealtime(tickInstrument);
            }
        });
    }

    private async _checkSubscriptionNeeded(instrument: IInstrument, chart: TradingChartDesigner.Chart): Promise<boolean> {
        const chartInstrument = await this._mapInstrument(chart.instrument);

        // main chart.json symbol need this subscription
        if (chartInstrument.symbol === instrument.symbol && chartInstrument.exchange === instrument.exchange) {
            return true;
        }

        // check comparision symbols
        const comparisionManagers = chart.handlerInstrumentComparison.instrumentsCompare;
        for (let i = 0; i < comparisionManagers.length; i++) {
            const comparisionManager = comparisionManagers[i];
            const compareInstrument = await this._mapInstrument(comparisionManager.instrument);
            if (compareInstrument.symbol === instrument.symbol && compareInstrument.exchange === instrument.exchange) {
                return true;
            }
        }

        // subscription not needed more
        return false;
    }

    private _unsubscribeFromRealtime(instrument: IInstrument): void {
        const instrumentHash = instrument.symbol + instrument.exchange;

        if (this._subscriptions[instrumentHash]) {
            this._subscriptions[instrumentHash].unsubscribe();
            delete this._subscriptions[instrumentHash];
        }
    }
}
