import { Component, EventEmitter, Input, Output, Injector, Inject } from '@angular/core';
import { BreakfreeTradingBacktestService } from 'modules/BreakfreeTrading/services/breakfreeTradingBacktest.service';
import { IInstrument } from '@app/models/common/instrument';
import { IBFTAOrder, IBFTABacktestResponse, IBFTAlgoParameters, IBFTBacktestAlgoParameters, TrendDetectorType, IBFTBacktestV2AlgoParameters, IBFTABacktestV2Response, IBFTATrend } from '@app/services/algo.service';
import { of } from 'rxjs';
import bind from "bind-decorator";
import { AlertService } from '@alert/services/alert.service';

export interface IBFTBacktestComponentState {
}

@Component({
    selector: 'BreakfreeStrategyV2Backtest',
    templateUrl: './strategyV2ModeBacktest.component.html',
    styleUrls: ['./strategyV2ModeBacktest.component.scss']
})
export class StrategyV2ModeBacktestComponent {
    @Input()
    public SelectedChart: TradingChartDesigner.Chart;
    @Output() 
    public Processing = new EventEmitter<boolean>();
    @Output() 
    public ClearData = new EventEmitter();

    public barsCount: number = 100;
    public slRatio: number = 1.7;
    public maxCount: number = 100;
    public breakevenCandles: number = 5;
    public mesa_fast: number = 0.25;
    public mesa_slow: number = 0.05;
    public mesa_diff: number = 0.1;
    public hourly_mesa_fast: number = 0.25;
    public hourly_mesa_slow: number = 0.05;
    public hourly_mesa_diff: number = 0.1;
    public place_on_ex1: boolean = true;
    public place_on_sr: boolean = true;
    public use_hourly_trend: boolean = true;
    public use_daily_trend: boolean = true;
    public stoplossRR: number = 25;

    public Status: string = "-";
    public Instrument: string = "";
    public StartDate: string = "";
    public SignalsCount: string = "";
    public OrdersCount: string = "";
    public WinTradeCount: string = "";
    public LossTradeCount: string = "";
    public WinLossRatio: string = "";
    public TotalPerformance: string = "";
    
    constructor(private _alertService: AlertService, protected _bftService: BreakfreeTradingBacktestService) {
    }

    
    @bind
    captionText(value: TrendDetectorType) {
        return of(this._trendCaptionText(value));
    } 
    
    _trendCaptionText(value: TrendDetectorType): string {
        switch (value) {
            case TrendDetectorType.hma: return "HMA";
            case TrendDetectorType.mesa: return "MESA";
        }

        return "Udefined";
    }

    clear()
    {
        this.Processing.emit(true);
        this.Status = "-";
        this.Instrument = "";
        this.StartDate = "";
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
        
        let backtestParameters: IBFTBacktestV2AlgoParameters = {
            input_accountsize: 1000,
            input_risk: 3.5,
            input_splitpositions: 1,
            replay_back: this.barsCount,
            input_stoplossratio: this.slRatio,
            risk_reward: this.slRatio,
            instrument: chart.instrument as IInstrument,
            timeframe: chart.timeFrame,
            breakeven_candles: this.breakevenCandles,
            time: new Date().getTime(),
            timenow: new Date().getTime(),
            mesa_fast: this.mesa_fast,
            mesa_slow: this.mesa_slow,
            mesa_diff: this.mesa_diff,
            hourly_mesa_fast: this.hourly_mesa_fast,
            hourly_mesa_slow: this.hourly_mesa_slow,
            hourly_mesa_diff: this.hourly_mesa_diff,
            use_hourly_trend: this.use_hourly_trend,
            use_daily_trend: this.use_daily_trend,
            place_on_ex1: this.place_on_ex1,
            place_on_sr: this.place_on_sr,
            stoploss_rr: this.stoplossRR,
            trend_detector: TrendDetectorType.mesa
        };

        if (!this.validateInputParameters(backtestParameters)) {
            return;
        }

        this.Status = "Calculating...";
        this.Processing.emit(true);
        let backtestResults: IBFTABacktestV2Response;
        try {
            backtestResults = await this._bftService.backtestV2(backtestParameters);
        } catch (error) {
            this._alertService.error("Failed to calculate backtest");
            this.Processing.emit(false);
        }
        let pricePrecision = (chart.instrument as IInstrument).pricePrecision;
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

        for (let i = start; i < backtestResults.signals.length; i++) 
        {
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
            let backArea = this.generateRect(startDate, endDate, signal.data.top_ex2, signal.data.bottom_ex2, backColor);
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

            if (signal.data.trade_sr) {
                let trade = signal.data.trade_sr;
                let limitLine = this.generateLine(startDate, endDate, trade.limit, "#22FF22", 1);
                shapes.push(limitLine);
                let stopLine = this.generateLine(startDate, endDate, trade.stop, "#d3bb42", 1);
                shapes.push(stopLine);
                let entryLine = this.generateLine(startDate, endDate, trade.entry, "#2e5e9a", 1);
                shapes.push(entryLine);
            } 
            
            if (signal.data.trade_ex1) {
                let trade = signal.data.trade_ex1;
                let limitLine = this.generateLine(startDate, endDate, trade.limit, "#22FF22", 1);
                shapes.push(limitLine);
                let stopLine = this.generateLine(startDate, endDate, trade.stop, "#d3bb42", 1);
                shapes.push(stopLine);
                let entryLine = this.generateLine(startDate, endDate, trade.entry, "#2e5e9a", 1);
                shapes.push(entryLine);
            }
            
            let description = this.getDescription(signal.timestamp, groupedOrders, pricePrecision);
            description += "\n----------- \n";
            description += `Daily trend: ${signal.data.daily_trend}; \n`;
            description += `Hourly trend: ${signal.data.daily_trend};`;

            backArea.tooltip.text = description;
        }

        chart.primaryPane.addShapes(shapes);
        chart.refreshAsync();
        chart.commandController.clearCommands();
        this.Processing.emit(false);

        this.infoDateCalculation(backtestResults, chart);
        this.Status = "Done";
    }

    private validateInputParameters (params: IBFTBacktestV2AlgoParameters): boolean {
        if (!params.replay_back || params.replay_back < 100 || params.replay_back > 10000) {
            this._alertService.error("Bars count incorrect. Min 100 Max 10000.");
            return false;
        } 
        if (!params.risk_reward || params.risk_reward < 0.1 || params.risk_reward > 100) {
            this._alertService.error("Risk ratio incorrect. Min 0.1 Max 100.0");
            return false;
        }
        if (params.breakeven_candles === undefined || params.breakeven_candles < 0) {
            this._alertService.error("Breakeven candles cant be less than 0.");
            return false;
        }
        if (params.mesa_fast <= 0) {
            this._alertService.error("Mesa Fast must be greater than 0.");
            return false;
        }  
        if (params.mesa_slow <= 0) {
            this._alertService.error("Mesa Slow must be greater than 0.");
            return false;
        }  
        if (params.mesa_diff <= 0) {
            this._alertService.error("Mesa Diff must be greater than 0.");
            return false;
        } 
        if (params.hourly_mesa_fast <= 0) {
            this._alertService.error("Mesa Fast must be greater than 0.");
            return false;
        }  
        if (params.hourly_mesa_slow <= 0) {
            this._alertService.error("Mesa Slow must be greater than 0.");
            return false;
        }  
        if (params.hourly_mesa_diff <= 0) {
            this._alertService.error("Mesa Diff must be greater than 0.");
            return false;
        }

        return true;
    }

    private infoDateCalculation (backtestResults: IBFTABacktestV2Response, chart: TradingChartDesigner.Chart) {
        if (backtestResults.signals.length) {
            this.StartDate = new Date(backtestResults.signals[0].timestamp * 1000).toUTCString();
        } else {
            this.StartDate = "";
        }

        let pricePrecision = (chart.instrument as IInstrument).pricePrecision;
        this.Instrument = this._captionText(chart);
        this.SignalsCount = backtestResults.signals.length.toString();
        this.OrdersCount = backtestResults.orders.length.toString();
        
        let winTradeCount = this.winTradeCount(backtestResults.orders);
        let lossTradeCount = this.loosTradeCount(backtestResults.orders);
        let winPerformance = this.winPerformance(backtestResults.orders);
        let lossPerformance = this.lossPerformance(backtestResults.orders);
        this.WinTradeCount = winTradeCount.toString();
        this.LossTradeCount = lossTradeCount.toString();
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
    
    private loosTradeCount (orders: IBFTAOrder[]): number {
        let count = 0;
        for (const order of orders) {
            if (order.pl && order.pl < 0) {
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

        return neededOrders.length ? "#d6d6d62f" : "#fcba032f";
    }
    
    private getDescription (timestamp: number, orders: { [id: string]: IBFTAOrder[]; }, precision: number): string {
        const neededOrders: IBFTAOrder[] = orders[timestamp] || [];
        let description = "";
        let totalPl = 0;
        for (const order of neededOrders) {
            description += `# ${order.side} order (${order.comment}), entry: ${order.price.toFixed(precision)}, sl: ${order.sl_price.toFixed(precision)}, tp: ${order.tp_price.toFixed(precision)}, status - ${order.status}`;

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
        return `${instr.symbol} - ${instr.exchange} - ${tf.interval}${tf.periodicity}`;
    }
}