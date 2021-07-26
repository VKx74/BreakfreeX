import { Component, Injector, Inject } from '@angular/core';
import {BaseGoldenLayoutItemComponent} from "@layout/base-golden-layout-item.component";
import {GoldenLayoutItemState} from "angular-golden-layout";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';
import { BreakfreeTradingBacktestService } from 'modules/BreakfreeTrading/services/breakfreeTradingBacktest.service';
import { of, Subscription } from 'rxjs';
import bind from "bind-decorator";
import { ChartTrackerService } from 'modules/BreakfreeTrading/services/chartTracker.service';
import { BaseLayoutItem } from '@layout/base-layout-item';

export interface IBFTBacktestComponentState {
}

@Component({
    selector: 'breakfree-trading-backtest',
    templateUrl: './BreakfreeTradingBacktest.component.html',
    styleUrls: ['./BreakfreeTradingBacktest.component.scss']
})
export class BreakfreeTradingBacktestComponent extends BaseLayoutItem {
    static componentName = 'BreakfreeTradingBacktest';
    
    private _chartRemoved: Subscription;

    get componentId(): string {
        return BreakfreeTradingBacktestComponent.componentName;
    }

    public get Charts(): TradingChartDesigner.Chart[] {
        return this._chartTrackerService.availableCharts;
    }

    public SelectedChart: TradingChartDesigner.Chart;

    public showSpinner: boolean = false;
    
    constructor(protected _bftService: BreakfreeTradingBacktestService, private _chartTrackerService: ChartTrackerService) {
        super();
    }

    @bind
    captionText(value: TradingChartDesigner.Chart) {
        return of (this._captionText(value));
    } 
    

    itemSelected(item: TradingChartDesigner.Chart) {
        this.SelectedChart = item;
    }

    ngOnInit() {
        this.initialized.next(this);
        this._selectDefaultItem();
        this._chartRemoved = this._chartTrackerService.onChartRemoved.subscribe(this._handleChartRemoved.bind(this));
    }

    getComponentState(): IBFTBacktestComponentState {
        // save your state
        return {
        };
    }

    ngOnDestroy() {
        this.beforeDestroy.next(this);

        try {
            this.clearData();
        } catch (e) {
            console.log(e);
        }

        if (this._chartRemoved) {
            this._chartRemoved.unsubscribe();
        }
    }

    onProcessing(_showSpinner: boolean) {
        this.showSpinner = _showSpinner;
    }

    clearData()
    {
        if (this.Charts && this.Charts.length) {
            for (const chart of this.Charts) {
                let shapes = [];
                for (const shape of chart.primaryPane.shapes) {
                    if (shape["is_backtest"]) {
                        shape.locked = false;
                        shape.selectable = true;
                        shape.removable = true;
                        shapes.push(shape);
                    }
                }
                chart.primaryPane.removeShapes(shapes);
                chart.refreshAsync();
                chart.commandController.clearCommands();
            }
        }
    }

    getState() {
        return null;
    }

    setState(state: any) {
    }

    protected useLinker(): boolean { 
        return false;
    }

    private _captionText(value: TradingChartDesigner.Chart) {
        const tf = value.timeFrame;
        const instr = value.instrument;
        return `${instr.symbol} - ${instr.exchange} - ${tf.interval}${tf.periodicity || 'min'}`;
    }

    private _handleChartRemoved(chart: TradingChartDesigner.Chart) {
        if (this.SelectedChart === chart) {
            this.clearData();
            this._selectDefaultItem();
        }
    }

    private _selectDefaultItem() {
        if (this.Charts && this.Charts.length) {
            this.SelectedChart = this.Charts[0];
        } else {
            this.SelectedChart = null;
        }
    }
}