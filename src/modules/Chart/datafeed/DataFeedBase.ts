import IBar = TradingChartDesigner.IBar;
import Environment = TradingChartDesigner.UserAgent;
import IRequest = TradingChartDesigner.IRequest;
import IBarsRequest = TradingChartDesigner.IBarsRequest;
import Dictionary = TradingChartDesigner.Dictionary;
import IDatafeedBase = TradingChartDesigner.IDatafeedBase;
import { RequestKind } from "./models";
import { IInstrument } from "../../../app/models/common/instrument";
import { ITick } from "../../../app/models/common/tick";
import { TimeZoneManager } from "TimeZones";
import { ITimeFrame } from "@app/models/common/timeFrame";
import { IPeriodicity } from "@app/models/common/periodicity";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { EExchange } from '@app/models/common/exchange';
import { EMarketType } from '@app/models/common/marketType';

export abstract class DataFeedBase implements IDatafeedBase {
    static DefaultInstrument: IInstrument = {
        baseInstrument: "EUR",
        company: "EUR vs USD",
        datafeed: EExchangeInstance.OandaExchange,
        dependInstrument: "USD",
        exchange: EExchange.Oanda,
        id: "EUR_USD",
        pricePrecision: 5,
        symbol: "EURUSD",
        tickSize: 0.00001,
        tradable: false,
        type: EMarketType.Forex
    };

    static DefaultTimeframe = { periodicity: '', interval: 1 };

    static MAX_BARS_PER_CHART = 332;

    static supportedTimeFramesStr: string[] = ['1 Minute', '5 Minutes', '15 Minutes', '30 Minutes', '1 Hour', '2 Hours', '4 Hours', '12 Hours', '1 Day', '1 Week'];
    static supportedTimeFrames: ITimeFrame[] = [

        {
            interval: 1,
            periodicity: IPeriodicity.minute
        },
        {
            interval: 5,
            periodicity: IPeriodicity.minute
        },
        {
            interval: 15,
            periodicity: IPeriodicity.minute
        },
        {
            interval: 1,
            periodicity: IPeriodicity.hour
        },
        {
            interval: 4,
            periodicity: IPeriodicity.hour
        },
        {
            interval: 1,
            periodicity: IPeriodicity.day
        },
        {
            interval: 1,
            periodicity: IPeriodicity.week
        }
    ];

    private static _requestId = 0;

    protected _visibleCount = 200;
    protected _visibleCountRatio = 0.4;
    protected _refreshOnRequestCompleted = true;

    private _requests = new Dictionary<number, IRequest>();

    private _interval: any;

    public instruments: IInstrument[] = [];

    public chartForRefresh: TradingChartDesigner.Chart[] = [];


    constructor(protected _timeZoneManager: TimeZoneManager) {
        this._interval = setInterval(() => {
            try {
                for (let i = 0; i < this.chartForRefresh.length; i++) {
                    const c = this.chartForRefresh[i];
                    if (!c.isDestroyed) {
                        c.invokeValueChanged(TradingChartDesigner.ChartEvent.LAST_BAR_UPDATED, this._getLastBar(c));
                        c.refreshAsync();
                    }
                }
            } catch (e) {
            }
            this.chartForRefresh = [];
        }, 2000);
    }

    /**
     * Generates next unique request identifier.
     * @method nextRequestId
     * @returns {number}
     * @memberOf TradingChartDesigner.Datafeed#
     */
    static nextRequestId(): number {
        return ++this._requestId;
    }

    /**
     * Executes request post cancel actions (e.g. hides waiting bar).
     * @method onRequstCanceled
     * @memberOf TradingChartDesigner.Datafeed#
     * @protected
     */
    protected onRequstCanceled(request: IRequest) {
        if (this._requests.count === 0) {
            request.chart.hideWaiting();
        }
    }

    /**
     * Executes request post complete actions (e.g. hides waiting bar, updates indicators, refreshes chart.json).
     * @method onRequestCompleted
     * @memberOf TradingChartDesigner.Datafeed#
     * @protected
     */
    protected onRequestCompleted(request: IBarsRequest, bars: IBar[]) {
        const chart = request.chart;
        const dataManager = chart.dataContext;
        const oldFirstVisibleRecord = chart.firstVisibleRecord;
        const oldLastVisibleRecord = chart.lastVisibleRecord;
        const oldPrimaryBarsCount = request.name === RequestKind.MORE_BARS ? chart.primaryBarDataRows().low.length : 0;
        const instrument = request.instrument;

        const isChartMainSeries = !instrument || (instrument.symbol === chart.instrument.symbol && instrument.exchange === chart.instrument.exchange);

        let barsSet = false;
        switch (request.name) {
            case RequestKind.BARS:
                dataManager.clearBarDataRows(instrument);
                dataManager.appendInstrumentBars(instrument, bars.slice(Math.max(bars.length - DataFeedBase.MAX_BARS_PER_CHART, 0)));
                barsSet = true;
                if (isChartMainSeries) {
                    if (chart.recordsCount >= DataFeedBase.MAX_BARS_PER_CHART) {
                        chart.canLoadMoreBars = false;
                    } else {
                        chart.canLoadMoreBars = true;
                    }
                }
                break;
            case RequestKind.MORE_BARS:
                const firstBarTime = (dataManager.barDataRows().date.firstValue as Date).getTime();
                bars = bars.filter((bar) => bar.date.getTime() < firstBarTime);

                if (bars.length) {
                    dataManager.insertInstrumentBars(instrument, 0, bars);
                    chart.invokeValueChanged(TradingChartDesigner.ChartEvent.BARS_INSERTED, bars);
                    if (chart.recordsCount >= DataFeedBase.MAX_BARS_PER_CHART) {
                        chart.canLoadMoreBars = false;
                    }
                } else {
                    if (!instrument || instrument.symbol === chart.instrument.symbol) {
                        chart.canLoadMoreBars = false;
                    }
                }
                break;
            default:
                throw new Error(`Unknown request kind: ${request.name}`);
        }

        if (this._refreshOnRequestCompleted) {
            chart.refresh(true);
        }

        let barsCount = chart.primaryBarDataRows().low.length - oldPrimaryBarsCount;
        if (instrument) {
            barsCount = Math.round(chart.lastVisibleIndex - chart.firstVisibleIndex);
        }

        if (request.name === RequestKind.BARS) {
            let visibleCount = this._visibleCount;
            if (barsCount < visibleCount) {
                visibleCount = barsCount;
            }
            if (barsCount > 0) {
                chart.firstVisibleRecord = barsCount - visibleCount;
                chart.lastVisibleRecord = barsCount + (visibleCount * this._visibleCountRatio);
            }
        } else if (request.name === RequestKind.MORE_BARS && !instrument) {
            chart.firstVisibleRecord = barsCount < 0 ? 0 : oldFirstVisibleRecord + barsCount;
            chart.lastVisibleRecord = oldLastVisibleRecord + Math.abs(barsCount);
        }
        this._requests.remove(request.requestNumber);

        chart.hideWaiting();

        if (this._refreshOnRequestCompleted) {
            chart.refreshIndicators();
            if (request.name === RequestKind.BARS) {
                chart.refreshAsync(true);
            } else {
                chart.refreshAsync(chart.primaryPane.moveName === "autoscaled");
            }
        }

        chart.scaleHorizontal.onCompleteMoreHistoryRequest();

        if (barsSet) {
            setTimeout(() => {
                chart.invokeValueChanged(TradingChartDesigner.ChartEvent.BARS_SETTED, bars);
            }, 1);
        }
    }

    protected _processTick(tick: ITick, chart: TradingChartDesigner.Chart) {
        const isInReplayMode = chart.replayMode.isInPlayMode;
        const lastBar = this._getLastBar(chart);
        let currentBarStartTimestamp,
            nextBarStartTimestamp;

        if (lastBar) {
            currentBarStartTimestamp = lastBar.date.getTime();
            nextBarStartTimestamp = currentBarStartTimestamp + chart.timeInterval;
        } else {
            return;
        }

        if (tick.time < currentBarStartTimestamp) {
            return;
        }

        if (tick.time >= nextBarStartTimestamp) {
            while (tick.time >= nextBarStartTimestamp + chart.timeInterval) {
                nextBarStartTimestamp += chart.timeInterval;
            }

            const bar = {
                open: tick.price,
                high: tick.price,
                low: tick.price,
                close: tick.price,
                volume: tick.volume,
                date: new Date(nextBarStartTimestamp)
            };

            if (isInReplayMode) {
                this._addToReplayModeRow(bar, chart, tick.instrument);
            } else {
                this._appendBars(bar, chart, tick.instrument);

                chart.scaleHorizontal.applyAutoScroll(TradingChartDesigner.BarsUpdateName.NEW_BAR);
                chart.refreshAsync();
            }
        } else {
            lastBar.close = tick.price;
            lastBar.volume += tick.volume;
            lastBar.high = Math.max(tick.price, lastBar.high);
            lastBar.low = Math.min(tick.price, lastBar.low);

            if (isInReplayMode) {
                this._updateReplayModeRow(lastBar, chart, tick.instrument);
            } else {
                this._updateLastBar(lastBar, chart, tick.instrument);
            }

            // chart.invokeValueChanged(TradingChartDesigner.ChartEvent.LAST_BAR_UPDATED, lastBar);
            // chart.refreshAsync();
        }
    }

    // region IDatafeed members

    init(...params): Promise<any> {
        return Promise.resolve();
    }

    /**
     * Sends request to the datafeed provider.
     * @method send
     * @param {TradingChartDesigner~Request} request The processing request.
     * @memberOf TradingChartDesigner.Datafeed#
     */
    sendRequest(request: IRequest) {
        this._requests.add(request.requestNumber, request);
        if (request.name === RequestKind.BARS) {
            if (!request.chart.isRestrictedMode) {
                request.chart.showWaitingBar();
            }
        }
    }

    /**
     * Cancels request processing.
     * @method cancel
     * @param {TradingChartDesigner~Request} request The cancelling request.
     * @memberOf TradingChartDesigner.Datafeed#
     */
    cancel(request: IRequest) {
        this._requests.remove(request.requestNumber);
        this.onRequstCanceled(request);
    }

    /**
     * Destroy request.
     * @method destroy
     * @param {TradingChartDesigner~Request}.
     * @memberOf TradingChartDesigner.Datafeed#
     */
    destroy() {
        this._requests.clear();
        if (this._interval) {
            clearInterval(this._interval);
        }
        this.chartForRefresh = [];
    }

    // endregion


    /**
     * Determines whether request is alive.
     * @method isRequestAlive
     * @param {TradingChartDesigner~Request} request The request.
     * @memberof TradingChartDesigner.Datafeed#
     * @returns {boolean} True if request is alive, otherwise false.
     */
    requestBusy(request: IRequest): boolean {
        return this._requests.containsKey(request.requestNumber);
    }

    protected _buildTickSizeByPricePrecision(pricePrecision: number) {
        let tickSize = "0.";
        for (let i = 0; i < pricePrecision - 1; i++) {
            tickSize += "0";
        }
        tickSize += "1";
        return Number.parseFloat(tickSize);
    }

    private _getLastBar(chart: TradingChartDesigner.Chart): TradingChartDesigner.IBar {
        const isInReplayMode = chart.replayMode.isInPlayMode;
        const chartData = chart.barDataRows();
        if (isInReplayMode) {
            return chart.replayMode.getLastOriginBar();
        } else {
            if (chartData.open.values.length === 0) {
                return null;
            }

            return {
                open: <number>chartData.open.lastValue,
                high: <number>chartData.high.lastValue,
                low: <number>chartData.low.lastValue,
                close: <number>chartData.close.lastValue,
                volume: <number>chartData.volume.lastValue,
                date: <Date>chartData.date.lastValue
            };
        }
    }

    private _appendBars(bar: TradingChartDesigner.IBar, chart: TradingChartDesigner.Chart, instrument: IInstrument): void {
        const isChartMainSeries = instrument.symbol === chart.instrument.symbol && instrument.exchange === chart.instrument.exchange;

        if (isChartMainSeries) {
            chart.appendBars(bar);
            chart.scaleHorizontal.applyAutoScroll(TradingChartDesigner.BarsUpdateName.NEW_BAR);
        }
        const dataRow = chart.dataContext.barDataRows(instrument.symbol);
        if (dataRow.date) {
            chart.dataContext.appendInstrumentBars(instrument, bar);
        }
    }

    private _updateLastBar(bar: TradingChartDesigner.IBar, chart: TradingChartDesigner.Chart, instrument: IInstrument): void {
        const isChartMainSeries = instrument.symbol === chart.instrument.symbol && instrument.exchange === chart.instrument.exchange;

        if (isChartMainSeries) {
            this._updateDataRowLastRecord(chart.barDataRows(), bar);
        }

        const dataRow = chart.dataContext.barDataRows(instrument.symbol);
        if (dataRow.date) {
            this._updateDataRowLastRecord(dataRow, bar);
        }

        this._addChartToRefresh(chart);
    }

    private _addChartToRefresh(chart: TradingChartDesigner.Chart) {
        if (chart.isDestroyed)
            return;

        for (let i = 0; i < this.chartForRefresh.length; i++) {
            if (this.chartForRefresh[i] === chart) {
                return;
            }
        }

        this.chartForRefresh.push(chart);
    }

    private _updateDataRowLastRecord(dataRow: TradingChartDesigner.IBarDataRows, bar: TradingChartDesigner.IBar) {
        dataRow.open.updateLast(bar.open);
        dataRow.high.updateLast(bar.high);
        dataRow.low.updateLast(bar.low);
        dataRow.close.updateLast(bar.close);
        dataRow.volume.updateLast(bar.volume);
        dataRow.date.updateLast(bar.date);
    }

    private _addToReplayModeRow(bar: TradingChartDesigner.IBar, chart: TradingChartDesigner.Chart, instrument: IInstrument): void {
        const isChartMainSeries = instrument.symbol === chart.instrument.symbol && instrument.exchange === chart.instrument.exchange;
        const orDataRows = chart.replayMode.originDataRows;
        if (orDataRows[TradingChartDesigner.DataRowsMarker.DATE] && isChartMainSeries) {
            chart.replayMode.addValueToRow(bar);
        }

        if (orDataRows[instrument.symbol + TradingChartDesigner.DataRowsMarker.DATE]) {
            chart.replayMode.addValueToRow(bar, instrument);
        }
    }

    private _updateReplayModeRow(bar: TradingChartDesigner.IBar, chart: TradingChartDesigner.Chart, instrument: IInstrument): void {
        const isChartMainSeries = instrument.symbol === chart.instrument.symbol && instrument.exchange === chart.instrument.exchange;
        const orDataRows = chart.replayMode.originDataRows;
        if (orDataRows[TradingChartDesigner.DataRowsMarker.DATE] && isChartMainSeries) {
            chart.replayMode.updateLastValue(bar);
        }

        if (orDataRows[instrument.symbol + TradingChartDesigner.DataRowsMarker.DATE]) {
            chart.replayMode.updateLastValue(bar, instrument);
        }
    }
}

