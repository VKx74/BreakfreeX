import {Component} from '@angular/core';
import {IBacktestResultDTO, OrderAction} from "../../data/api.models";
import {JsUtil} from "../../../../utils/jsUtil";
import {IInstrument} from "@app/models/common/instrument";
import {IBacktestResultOverviewComponent} from "../backtest-result-overview/backtest-result-overview.component";
import {memoize} from "@decorators/memoize";
import TimeFrame = TradingChartDesigner.TimeFrame;

export interface IBacktestSummary {
    initialCapitals: { symbol: string, value: number }[];
    endCapitals: { symbol: string, value: number }[];
    totalPerformance: { symbol: string, value: number, percentValue: number }[];

    ordersCount: number;
    buyOrders: { value: number; percentValue: number };
    sellOrders: { value: number; percentValue: number };

    tradesCount: number;
    buyTrades: { value: number, percentValue: number };
    sellTrades: { value: number, percentValue: number };
    profitTrades: { value: number, percentValue: number };
    lossTrades: { value: number, percentValue: number };

    profitFactor: number;
    averageTrade: number;
    grossProfit: number;
    grossLoss: number;

    startDate: number;
    endDate: number;
    // timeInMarket: number;
    // totalTradedDays: number;

    instrument: IInstrument;
    timeFrame: TimeFrame;
}

@Component({
    selector: 'backtest-summary',
    templateUrl: './backtest-summary.component.html',
    styleUrls: ['./backtest-summary.component.scss'],
})
export class BacktestSummaryComponent implements IBacktestResultOverviewComponent {
    result: IBacktestResultDTO;
    summary: IBacktestSummary;

    constructor() {
    }

    public ngOnInit() {
    }

    public showBackTestResult(result: IBacktestResultDTO): void {
        this.result = result;
        this.summary = this._getBacktestSummary(result);
    }

    @memoize()
    percent(count: number, totalCount: number): number {
        if (totalCount === 0) {
            return 0;
        }

        return JsUtil.roundNumber((count / totalCount) * 100, 5);
    }

    private _getBacktestSummary(result: IBacktestResultDTO): IBacktestSummary {
        const signals = JsUtil.mapOfArraysToArray(result.signals);
        const buySignals = signals.filter(s => s.action === OrderAction.Buy);
        const sellSignals = signals.filter(s => s.action === OrderAction.Sell);

        const orders = JsUtil.mapOfArraysToArray(result.orders);
        const buyOrders = orders.filter(order => order.action === OrderAction.Buy);
        const sellOrders = orders.filter(order => order.action === OrderAction.Sell);

        const wallets = result.wallets;
        const historyParameters = result.historyParameters;

        return {
            initialCapitals: wallets.map((w) => ({symbol: w.currency, value: w.initialAmount})),
            endCapitals: wallets.map((w) => ({symbol: w.currency, value: w.currentAmount})),
            totalPerformance: wallets.map((w) => ({
                symbol: w.currency,
                value: JsUtil.roundNumber(w.currentAmount - w.initialAmount, 3),
                percentValue: this.percent((w.currentAmount - w.initialAmount), w.initialAmount)
            })),

            ordersCount: orders.length,
            sellOrders: {
                value: sellOrders.length,
                percentValue: this.percent(sellOrders.length, orders.length)
            },
            buyOrders: {value: buyOrders.length, percentValue: this.percent(buyOrders.length, orders.length)},

            tradesCount: signals.length,
            buyTrades: {
                value: buySignals.length,
                percentValue: this.percent(buySignals.length, signals.length)
            },
            sellTrades: {
                value: sellSignals.length,
                percentValue: this.percent(sellSignals.length, signals.length)
            },
            profitTrades: {
                value: signals.filter(s => s.performanceValue >= 0).length,
                percentValue: this.percent(signals.filter(s => s.performanceValue >= 0).length, signals.length)
            },
            lossTrades: {
                value: signals.filter(s => s.performanceValue < 0).length,
                percentValue: this.percent(signals.filter(s => s.performanceValue < 0).length, signals.length)
            },


            profitFactor: 0,
            averageTrade: 0,
            grossProfit: signals.length ? Math.max(...signals.map(s => s.performanceValue)) : 0,
            grossLoss: signals.length ? Math.min(...signals.map(s => s.performanceValue)) : 0,

            startDate: (historyParameters.to * 1000) - (historyParameters.granularity * 1000 * historyParameters.barsCount),
            endDate: historyParameters.to * 1000,
            // timeInMarket: 0,
            // totalTradedDays: 0,

            instrument: result.instrument,
            timeFrame: null
        };
    }

    // #endregion
}
