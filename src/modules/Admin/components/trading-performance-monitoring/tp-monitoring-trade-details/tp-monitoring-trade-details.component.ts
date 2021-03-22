import { Component, ElementRef, Injector, OnInit, ViewChild } from "@angular/core";
import { Theme } from "@app/enums/Theme";
import { TimeFrameHelper } from "@app/helpers/timeFrame.helper";
import { IBarData } from "@app/models/common/barData";
import { IHistoryResponse } from "@app/models/common/historyResponse";
import { IInstrument } from "@app/models/common/instrument";
import { HistoryService } from "@app/services/history.service";
import { InstrumentService } from "@app/services/instrument.service";
import { ThemeService } from "@app/services/theme.service";
import { DataFeed } from "@chart/datafeed/DataFeed";
import { DataFeedBase } from "@chart/datafeed/DataFeedBase";
import { LocalizationService } from "Localization";
import { Trade } from "modules/Admin/data/tp-monitoring/TPMonitoringDTO";
import { Modal } from "Shared";
import { TzUtils } from "TimeZones";

declare let defaultTheme: any;
declare let fintatechDarkTheme: any;

@Component({
    selector: 'tp-monitoring-trade-details',
    templateUrl: 'tp-monitoring-trade-details.component.html',
    styleUrls: ['tp-monitoring-trade-details.component.scss'],
    providers: [
        {
            provide: DataFeedBase,
            useClass: DataFeed
        }]
})
export class TPMonitoringTradeDetailsComponent extends Modal<Trade> implements OnInit {

    constructor(injector: Injector,
        private _themeService: ThemeService,
        private _historyService: HistoryService,
        private _datafeed: DataFeedBase,
        private _localizationService: LocalizationService,
        private _instrumentService: InstrumentService) {
        super(injector);
    }
    @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef;
    chart: TradingChartDesigner.Chart;
    trade: Trade;

    ngOnInit(): void {        
        /*this._instrumentService.getInstrumentsBySymbol("EURUSD")
            .subscribe((instruments: IInstrument[]) => {
                console.log('instruments:');
                console.log(instruments);
                if (instruments) {
                    let instrument = instruments[0];
                    this.initChart(instrument);
                }
            }, (error: any) => {
                console.log('error:');
                console.log(error);
            });*/
    }

    ngAfterViewInit(): void {
        this.trade = this.data as Trade;
        console.log('onAfterInit');
        this._instrumentService.getInstrumentsBySymbol(this.trade.symbol)
            .subscribe((instruments: IInstrument[]) => {
                console.log('instruments:');
                console.log(instruments);
                if (instruments) {
                    let instrument = instruments[0];
                    this._loadBars(instrument);
                }
            }, (error: any) => {
                console.log('error:');
                console.log(error);
            });
    }

    private _loadBars(instrument: IInstrument): void {
        this._historyService.getHistory({
            instrument: instrument,
            timeFrame: TimeFrameHelper.intervalToTimeFrame(this.trade.timeFrame * 1000),
            startDate: new Date((this.trade.openTime - 10000) * 1000),
            endDate: new Date((this.trade.closeTime + 10000) * 1000)
        }).subscribe((response: IHistoryResponse) => {
            this.initChart(instrument, response.data);
        });
    }

    private initChart(instrument: IInstrument, history: IBarData[]): void {
        const theme = this._getTheme();
        console.log('historyBars:');
        console.log(history);

        const config = {
            chartContainer: this.chartContainer.nativeElement,
            theme: theme,
            width: '100%',
            height: '100% !important',
            addThemeClass: false,
            instrument: instrument,
            timeFrame: TradingChartDesigner.TimeFrame.intervalTimeFrame(this.trade.timeFrame * 1000),
            supportedTimeFrames: DataFeed.supportedTimeFramesStr,
            showToolbar: false,
            locale: this._localizationService.locale,
            crossHair: "crossBars",
        };

        this.chart = $(config.chartContainer).TradingChartDesigner(config);
        console.log('interval');
        console.log(this.chart.timeInterval);
        this.chart.dataContext.clearBarDataRows();
        this.chart.dataContext.appendBars(history);
        this.chart.invokeValueChanged(TradingChartDesigner.ChartEvent.BARS_SETTED, history);
        let profitLine = this.profitLine();
        profitLine.instrument = this.chart.instrument;
        this.chart.primaryPane.addShapes(profitLine);
        this.chart.refreshAsync(true);
        console.log('Chart:');
        console.log(this.chart);
    }

    private profitLine(): TradingChartDesigner.ShapeLineSegment {
        let shape = new TradingChartDesigner.ShapeLineSegment();
        shape.appendVisualDataPoint(new TradingChartDesigner.VisualDataPoint());
        shape.visualDataPoints[0].date = TzUtils.localToUTCTz(new Date(this.trade.openTime * 1000));
        // new Date(this.trade.openTime * 1000);
        shape.visualDataPoints[0].value = this.trade.openPrice;
        shape.visualDataPoints[1].date = TzUtils.localToUTCTz(new Date(this.trade.closeTime * 1000));
        // new Date(this.trade.closeTime * 1000);
        shape.visualDataPoints[1].value = this.trade.closePrice;
        shape.locked = true;
        shape.selectable = false;
        shape.hoverable = false;
        shape.theme = { line: { width: 2, strokeColor: 'blue' } };

        return shape;
    }

    private calculateCount(date1: Date, date2: Date, interval: number): Array<TradingChartDesigner.VisualDataPoint> {
        return null;
    }

    private _getTheme(): any {
        switch (this._themeService.getActiveTheme()) {
            case Theme.Dark:
                return fintatechDarkTheme;
            case Theme.Light:
            default:
                return defaultTheme;
        }
    }
}