import {Component, OnInit, ViewChild} from '@angular/core';
import {BacktestSummaryComponent} from "../backtest-summary/backtest-summary.component";
import {BacktestTradesComponent} from "../backtest-trades/backtest-trades.component";
import {BacktestChartComponent} from "../backtest-chart/backtest-chart.component";
import {IBacktestResultDTO} from "../../data/api.models";
import {BacktestOrdersComponent} from "../backtest-orders/backtest-orders.component";

export interface IBacktestResultOverviewComponent {
    showBackTestResult(result: IBacktestResultDTO): void;
}

@Component({
    selector: 'backtest-result-overview',
    templateUrl: './backtest-result-overview.component.html',
    styleUrls: ['./backtest-result-overview.component.scss']
})
export class BacktestResultOverviewComponent implements OnInit {
    @ViewChild(BacktestSummaryComponent, {static: false}) summary: BacktestSummaryComponent;
    @ViewChild(BacktestTradesComponent, {static: false}) trades: BacktestTradesComponent;
    @ViewChild(BacktestChartComponent, {static: false}) chartComponent: BacktestChartComponent;
    @ViewChild(BacktestOrdersComponent, {static: false}) ordersComponent: BacktestOrdersComponent;

    selectedTabIndex: number = 0;

    private _result: IBacktestResultDTO;
    private _components: any[];

    constructor() {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this._components = [
            this.summary,
            this.trades,
            this.ordersComponent,
            // this.mapToMarket,
            this.chartComponent
        ];
    }

    public resultLoading(): void {
        this.trades.resultLoading();
    }

    public showResult(result: IBacktestResultDTO): void {
        this._result = result;
        this._setResultToComponents(result);
    }

    handleTabSelected(index: number) {
        this.selectedTabIndex = index;
    }
    
    private _setResultToComponents(result: IBacktestResultDTO) {
        for (let i = 0; i < this._components.length; i++) {
            this._components[i].showBackTestResult(result);
        }
    }
}
