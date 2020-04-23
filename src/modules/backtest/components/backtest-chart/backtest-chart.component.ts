import {Component, ViewChild} from '@angular/core';
import {TcdBacktestComponent} from "Chart";
import {IBacktestResultDTO} from "../../data/api.models";
import {HistoryService} from "@app/services/history.service";
import {TabHandler} from "../../../Shared/components/tab-container/tab-handler";
import {IBacktestResultOverviewComponent} from "../backtest-result-overview/backtest-result-overview.component";

@Component({
    selector: 'backtest-chart',
    templateUrl: './backtest-chart.component.html',
    styleUrls: ['./backtest-chart.component.scss']
})
export class BacktestChartComponent implements IBacktestResultOverviewComponent {
    @ViewChild(TcdBacktestComponent, {static: false}) chartComponent: TcdBacktestComponent;
    result: IBacktestResultDTO;

    constructor(private _historyService: HistoryService,
                private _tabHandler: TabHandler) {
    }

    ngOnInit() {
        this._tabHandler.onActivate(() => {
            if (this.chartComponent && this.chartComponent.chart) {
                this.chartComponent.chart.refreshAsync();
            }
        });
    }

    public showBackTestResult(result: IBacktestResultDTO) {
        this.result = result;
        this.chartComponent.showBacktestResult(result);
    }
}
