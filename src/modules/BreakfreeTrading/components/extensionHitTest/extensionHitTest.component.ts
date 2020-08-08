import { Component, EventEmitter, Input, Output, Injector, Inject } from '@angular/core';
import { BreakfreeTradingBacktestService } from 'modules/BreakfreeTrading/services/breakfreeTradingBacktest.service';
import { IInstrument } from '@app/models/common/instrument';
import { IBFTAOrder, IBFTABacktestResponse, IBFTAlgoParameters, IBFTAExtHitTestSignal, IBFTAExtHitTestResult, IBFTBacktestAlgoParameters } from '@app/services/algo.service';
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

    public barsCount: number = 100;
    public hmaPeriod: number = 200;
    public slRatio: number = 1.7;
    public posNumbers: number = 3;
    public risk: number = 3.5;

    public Instrument: string = "";
    public SignalsCount: string = "";
    public WinLossRatio: string = "";
    
    constructor(private _alertService: AlertService, protected _bftService: BreakfreeTradingBacktestService) {
    }

    @bind
    captionText(value: TradingChartDesigner.Chart) {
        return of (this._captionText(value));
    } 
    

    itemSelected(item: TradingChartDesigner.Chart) {
        this.SelectedChart = item;
    }

    clear()
    {
        this.Processing.emit(true);
        this.Instrument = "";
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
            timenow: new Date().getTime()
        };

        if (!this.validateInputParameters(backtestParameters)) {
            return;
        }

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
        for (let i = 0; i < backtestResults.signals.length; i++) 
        {
            let signal = backtestResults.signals[i];
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
            let topExt1 = this.generateLine(startDate, endDate, signal.data.p18, "#932b20");
            let resistence = this.generateLine(startDate, endDate, signal.data.ee, "#2e5e9a");

            // let bottomExt2 = this.generateLine(startDate, endDate, signal.data.m28, "#3d9320");
            let bottomExt1 = this.generateLine(startDate, endDate, signal.data.m18, "#3d9320");
            let support = this.generateLine(startDate, endDate, signal.data.ze, "#2e5e9a");
            let trendText = this.generateText(startDate, signal.data.m28, signal.is_up_tending);

            shapes.push(backArea);
            // shapes.push(topExt2);
            shapes.push(topExt1);
            shapes.push(resistence);
            // shapes.push(bottomExt2);
            shapes.push(bottomExt1);
            shapes.push(support);
            shapes.push(trendText);
        }

        chart.primaryPane.addShapes(shapes);
        chart.refreshAsync();
        chart.commandController.clearCommands();
        this.Processing.emit(false);

        this.infoDateCalculation(backtestResults, chart);
    }

    private validateInputParameters (params: IBFTBacktestAlgoParameters): boolean {
        if (!params.replay_back || params.replay_back < 100 || params.replay_back > 2000) {
            this._alertService.error("Bars count incorrect. Min 100 Max 2000.");
            return false;
        }

        if (!params.hma_period || params.hma_period < 10 || params.hma_period > 250) {
            this._alertService.error("Trend calculation period incorrect. Min 10 Max 250.");
            return false;
        }

        return true;
    }

    private infoDateCalculation (backtestResults: IBFTAExtHitTestResult, chart: TradingChartDesigner.Chart) {
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

    private calculateProfitabilityColor (signal: IBFTAExtHitTestSignal): string {
        if (signal.backhit) {
            return "#3d93202f";
        }
        
        if (signal.wentout) {
            return "#932b202f";
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