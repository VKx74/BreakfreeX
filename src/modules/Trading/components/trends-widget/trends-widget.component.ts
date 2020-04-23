import { Component, ElementRef, Inject, Injector, Optional, ViewChild } from '@angular/core';
import { SymbolTrendItem, TimeFrameTrend } from './models/models';
import { ComplexHistoryService } from './trends-widget-dataservice/complex-history-dataservice';
import { ComplexHistoryDto, ExchangeHistoryDto, CandleDto } from './trends-widget-dataservice/common';
import { AlertService } from '../../../Alert/services/alert.service';
import { TrendCalculator } from './trend-calculator';
import {ComponentIdentifier} from "@app/models/app-config";

@Component({
    selector: 'trends-widget',
    templateUrl: 'trends-widget.component.html',
    styleUrls: ['trends-widget.component.scss'],
    providers: [ComplexHistoryService]
})
export class TrendsWidgetComponent {
    private _historyService: ComplexHistoryService;
    private _intervalLink: any;
    private readonly _updateInterval = 5000;
    private readonly _barscount = 10;
    private readonly _lowTimeFrame = 60;
    private readonly _mediumTimeFrame = 900;
    private readonly _highTimeFrame = 3600;
    private _lowTFLastUpdateMinute = null;
    private _mediumTFLastUpdateMinute = null;
    private _highTFLastUpdateHour = null;

    private _alertService: AlertService;

    TrendItems: SymbolTrendItem[];
    TrendItemsMap: Map<string, SymbolTrendItem>;
    SearchSymbol: string;
    isLoading: boolean;
    isUpdating: boolean;

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(historyService: ComplexHistoryService,
        alertService: AlertService) {
        this._historyService = historyService;
        this._alertService = alertService;
        this.TrendItemsMap = new Map<string, SymbolTrendItem>();
    }

    ngOnInit() {
        this._intervalLink = setInterval(this.update.bind(this), this._updateInterval);        
    }

    ngOnDestroy() {
        clearInterval(this._intervalLink);        
    }

    handleSymbolChange() {
        this.TrendItemsMap.clear();
        this.isLoading = true;
        this.loadData([this._lowTimeFrame, this._mediumTimeFrame, this._highTimeFrame]);
    }

    private loadData(granularities: Array<number>): void {
        this.isUpdating = true;
        this._historyService.getData(this.SearchSymbol, this._barscount, granularities)
            .subscribe(
                data => this.mapResponseResult(data),
                error => {
                    this.isLoading = false;
                    this._alertService.warning(`Could not load data for symbol "${this.SearchSymbol}"`, 'Symbol not found');
                });
    }

    private mapResponseResult(complexHistorydata: ComplexHistoryDto): void {
        this.SearchSymbol = complexHistorydata.Symbol;
        this.isLoading = false;
        this.isUpdating = false;
        if (complexHistorydata.HistoryData.length == null) {
            this._alertService.warning(`Could not load data for symbol "${this.SearchSymbol}"`, 'No data for symbol');
        }
        complexHistorydata.HistoryData.forEach(item => {
            let lowTfItems = this.calculateTrends(item, this._lowTimeFrame.toString());
            let mediumTfItems = this.calculateTrends(item, this._mediumTimeFrame.toString());
            let highTfItems = this.calculateTrends(item, this._highTimeFrame.toString());

            let trendItem = this.TrendItemsMap.get(item.Exchange);
            if (trendItem === undefined) {
                trendItem = new SymbolTrendItem();
                this.TrendItemsMap.set(item.Exchange, trendItem);
            }

            if (highTfItems.length !== 0) {
                trendItem.High = new TimeFrameTrend(highTfItems);
                this._highTFLastUpdateHour = new Date().getHours();
            }

            if (mediumTfItems.length !== 0) {
                trendItem.Medium = new TimeFrameTrend(mediumTfItems);
                this._mediumTFLastUpdateMinute = new Date().getMinutes();
            }

            if (lowTfItems.length !== 0) {
                trendItem.Low = new TimeFrameTrend(lowTfItems);
                this._lowTFLastUpdateMinute = new Date().getMinutes();
            }
        });
    }

    private calculateTrends(histories: ExchangeHistoryDto, granularity: string): Array<boolean | object> {
        let result: Array<boolean | object> = [];
        if (histories.HistoriesPerEachGranularity) {
            let candles: Array<CandleDto> = histories.HistoriesPerEachGranularity[granularity];
            if (candles !== null && candles !== undefined && candles.length > 0) {
                candles.pop();
                result = TrendCalculator.calculate(candles);
                result = result.slice(Math.max(-5, candles.length * (-1)));
            }
        }
        return result;
    }

    private update(): void {
        if (!this.isUpdating && !this.isLoading
            && this.lowTfNeedUpdate()) {
            let tfToUpdate = new Array<number>();
            tfToUpdate.push(this._lowTimeFrame);
            if (this.mediumTfNeedUpdate()) {
                tfToUpdate.push(this._mediumTimeFrame);
                if (this.highTfNeedUpdate()) {
                    tfToUpdate.push(this._highTimeFrame);
                }
            }
            this.loadData(tfToUpdate);
        }
    }

    private lowTfNeedUpdate(): boolean {
        return this._lowTFLastUpdateMinute !== null && new Date().getMinutes() !== this._lowTFLastUpdateMinute;
    }

    private mediumTfNeedUpdate(): boolean {
        let nowMuninutes = new Date().getMinutes();
        return this._mediumTFLastUpdateMinute != null
            && nowMuninutes - nowMuninutes % 15 !== this._mediumTFLastUpdateMinute - this._mediumTFLastUpdateMinute % 15;
    }

    private highTfNeedUpdate(): boolean {
        return this._highTFLastUpdateHour !== null && new Date().getHours() !== this._highTFLastUpdateHour;
    }
}
