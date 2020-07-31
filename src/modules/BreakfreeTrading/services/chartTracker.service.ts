import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ChartTrackerService {
    private _availableCharts: TradingChartDesigner.Chart[] = [];


    public get availableCharts(): TradingChartDesigner.Chart[] {
        return this._availableCharts;
    }


    public onChartAdded: Subject<TradingChartDesigner.Chart> = new Subject<TradingChartDesigner.Chart>();
    public onChartRemoved: Subject<TradingChartDesigner.Chart> = new Subject<TradingChartDesigner.Chart>();


    public addChart(chart: TradingChartDesigner.Chart) {
        for (const existingChart of this._availableCharts) {
            if (existingChart === chart) {
                return;
            }
        }
        this._availableCharts.push(chart);
        this.onChartAdded.next(chart);
    }


    public removeChart(chart: TradingChartDesigner.Chart) {
        let index = this._availableCharts.indexOf(chart);

        if (index < 0) {
            return;
        }

        this._availableCharts.splice(index, 1);
        this.onChartRemoved.next(chart);
    }
}
