import { Component, EventEmitter, Input, Output, Injector, Inject, ChangeDetectorRef } from '@angular/core';
import { BreakfreeTradingBacktestService } from 'modules/BreakfreeTrading/services/breakfreeTradingBacktest.service';
import { IInstrument } from '@app/models/common/instrument';
import { IBFTAOrder, IBFTScannerBacktestAlgoParameters, IBFTAScannerBacktestResponse, IBFTAScannerSignal, IBFTAValidationData, ITimeFrame } from '@app/services/algo.service';
import { AlertService } from '@alert/services/alert.service';
import { of } from 'rxjs';
import { InstrumentService } from '@app/services/instrument.service';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';

enum BacktestInstruments {
    ChartInstrument, ForexMajor, ForexMinors, ForexExotics, Indices, Commodities, Metals, Bonds
}

interface BacktestPerformance {
    SignalsCount: string;
    OrdersCount: string;
    WinTradeCount: string;
    LossTradeCount: string;
    WinLossRatio: string;
}

interface BacktestResult {
    response: IBFTAScannerBacktestResponse;
    instrument: IInstrument;
    timeFrame: ITimeFrame;
    performance: BacktestPerformance;
}

@Component({
    selector: 'ScannerStrategyBacktest',
    templateUrl: './scannerModeBacktest.component.html',
    styleUrls: ['./scannerModeBacktest.component.scss']
})
export class ScannerStrategyBacktestComponent {
    BacktestInstruments = BacktestInstruments;
    private _csvResult: string;

    @Input()
    public SelectedChart: TradingChartDesigner.Chart;
    @Output()
    public Processing = new EventEmitter<boolean>();
    @Output()
    public ClearData = new EventEmitter();

    public backtestResult: BacktestResult[] = [];
    public availableType: string[] = ["EXT", "SwingN", "SwingExt", "BRC"];
    public availableRTDType: string[] = ["Daily", "Hourly", "Same"];
    public backtestInstruments: BacktestInstruments[] = [BacktestInstruments.ChartInstrument, BacktestInstruments.ForexMajor, BacktestInstruments.ForexMinors, BacktestInstruments.ForexExotics, BacktestInstruments.Indices, BacktestInstruments.Commodities, BacktestInstruments.Metals, BacktestInstruments.Bonds];
    public backtestTimeFrames: ITimeFrame[] = [
        { periodicity: "", interval: 15 },
        { periodicity: "h", interval: 1 },
        { periodicity: "h", interval: 4 },
        { periodicity: "d", interval: 1 },
    ];

    public barsCount: number = 3000;
    public slRatio: number = 1.7;
    public maxCount: number = 100;
    public breakevenCandles: number = 0;
    public cancellationCandles: number = 10;
    public global_fast: number = 0.25;
    public global_slow: number = 0.05;
    public local_fast: number = 1.2;
    public local_slow: number = 0.6;
    public min_threshold: number = 0.5;
    public validation_url: string = "";
    public singlePosition: boolean = false;
    public type: string = this.availableType[0];
    public backtestInstrument: BacktestInstruments = BacktestInstruments.ChartInstrument;
    public backtestTimeFrame: ITimeFrame = this.backtestTimeFrames[0];
    public rtd_timeframe: string = this.availableRTDType[0];

    public Status: string = "-";
    public BacktestPerformance: BacktestPerformance;

    constructor(private _alertService: AlertService, protected _bftService: BreakfreeTradingBacktestService, protected _instrumentService: InstrumentService, protected _cdr: ChangeDetectorRef) {
        this.BacktestPerformance = {
            SignalsCount: "",
            OrdersCount: "",
            WinTradeCount: "",
            LossTradeCount: "",
            WinLossRatio: ""
        };
        this.backtestResult = [];
    }

    clear() {
        this.Processing.emit(true);
        this.Status = "-";
        this.BacktestPerformance = {
            SignalsCount: "",
            OrdersCount: "",
            WinTradeCount: "",
            LossTradeCount: "",
            WinLossRatio: ""
        };
        this.backtestResult = [];
        this.ClearData.emit();
        this.Processing.emit(false);
    }

    backtestInstrumentCaption = (option: BacktestInstruments) => {
        let specific = this.backtestInstrumentSpecific(option);
        return of(specific);
    }

    backtestTimeFrameCaption = (option: ITimeFrame) => {
        if (option.periodicity === "d") {
            return of(`${option.interval} day(s)`);
        }
        if (option.periodicity === "h") {
            return of(`${option.interval} hour(s)`);
        }
        return of(`${option.interval} minute(s)`);
    }

    backtestInstrumentSpecific(option: BacktestInstruments) {
        switch (option) {
            case BacktestInstruments.ChartInstrument: return "Selected Chart";
            case BacktestInstruments.Bonds: return "Bonds";
            case BacktestInstruments.Commodities: return "Commodities";
            case BacktestInstruments.ForexExotics: return "Forex Exotics";
            case BacktestInstruments.ForexMajor: return "Forex Major";
            case BacktestInstruments.ForexMinors: return "Forex Minor";
            case BacktestInstruments.Indices: return "Indices";
            case BacktestInstruments.Metals: return "Metals";
        }
    }

    async getInstruments(): Promise<IInstrument[]> {
        if (this.backtestInstrument === BacktestInstruments.ChartInstrument) {
            let chart = this.SelectedChart;
            return [chart.instrument as IInstrument];
        }

        return new Promise<IInstrument[]>((resolve, reject) => {
            this._instrumentService.getInstruments(EExchangeInstance.OandaExchange).subscribe((instruments) => {
                let result = [];
                let specific = this.backtestInstrumentSpecific(this.backtestInstrument);
                for (let instrument of instruments) {
                    if (instrument.specific === specific) {
                        result.push(instrument);
                    }
                }
                resolve(result);
            });
        });
    }

    getTimeframe(): ITimeFrame {
        if (this.backtestInstrument === BacktestInstruments.ChartInstrument) {
            let chart = this.SelectedChart;
            return chart.timeFrame;
        }

        return this.backtestTimeFrame;
    }

    async backtest() {
        this.clear();

        let instruments = await this.getInstruments();
        let timeframe = this.getTimeframe();

        this.Status = "Calculating...";
        this.Processing.emit(true);

        let result: BacktestResult[] = [];
        let signals: IBFTAScannerSignal[] = [];
        let orders: IBFTAOrder[] = [];
        let index = 0;
        for (let instrument of instruments) {
            this.Status = `Calculating ${instrument.symbol}, ${index}/${instruments.length}`;
            index++;

            this._cdr.detectChanges();

            let backtestParameters: IBFTScannerBacktestAlgoParameters = {
                input_accountsize: 1000,
                account_currency: "USD",
                input_risk: 3.5,
                input_splitpositions: 1,
                replay_back: this.barsCount,
                input_stoplossratio: this.slRatio,
                instrument: instrument,
                timeframe: timeframe,
                breakeven_candles: this.breakevenCandles,
                time: new Date().getTime(),
                timenow: new Date().getTime(),
                cancellation_candles: this.cancellationCandles,
                single_position: this.singlePosition,
                type: this.type,
                rtd_timeframe: this.rtd_timeframe,
                global_fast: this.global_fast,
                global_slow: this.global_slow,
                local_fast: this.local_fast,
                local_slow: this.local_slow,
                min_threshold: this.min_threshold,
                validation_url: this.validation_url
            };

            if (!this.validateInputParameters(backtestParameters)) {
                continue;
            }

            let backtestResults: IBFTAScannerBacktestResponse;
            try {
                backtestResults = await this._bftService.backtestScanner(backtestParameters);
                result.push({
                    response: backtestResults,
                    instrument: instrument,
                    timeFrame: timeframe,
                    performance: this.infoDateCalculation(backtestResults.signals, backtestResults.orders)
                });
                signals.push(...backtestResults.signals);
                orders.push(...backtestResults.orders);
            } catch (error) {
                this._alertService.error("Failed to calculate backtest");
                this.Processing.emit(false);
            }
        }

        this.BacktestPerformance = this.infoDateCalculation(signals, orders);
        this.Status = "Done";
        this.backtestResult = result;
        this.Processing.emit(false);
        this._alertService.success("Completed");
    }

    visualize(result: BacktestResult) {
        setTimeout(() => {
            this.ClearData.emit();
        }, 1);

        setTimeout(() => {
            this.changeInstrument(result);
        }, 100);
    }

    export() {
        // this._csvResult = this.generateOrderDataCSV(backtestResults);
        let pom = document.createElement('a');
        let csvContent = this._csvResult;
        let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        let url = URL.createObjectURL(blob);
        pom.href = url;
        pom.setAttribute('download', 'backtest_result.csv');
        pom.click();
        pom.remove();
    }

    private changeInstrument(result: BacktestResult) {
        let chart = this.SelectedChart;
        let selectedInterval = TradingChartDesigner.TimeFrame.timeFrameInterval(result.timeFrame);
        if (chart.instrument.symbol === result.instrument.symbol && chart.timeInterval === selectedInterval) {
            this.plotSignals(result);
            return;
        }

        chart.switchOffReplayMode();
        chart.refresh();
        chart.refreshIndicators();

        chart.instrument = Object.assign({}, result.instrument);
        chart.timeFrame = TradingChartDesigner.TimeFrame.intervalTimeFrame(selectedInterval);
        chart.sendBarsRequest();

        let interval = setInterval(() => {
            if (chart.instrument.symbol === result.instrument.symbol) {
                clearInterval(interval);
                this.plotSignals(result);
            }
        }, 1000);
    }

    private plotSignals(result: BacktestResult) {
        let chart = this.SelectedChart;
        let backtestResults = result.response;
        let pricePrecision = result.instrument.pricePrecision;
        let lastCandleDate = chart.dataContext.dataRows[".date"].lastValue as Date;

        this.Status = "Grouping orders...";

        let groupedOrders = this.groupOrders(backtestResults.orders);
        let shapes = [];
        let start = 0;

        if (this.maxCount < 0) {
            this.maxCount = 0;
        }
        if (backtestResults.signals.length > this.maxCount) {
            start = backtestResults.signals.length - this.maxCount;
        }

        this.Status = "Visualization...";

        for (let i = start; i < backtestResults.signals.length; i++) {
            let percent = (i - start) / (backtestResults.signals.length - start) * 100;
            this.Status = `Visualization ${percent.toFixed(2)}% ...`;

            let signal = backtestResults.signals[i];
            let signalNext = backtestResults.signals[i + 1];
            let startDate = new Date(signal.timestamp * 1000);
            let endDate = signalNext ? new Date(signalNext.timestamp * 1000) : lastCandleDate;
            if (signal.end_timestamp) {
                endDate = new Date(signal.end_timestamp * 1000);
            }

            // let lineEntry = this.generateLine(startDate, endDate, signal.data.algo_Entry, "#629320");
            // let isUpTrend = signal.data.daily_trend == IBFTATrend.Up && signal.data.hourly_trend != IBFTATrend.Down;
            // let isDownTrend = signal.data.daily_trend == IBFTATrend.Down && signal.data.hourly_trend != IBFTATrend.Up;

            let backColor = this.calculateProfitabilityColor(signal.timestamp, groupedOrders);
            let trade = signal.data.trade;
            let backArea = this.generateRect(startDate, endDate, trade.entry_h, trade.stop, backColor);
            shapes.push(backArea);

            // if (isDownTrend) {
            //     let lineTopExt2 = this.generateLine(startDate, endDate, signal.data.top_ex2, "#2e5e9a");
            //     let lineTopExt1 = this.generateLine(startDate, endDate, signal.data.top_ex1, "#2e5e9a");
            //     let lineResistance = this.generateLine(startDate, endDate, signal.data.r, "#2e5e9a");
            //     shapes.push(lineTopExt2);
            //     shapes.push(lineTopExt1);
            //     shapes.push(lineResistance);
            // }

            // if (isUpTrend) {
            //     let lineBottomExt2 = this.generateLine(startDate, endDate, signal.data.bottom_ex2, "#d3bb42");
            //     let lineBottomExt1 = this.generateLine(startDate, endDate, signal.data.bottom_ex1, "#d3bb42");
            //     let lineSupport = this.generateLine(startDate, endDate, signal.data.s, "#d3bb42");
            //     shapes.push(lineBottomExt2);
            //     shapes.push(lineBottomExt1);
            //     shapes.push(lineSupport);
            // }

            let limitLine1 = this.generateLine(startDate, endDate, trade.take_profit, "#22FF22", 1);
            shapes.push(limitLine1);
            let limitLine2 = this.generateLine(startDate, endDate, trade.take_profit_h, "#22FF22", 1);
            shapes.push(limitLine2);
            let limitLine3 = this.generateLine(startDate, endDate, trade.take_profit_l, "#22FF22", 1);
            shapes.push(limitLine3);

            let stopLine = this.generateLine(startDate, endDate, trade.stop, "#d3bb42", 1);
            shapes.push(stopLine);

            let entryLine1 = this.generateLine(startDate, endDate, trade.entry, "#2e5e9a", 1);
            shapes.push(entryLine1);
            let entryLine2 = this.generateLine(startDate, endDate, trade.entry_h, "#2e5e9a", 1);
            shapes.push(entryLine2);
            let entryLine3 = this.generateLine(startDate, endDate, trade.entry_l, "#2e5e9a", 1);
            shapes.push(entryLine3);

            let description = this.getDescription(signal.timestamp, groupedOrders, pricePrecision);
            let validationData = this.getValidationByTimestamp(signal.timestamp, backtestResults.validation_data);
            description += "\n----------- \n";
            description += `Trend: ${signal.data.trade.trend};`;
            description += "\n----------- \n";
            description += `Good Trade: ${validationData.good_trade} \n`;
            description += `Bad Trade: ${validationData.bad_trade} \n`;


            backArea.tooltip.text = description;
        }

        chart.primaryPane.addShapes(shapes);
        chart.refreshAsync();
        chart.commandController.clearCommands();
        this.Status = "Done";
        this._alertService.success("Completed");
    }

    private validateInputParameters(params: IBFTScannerBacktestAlgoParameters): boolean {
        if (!params.replay_back || params.replay_back < 100 || params.replay_back > 10000) {
            this._alertService.error("Bars count incorrect. Min 100 Max 10000.");
            return false;
        }
        if (!params.input_stoplossratio || params.input_stoplossratio < 0.1 || params.input_stoplossratio > 100) {
            this._alertService.error("Risk ratio incorrect. Min 0.1 Max 100.0");
            return false;
        }
        if (params.breakeven_candles === undefined || params.breakeven_candles < 0) {
            this._alertService.error("Breakeven candles cant be less than 0.");
            return false;
        }
        if (params.cancellation_candles === undefined || params.cancellation_candles < 0) {
            this._alertService.error("Cancellation candles cant be less than 0.");
            return false;
        }
        if (params.global_fast <= 0) {
            this._alertService.error("Global Fast must be greater than 0.");
            return false;
        }
        if (params.global_slow <= 0) {
            this._alertService.error("Global Slow must be greater than 0.");
            return false;
        }
        if (params.local_fast <= 0) {
            this._alertService.error("Local Fast must be greater than 0.");
            return false;
        }
        if (params.local_slow <= 0) {
            this._alertService.error("Local Slow must be greater than 0.");
            return false;
        }

        return true;
    }

    private infoDateCalculation(signals: IBFTAScannerSignal[], orders: IBFTAOrder[]): BacktestPerformance {
        let winTradeCount = this.winTradeCount(orders);
        let lossTradeCount = this.loosTradeCount(orders);
        let winPerformance = this.winPerformance(orders);
        let lossPerformance = this.lossPerformance(orders);


        let total = (Math.abs(winPerformance) + Math.abs(lossPerformance));
        let winRatio = Math.abs(winPerformance) / total * 100;
        let loosRatio = Math.abs(lossPerformance) / total * 100;
        let winLossRatio = `Win: ${winRatio.toFixed(1)}% - Loss: ${loosRatio.toFixed(1)}%`;

        return {
            WinTradeCount: winTradeCount.toString(),
            LossTradeCount: lossTradeCount.toString(),
            OrdersCount: orders.length.toString(),
            SignalsCount: signals.length.toString(),
            WinLossRatio: winLossRatio
        };
    }

    private winTradeCount(orders: IBFTAOrder[]): number {
        let count = 0;
        for (const order of orders) {
            if (order.pl && order.pl > 0) {
                count++;
            }
        }
        return count;
    }

    private loosTradeCount(orders: IBFTAOrder[]): number {
        let count = 0;
        for (const order of orders) {
            if (order.pl && order.pl < 0) {
                count++;
            }
        }
        return count;
    }

    private winPerformance(orders: IBFTAOrder[]): number {
        let performance = 0;
        for (const order of orders) {
            if (order.pl && order.pl > 0) {
                // performance += order.pl;
                performance++;
            }
        }
        return performance;
    }

    private lossPerformance(orders: IBFTAOrder[]): number {
        let performance = 0;
        for (const order of orders) {
            if (order.pl && order.pl < 0) {
                // performance += order.pl;
                performance++;
            }
        }
        return performance;
    }

    private groupOrders(orders: IBFTAOrder[]): any {
        const res: { [id: string]: IBFTAOrder[]; } = {};

        for (const order of orders) {
            if (!res[order.open_timestamp]) {
                res[order.open_timestamp] = [];
            }

            res[order.open_timestamp].push(order);
        }

        return res;
    }

    private calculateProfitabilityColor(timestamp: number, orders: { [id: string]: IBFTAOrder[]; }): string {
        const neededOrders: IBFTAOrder[] = orders[timestamp] || [];
        let totalPl = 0;
        for (const order of neededOrders) {
            totalPl += order.pl ? order.pl : 0;
        }

        if (totalPl > 0) {
            return "#3d93202f";
        }

        if (totalPl < 0) {
            return "#932b202f";
        }

        return neededOrders.length ? "#d6d6d62f" : "#fcba032f";
    }

    private getDescription(timestamp: number, orders: { [id: string]: IBFTAOrder[]; }, precision: number): string {
        const neededOrders: IBFTAOrder[] = orders[timestamp] || [];
        let description = "";
        let totalPl = 0;
        for (const order of neededOrders) {
            description += `# ${order.side} order (${order.comment || "No comment"}), entry: ${order.price.toFixed(precision)}, sl: ${order.sl_price.toFixed(precision)}, tp: ${order.tp_price.toFixed(precision)}, status - ${order.status}`;

            if (order.pl) {
                description += ` pl: ${order.pl.toFixed(precision)}`;
            }

            description += "\n";

            totalPl += order.pl ? order.pl : 0;
        }

        description += "----------- \n";
        description += `Total PL: ${totalPl.toFixed(precision)}`;

        if (!description) {
            return "No orders";
        }

        return description;
    }

    private generateLine(date1: Date, date2: Date, value: number, color: any, width: number = 2): TradingChartDesigner.ShapeLineSegment {
        const lineSegment = new TradingChartDesigner.ShapeLineSegment();
        lineSegment.visualDataPoints[0].date = date1;
        lineSegment.visualDataPoints[0].value = value;
        lineSegment.appendVisualDataPoint(new TradingChartDesigner.VisualDataPoint());
        lineSegment.visualDataPoints[1].date = date2;
        lineSegment.visualDataPoints[1].value = value;
        lineSegment.locked = true;
        lineSegment.selectable = false;
        lineSegment.hoverable = false;
        lineSegment.savable = false;
        lineSegment.theme = {
            line: {
                width: width,
                strokeColor: color
            }
        };
        lineSegment["is_backtest"] = true;
        return lineSegment;
    }

    private generateRect(date1: Date, date2: Date, value1: number, value2: number, color: any): TradingChartDesigner.ShapeRectangle {
        const rect = new TradingChartDesigner.ShapeRectangle();
        rect.visualDataPoints[0].date = date1;
        rect.visualDataPoints[0].value = value1;
        rect.appendVisualDataPoint(new TradingChartDesigner.VisualDataPoint());
        rect.visualDataPoints[1].date = date2;
        rect.visualDataPoints[1].value = value2;
        rect.locked = true;
        rect.selectable = false;
        rect.hoverable = false;
        rect.savable = false;
        rect.theme = {
            line: {
                width: 0,
                strokeEnabled: false
            },
            fill: {
                fillColor: color
            }
        };
        rect["is_backtest"] = true;
        return rect;
    }

    private _captionText(value: TradingChartDesigner.Chart) {
        const tf = value.timeFrame;
        const instr = value.instrument;
        return `${instr.symbol} - ${instr.exchange} - ${tf.interval}${tf.periodicity || 'min'}`;
    }

    protected generateOrderDataCSV(backtestResults: IBFTAScannerBacktestResponse): string {
        let orders = backtestResults.orders;
        let res = [];
        let count = 1;

        res.push(["#", "Open Time", "Close/Cancel Time", "Chart", "Setup", "Side", "Entry Price", "SL", "TP",
            "SL Ratio", "Breakeven Candles", "Cancellation Candles",
            "Single Position", "Fast Local", "Slow Local", "Local Trend",
            "Fast Global", "Slow Global", "Global Trend", "Order Status", "PNL",
            "RTD Glob Fast", "RTD Glob Slow", "RTD Loc Fast", "RTD Loc Slow", "RTD Glob Sp", "RTD Loc Sp", "RTD Glob Avg Sp(%)", "RTD Loc Avg Sp(%)",
            "EE", "EE1", "EE2", "EE3", "FE", "FE1", "FE2", "FE3", "ZE", "ZE1", "ZE2", "ZE3", "M18", "M28", "P18", "P28", "Good Trade Prob", "Bad Trade Prob"
        ]);

        for (const order of orders) {
            let closeTime = order.close_timestamp;
            let closeTimeString = "-";
            if (!closeTime) {
                closeTime = order.cancel_timestamp;
            }

            if (closeTime) {
                closeTimeString = new Date(closeTime * 1000).toUTCString().replace(",", "");
            }

            const signalData = this.getSignalByOrder(order.open_timestamp, backtestResults.signals);
            const validationData = this.getValidationByTimestamp(order.open_timestamp, backtestResults.validation_data);

            res.push([`${count}`,
            `${new Date(order.open_timestamp * 1000).toUTCString().replace(",", "")}`,
            `${closeTimeString}`,
            `${this.type}`,
            `${order.side}`,
            `${order.price}`,
            `${order.sl_price}`,
            `${order.tp_price}`,
            `${this.slRatio}`,
            `${this.breakevenCandles}`,
            `${this.cancellationCandles}`,
            `${this.singlePosition}`,
            `${this.local_fast}`,
            `${this.local_slow}`,
            `${this.getLocalTrend(backtestResults, order.open_timestamp)}`,
            `${this.global_fast}`,
            `${this.global_slow}`,
            `${this.getGlobalTrend(backtestResults, order.open_timestamp)}`,
            `${this.getOrderOutcome(order)}`,
            `${order.pl}`,

            `${signalData.global_fast_value}`,
            `${signalData.global_slow_value}`,
            `${signalData.local_fast_value}`,
            `${signalData.local_slow_value}`,
            `${signalData.global_trend_spread_value}`,
            `${signalData.local_trend_spread_value}`,
            `${signalData.global_trend_spread * 100}`,
            `${signalData.local_trend_spread * 100}`,
            `${signalData.data.levels.ee}`,
            `${signalData.data.levels.ee1}`,
            `${signalData.data.levels.ee2}`,
            `${signalData.data.levels.ee3}`,
            `${signalData.data.levels.fe}`,
            `${signalData.data.levels.fe1}`,
            `${signalData.data.levels.fe2}`,
            `${signalData.data.levels.fe3}`,
            `${signalData.data.levels.ze}`,
            `${signalData.data.levels.ze1}`,
            `${signalData.data.levels.ze2}`,
            `${signalData.data.levels.ze3}`,
            `${signalData.data.levels.m18}`,
            `${signalData.data.levels.m28}`,
            `${signalData.data.levels.p18}`,
            `${signalData.data.levels.p28}`,
            `${validationData.good_trade}`,
            `${validationData.bad_trade}`
            ]);
            count++;
        }

        let csvContent = res.map(e => e.join(",")).join("\n");

        return csvContent;
    }

    protected getSignalByOrder(timestamp: number, signals: IBFTAScannerSignal[]): IBFTAScannerSignal {
        for (const signal of signals) {
            if (signal.timestamp === timestamp) {
                return signal;
            }
        }

        return {} as IBFTAScannerSignal;
    }

    protected getValidationByTimestamp(timestamp: number, signals: IBFTAValidationData[]): IBFTAValidationData {
        for (const signal of signals || []) {
            if (signal.timestamp === timestamp) {
                return signal;
            }
        }

        return {} as IBFTAValidationData;
    }

    protected getLocalTrend(backtestResults: IBFTAScannerBacktestResponse, timestamp: number) {
        const signals = backtestResults.signals;
        for (const signal of signals) {
            if (signal.timestamp === timestamp) {
                return signal.local_trend;
            }
        }

        return "Unknown";
    }

    protected getGlobalTrend(backtestResults: IBFTAScannerBacktestResponse, timestamp: number) {
        const signals = backtestResults.signals;
        for (const signal of signals) {
            if (signal.timestamp === timestamp) {
                return signal.global_trend;
            }
        }

        return "Unknown";
    }

    protected getOrderOutcome(order: IBFTAOrder) {
        return order.status;
    }

}