import { Component, EventEmitter, Input, Output, Injector, Inject } from '@angular/core';
import { BreakfreeTradingBacktestService } from 'modules/BreakfreeTrading/services/breakfreeTradingBacktest.service';
import { IInstrument } from '@app/models/common/instrument';
import { IBFTAOrder, IBFTABacktestResponse, IBFTAlgoParameters } from '@app/services/algo.service';
import { of } from 'rxjs';
import bind from "bind-decorator";
import { AlertService } from '@alert/services/alert.service';

export interface IBFTBacktestComponentState {
}

@Component({
    selector: 'BreakfreeStrategyBacktest',
    templateUrl: './strategyModeBacktest.component.html',
    styleUrls: ['./strategyModeBacktest.component.scss']
})
export class StrategyModeBacktestComponent {
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
    public OrdersCount: string = "";
    public WinTradeCount: string = "";
    public LossTradeCount: string = "";
    public WinLossRatio: string = "";
    public TotalPerformance: string = "";
    
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
        this.OrdersCount = "";
        this.WinTradeCount = "";
        this.LossTradeCount = "";
        this.WinLossRatio = "";
        this.TotalPerformance = "";
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
        let backtestResults;
        try {
            backtestResults = await this._bftService.backtest(backtestParameters);
        } catch (error) {
            this._alertService.error("Failed to calculate backtest");
            this.Processing.emit(false);
        }
        let pricePrecision = (chart.instrument as IInstrument).pricePrecision;
        let lastCandleDate = chart.dataContext.dataRows[".date"].lastValue as Date;
        let groupedOrders = this.groupOrders(backtestResults.orders);
        let shapes = [];
        for (let i = 0; i < backtestResults.signals.length; i++) 
        {
            let signal = backtestResults.signals[i];
            let signalNext = backtestResults.signals[i + 1];
            let startDate = new Date(signal.timestamp * 1000);
            let endDate = signalNext ? new Date(signalNext.timestamp * 1000) : lastCandleDate;
            
            // let lineEntry = this.generateLine(startDate, endDate, signal.data.algo_Entry, "#629320");
            let isBuy = signal.data.algo_Entry > signal.data.algo_Stop;
            let backColor = this.calculateProfitabilityColor(signal.timestamp, groupedOrders);
            let backArea = this.generateRect(startDate, endDate, signal.data.algo_TP2, signal.data.algo_Stop, backColor);
            let entryRect = this.generateRect(startDate, endDate, signal.data.algo_Entry_high, signal.data.algo_Entry_low, isBuy ? "#3d93204f" : "#932b204f");
            let tpRect = this.generateRect(startDate, endDate, signal.data.algo_TP1_high, signal.data.algo_TP1_low, "#2e5e9a4f");
            let lineTP2 = this.generateLine(startDate, endDate, signal.data.algo_TP2, "#2e5e9a");
            let lineSL = this.generateLine(startDate, endDate, signal.data.algo_Stop, "#d3bb42");
            
            backArea.tooltip.text = this.getDescription(signal.timestamp, groupedOrders, pricePrecision);

            shapes.push(backArea);
            shapes.push(entryRect);
            shapes.push(tpRect);
            shapes.push(lineTP2);
            shapes.push(lineSL);
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
        if (!params.input_risk || params.input_risk < 1 || params.input_risk > 100) {
            this._alertService.error("Risk incorrect. Min 1.0 Max 100.0");
            return false;
        }
        if (!params.input_stoplossratio || params.input_stoplossratio < 0.1 || params.input_stoplossratio > 100) {
            this._alertService.error("SL ratio incorrect. Min 0.1 Max 100.0");
            return false;
        }
        if (!params.input_splitpositions || params.input_splitpositions < 1 || params.input_splitpositions > 3) {
            this._alertService.error("Position number incorrect. Min 1 Max 2");
            return false;
        }


        return true;
    }

    private infoDateCalculation (backtestResults: IBFTABacktestResponse, chart: TradingChartDesigner.Chart) {
        let pricePrecision = (chart.instrument as IInstrument).pricePrecision;
        this.Instrument = this._captionText(chart);
        this.SignalsCount = backtestResults.signals.length.toString();
        this.OrdersCount = backtestResults.orders.length.toString();
        
        let winTradeCount = this.winTradeCount(backtestResults.orders);
        let winPerformance = this.winPerformance(backtestResults.orders);
        let lossPerformance = this.lossPerformance(backtestResults.orders);
        this.WinTradeCount = winTradeCount.toString();
        this.LossTradeCount = (backtestResults.orders.length - winTradeCount).toString();
        this.TotalPerformance = (winPerformance + lossPerformance).toFixed(pricePrecision);

        let total =  (Math.abs(winPerformance) + Math.abs(lossPerformance));
        let winRatio = Math.abs(winPerformance) / total * 100;
        let loosRatio = Math.abs(lossPerformance) / total * 100;
        this.WinLossRatio = `Win: ${winRatio.toFixed(1)}% - Loss: ${loosRatio.toFixed(1)}%`;
    }

    private winTradeCount (orders: IBFTAOrder[]): number {
        let count = 0;
        for (const order of orders) {
            if (order.pl && order.pl > 0) {
                count++;
            }
        }
        return count;
    }
    
    private winPerformance (orders: IBFTAOrder[]): number {
        let performance = 0;
        for (const order of orders) {
            if (order.pl && order.pl > 0) {
                performance += order.pl;
            }
        }
        return performance;
    }
    
    private lossPerformance (orders: IBFTAOrder[]): number {
        let performance = 0;
        for (const order of orders) {
            if (order.pl && order.pl < 0) {
                performance += order.pl;
            }
        }
        return performance;
    }

    private groupOrders (orders: IBFTAOrder[]): any {
        const res: { [id: string]: IBFTAOrder[]; } = {};

        for (const order of orders) {
            if (!res[order.open_timestamp]) {
                res[order.open_timestamp] = [];
            }

            res[order.open_timestamp].push(order);
        }

        return res;
    }

    private calculateProfitabilityColor (timestamp: number, orders: { [id: string]: IBFTAOrder[]; }): string {
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

        return "#d6d6d62f";
    }
    
    private getDescription (timestamp: number, orders: { [id: string]: IBFTAOrder[]; }, precision: number): string {
        const neededOrders: IBFTAOrder[] = orders[timestamp] || [];
        let description = "";
        let totalPl = 0;
        for (const order of neededOrders) {
            description += `# ${order.side} order, entry: ${order.price.toFixed(precision)}, sl: ${order.sl_price.toFixed(precision)}, tp: ${order.tp_price.toFixed(precision)}, status - ${order.status}`;

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