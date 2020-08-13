import { Component, EventEmitter, Input, Output, Injector, Inject } from '@angular/core';
import { BreakfreeTradingBacktestService } from 'modules/BreakfreeTrading/services/breakfreeTradingBacktest.service';
import { IInstrument } from '@app/models/common/instrument';
import { IBFTAOrder, IBFTABacktestResponse, IBFTAlgoParameters, IBFTAExtHitTestSignal, IBFTAExtHitTestResult, IBFTBacktestAlgoParameters, IBFTAHitTestAlgoParameters } from '@app/services/algo.service';
import { of } from 'rxjs';
import bind from "bind-decorator";
import { AlertService } from '@alert/services/alert.service';

export interface IBFTBacktestComponentState {
}

@Component({
    selector: 'ExtensionHitTest',
    templateUrl: './extensionHitTest.component.html',
    styleUrls: ['./extensionHitTest.component.scss']
})
export class ExtensionHitTestComponent {
    @Input()
    public SelectedChart: TradingChartDesigner.Chart;
    @Output()
    public Processing = new EventEmitter<boolean>();
    @Output()
    public ClearData = new EventEmitter();

    public maxCount: number = 100;
    public barsCount: number = 100;
    public hmaPeriod: number = 200;
    public slRatio: number = 1.7;
    public posNumbers: number = 3;
    public risk: number = 3.5;
    public breakevenCandles: number = 5;
    public entryTargetBox: number = 25;
    public stoplossRR: number = 25;

    public Instrument: string = "";
    public Status: string = "-";
    public StartDate: string = "";
    public SignalsCount: string = "";
    public WinLossRatio: string = "";

    constructor(private _alertService: AlertService, protected _bftService: BreakfreeTradingBacktestService) {
    }

    @bind
    captionText(value: TradingChartDesigner.Chart) {
        return of(this._captionText(value));
    }


    itemSelected(item: TradingChartDesigner.Chart) {
        this.SelectedChart = item;
    }

    clear() {
        this.Processing.emit(true);
        this.Instrument = "";
        this.Status = "-";
        this.StartDate = "";
        this.SignalsCount = "";
        this.WinLossRatio = "";
        this.ClearData.emit();
        this.Processing.emit(false);
    }

    async backtest() {

        this.clear();

        let chart = this.SelectedChart;

        if (!chart) {
            this._alertService.error("Chart not selected");
            return;
        }

        let backtestParameters = {
            input_accountsize: 1000,
            input_risk: this.risk,
            input_splitpositions: this.posNumbers,
            replay_back: this.barsCount,
            hma_period: this.hmaPeriod,
            input_stoplossratio: this.slRatio,
            instrument: chart.instrument as IInstrument,
            timeframe: chart.timeFrame,
            time: new Date().getTime(),
            timenow: new Date().getTime(),
            breakeven_candles: this.breakevenCandles,
            entry_target_box: this.entryTargetBox,
            stoploss_rr: this.stoplossRR

        };

        if (!this.validateInputParameters(backtestParameters)) {
            return;
        }

        this.Status = "Calculating...";

        this.Processing.emit(true);
        let backtestResults;
        try {
            backtestResults = await this._bftService.extHitTest(backtestParameters);
        } catch (error) {
            this._alertService.error("Failed to calculate backtest");
            this.Processing.emit(false);
        }

        let lastCandleDate = chart.dataContext.dataRows[".date"].lastValue as Date;
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

            let signal = backtestResults.signals[i] as IBFTAExtHitTestSignal;
            let signalNext = backtestResults.signals[i + 1];
            let startDate = new Date(signal.timestamp * 1000);
            let endDate = signalNext ? new Date(signalNext.timestamp * 1000) : lastCandleDate;
            if (signal.end_timestamp) {
                endDate = new Date(signal.end_timestamp * 1000);
            }

            // let lineEntry = this.generateLine(startDate, endDate, signal.data.algo_Entry, "#629320");
            let backColor = this.calculateProfitabilityColor(signal);
            let backArea = this.generateRect(startDate, endDate, signal.data.p28, signal.data.m28, backColor);
            // let topExt2 = this.generateLine(startDate, endDate, signal.data.p28, "#932b20");
            let topSL = this.generateLine(startDate, endDate, signal.top_sl, "#000000");
            let resistence = this.generateLine(startDate, endDate, signal.data.ee, "#2e5e9a");
            let topExt1;
            if (signal.data.p18 === signal.top_entry) {
                topExt1 = this.generateLine(startDate, endDate, signal.top_entry, "#932b20");
            } else {
                topExt1 = this.generateRect(startDate, endDate, signal.data.p18, signal.top_entry, "#932b202f");
            }

            // let bottomExt2 = this.generateLine(startDate, endDate, signal.data.m28, "#3d9320");
            let bottomSL = this.generateLine(startDate, endDate, signal.bottom_sl, "#000000");
            let support = this.generateLine(startDate, endDate, signal.data.ze, "#2e5e9a");
            let trendText = this.generateText(startDate, signal.data.m28, signal.is_up_tending);

            let bottomExt1;
            if (signal.data.p18 === signal.top_entry) {
                bottomExt1 = this.generateLine(startDate, endDate, signal.bottom_entry, "#3d9320");
            } else {
                bottomExt1 = this.generateRect(startDate, endDate, signal.data.m18, signal.bottom_entry, "#3d93202f");
            }

            shapes.push(backArea);
            shapes.push(topSL);
            shapes.push(topExt1);
            shapes.push(resistence);
            shapes.push(bottomSL);
            shapes.push(bottomExt1);
            shapes.push(support);
            shapes.push(trendText);
        }

        chart.primaryPane.addShapes(shapes);
        chart.refreshAsync();
        chart.commandController.clearCommands();
        this.Processing.emit(false);
        this.infoDateCalculation(backtestResults, chart);
        this.Status = "Done";
    }

    private validateInputParameters(params: IBFTAHitTestAlgoParameters): boolean {
        if (!params.replay_back || params.replay_back < 100 || params.replay_back > 10000) {
            this._alertService.error("Bars count incorrect. Min 100 Max 10000.");
            return false;
        }

        if (!params.hma_period || params.hma_period < 10 || params.hma_period > 250) {
            this._alertService.error("Trend calculation period incorrect. Min 10 Max 250.");
            return false;
        }

        if (params.entry_target_box === undefined || params.entry_target_box < -100 || params.entry_target_box > 100) {
            this._alertService.error("Entry target box incorrect. Min -100 Max 100.");
            return false;
        }

        if (params.stoploss_rr === undefined || params.stoploss_rr < -100 || params.stoploss_rr > 100) {
            this._alertService.error("SL RR incorrect. Min -100 Max 100.");
            return false;
        }

        if (params.breakeven_candles === undefined || params.breakeven_candles < 0) {
            this._alertService.error("Breakeven candles cant be less than 0.");
            return false;
        }

        return true;
    }

    private infoDateCalculation(backtestResults: IBFTAExtHitTestResult, chart: TradingChartDesigner.Chart) {
        if (backtestResults.signals.length) {
            this.StartDate = new Date(backtestResults.signals[0].timestamp * 1000).toUTCString();
        } else {
            this.StartDate = "";
        }

        this.Instrument = this._captionText(chart);
        this.SignalsCount = backtestResults.signals.length.toString();
        let winRatio = 0;
        let loosRatio = 0;

        for (const signal of backtestResults.signals) {
            if (signal.backhit) {
                winRatio++;
            }

            if (signal.wentout) {
                loosRatio++;
            }
        }

        this.WinLossRatio = `Win: ${winRatio} orders | Loss: ${loosRatio} orders`;
    }

    private calculateProfitabilityColor(signal: IBFTAExtHitTestSignal): string {
        if (signal.backhit) {
            return "#3d93202f";
        }

        if (signal.wentout) {
            return "#932b202f";
        }

        if (signal.breakeven) {
            return "#fcba032f";
        }

        return "#d6d6d62f";
    }

    private generateText(date: Date, value: number, is_up_tending: boolean): TradingChartDesigner.ShapeText {
        const shape = new TradingChartDesigner.ShapeText();
        shape.visualDataPoints[0].date = date;
        shape.visualDataPoints[0].value = value;
        shape.locked = true;
        shape.selectable = false;
        shape.hoverable = false;
        shape.savable = false;
        shape.text = "\n" + (is_up_tending ? "U" : "D");
        shape.theme = {
            text: {
                fontsize: 10,
                fillColor: is_up_tending ? "#3d9320" : "#932b20"
            }
        };
        shape["is_backtest"] = true;
        return shape;
    }

    private generateLine(date1: Date, date2: Date, value: number, color: any): TradingChartDesigner.ShapeLineSegment {
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
                width: 1,
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
        return `${instr.symbol} - ${instr.exchange} - ${tf.interval}${tf.periodicity}`;
    }
}