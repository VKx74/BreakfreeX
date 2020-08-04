import { Component, EventEmitter, Input, Output, Injector, Inject } from '@angular/core';
import { BreakfreeTradingBacktestService } from 'modules/BreakfreeTrading/services/breakfreeTradingBacktest.service';
import { IInstrument } from '@app/models/common/instrument';
import { IBFTAOrder, IBFTABacktestResponse, IBFTAlgoParameters, IBFTAExtHitTestSignal, IBFTAExtHitTestResult } from '@app/services/algo.service';
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
        let backtestResults = await this._bftService.extHitTest(backtestParameters);
        let lastCandleDate = chart.dataContext.dataRows[".date"].lastValue as Date;
        let shapes = [];
        for (let i = 0; i < backtestResults.signals.length; i++) 
        {
            let signal = backtestResults.signals[i];
            let signalNext = backtestResults.signals[i + 1];
            let startDate = new Date(signal.timestamp * 1000);
            let endDate = signalNext ? new Date(signalNext.timestamp * 1000) : lastCandleDate;
            
            // let lineEntry = this.generateLine(startDate, endDate, signal.data.algo_Entry, "#629320");
            let backColor = this.calculateProfitabilityColor(signal);
            let backArea = this.generateRect(startDate, endDate, signal.data.p28, signal.data.m28, backColor);
            let topExt2 = this.generateLine(startDate, endDate, signal.data.p28, "#932b20");
            let topExt1 = this.generateLine(startDate, endDate, signal.data.p18, "#932b20");
            let resistence = this.generateLine(startDate, endDate, signal.data.ee, "#2e5e9a");

            let bottomExt2 = this.generateLine(startDate, endDate, signal.data.m28, "#3d9320");
            let bottomExt1 = this.generateLine(startDate, endDate, signal.data.m18, "#3d9320");
            let support = this.generateLine(startDate, endDate, signal.data.ze, "#2e5e9a");

            shapes.push(backArea);
            shapes.push(topExt2);
            shapes.push(topExt1);
            shapes.push(resistence);
            shapes.push(bottomExt2);
            shapes.push(bottomExt1);
            shapes.push(support);
        }

        chart.primaryPane.addShapes(shapes);
        chart.refreshAsync();
        chart.commandController.clearCommands();
        this.Processing.emit(false);

        this.infoDateCalculation(backtestResults, chart);
    }

    private validateInputParameters (params: IBFTAlgoParameters): boolean {
        if (!params.replay_back || params.replay_back < 100 || params.replay_back > 2000) {
            this._alertService.error("Bars count incorrect. Min 100 Max 2000.");
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
                width: 2,
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