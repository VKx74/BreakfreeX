import { Injectable } from '@angular/core';
import { TcdComponent } from '@chart/components';
import { Subject } from 'rxjs';

@Injectable()
export class ChartTrackerService {
    private _availableCharts: TradingChartDesigner.Chart[] = [];
    private _availableChartComponents: TcdComponent[] = [];


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

    public addChartComponent(chartComponent: TcdComponent) {
        for (const existingChart of this._availableChartComponents) {
            if (existingChart === chartComponent) {
                return;
            }
        }

        this._availableChartComponents.push(chartComponent);
    }

    public removeChart(chart: TradingChartDesigner.Chart) {
        let index = this._availableCharts.indexOf(chart);

        if (index < 0) {
            return;
        }

        this._availableCharts.splice(index, 1);
        this.onChartRemoved.next(chart);
    }

    public removeChartComponent(chartComponent: TcdComponent) {
        let index = this._availableChartComponents.indexOf(chartComponent);

        if (index < 0) {
            return;
        }

        this._availableChartComponents.splice(index, 1);
    }

    public detach() {
        for (const existingChart of this._availableChartComponents) {
            existingChart.detach();
        }
    } 
    
    public attach() {
        for (const existingChart of this._availableChartComponents) {
            existingChart.attach();
        }
    }
}
