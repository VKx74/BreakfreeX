import {Component, ElementRef, ViewChild} from "@angular/core";
import {ThemeService} from "@app/services/theme.service";
import {Theme} from "@app/enums/Theme";
import {finalize, map, takeUntil} from "rxjs/operators";
import {DataFeedBase} from "../../datafeed/DataFeedBase";
import {IInstrument} from "@app/models/common/instrument";
import {IBarData} from "@app/models/common/barData";
import {DataFeedMock} from "../../datafeed/data-feed-mock.service";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {IBacktestResultDTO, OrderAction} from "../../../backtest/data/api.models";
import {Observable} from "rxjs";
import {TimeFrameHelper} from "@app/helpers/timeFrame.helper";
import {IHistoryResponse} from "@app/models/common/historyResponse";
import {EExchange} from "@app/models/common/exchange";
import {EMarketType} from "@app/models/common/marketType";
import {HistoryService} from "@app/services/history.service";
import {switchmap} from "@decorators/switchmap";
import {LocalizationService} from "Localization";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';

declare let defaultTheme: any;
declare let fintatechDarkTheme: any;

@Component({
    selector: 'tcdBacktest',
    templateUrl: 'tcd.backtest.component.html',
    styleUrls: ['tcd.backtest.component.scss'],
    providers: [
        DataFeedMock
    ]
})
export class TcdBacktestComponent {
    @ViewChild('chartContainer', {static: false}) chartContainer: ElementRef;
    chart: TradingChartDesigner.Chart;
    arrowsPlot: TradingChartDesigner.ArrowsPlot;
    showSpinner: boolean;

    get isInited(): boolean {
        return this.chart != null;
    }

    constructor(private _datafeed: DataFeedMock,
                private _historyService: HistoryService,
                private _themeService: ThemeService,
                private _localizationService: LocalizationService) {
    }

    ngOnInit() {
        TradingChartDesigner.UserAgent.directory.htmlDialogs = '../node_modules/trading-chart-designer/assets/htmldialogs/';
        TradingChartDesigner.UserAgent.directory.localization = '../node_modules/trading-chart-designer/javascript/localization/';
        (TradingChartDesigner.SVGLoader as any)._defPath = "../node_modules/trading-chart-designer/assets/img/svg-icons/";

        this._themeService.activeThemeChange$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => this._handleThemeChange());
    }

    showBacktestResult(result: IBacktestResultDTO) {
        if (!this.isInited) {
            this._initChart(result);
        }

        this._showBacktestResult(result);
    }

    private _initChart(result: IBacktestResultDTO) {
        const theme = this._getTheme();

        const config = {
            chartContainer: this.chartContainer.nativeElement,
            theme: theme,
            width: '100%',
            height: 'calc( 100% - 22px )', // temp
            addThemeClass: false,
            datafeed: this._datafeed,
            instrument: this._getBacktestInstrument(result),
            timeFrame: this._getBacktestTimeFrame(result),
            supportedTimeFrames: DataFeedBase.supportedTimeFramesStr,
            showToolbar: false,
            locale: this._localizationService.locale
        };

        this.chart = $(config.chartContainer).TradingChartDesigner(config);
        this.arrowsPlot = new TradingChartDesigner.ArrowsPlot({
            dataRows: this.chart.primaryBarDataRows().high
        });
        this.chart.primaryPane.addPlot(this.arrowsPlot);
        this._localizationService.localeChange$
            .pipe(
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                if (this.chart) {
                    this.chart.locale = this._localizationService.locale;
                    this.chart.refreshAsync();
                }
            });

        (window as any).backtestTcd = this.chart;
    }

    @switchmap()
    private _showBacktestResult(result: IBacktestResultDTO) {
        this.showSpinner = true;
        return this._loadBars(result)
            .pipe(
                finalize(() => {
                    this.showSpinner = false;
                })
            )
            .subscribe((history: IBarData[]) => {
                const orders = result.orders[result.instrument.symbol] || [];
                const sellOrders = orders.filter(order => order.action === OrderAction.Sell);
                const buyOrders = orders.filter(order => order.action === OrderAction.Buy);

                this.chart.refreshAsync();

                this.chart.timeFrame = this._getBacktestTimeFrame(result);
                this.chart.instrument = this._getBacktestInstrument(result);
                this.chart.dataContext.clearBarDataRows();
                this.chart.dataContext.appendBars(history);
                this.chart.invokeValueChanged(TradingChartDesigner.ChartEvent.BARS_SETTED, history);
                this.arrowsPlot.setArrows({
                    upArrows: buyOrders.map((order) => ({
                        value: order.averageFillPrice,
                        date: new Date(order.timestamp)
                    })),
                    downArrows: sellOrders.map((order) => ({
                        value: order.averageFillPrice,
                        date: new Date(order.timestamp)
                    }))
                });

                this.chart.refreshAsync(true);
            });
    }

    refreshChart() {
        if (this.chart) {
            this.chart.refreshAsync();
        }
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

    private _loadBars(result: IBacktestResultDTO): Observable<IBarData[]> {
        return this._historyService.getHistoryByBackBarsCount({
            instrument: result.instrument,
            timeFrame: TimeFrameHelper.intervalToTimeFrame(result.historyParameters.granularity * 1000),
            barsCount: result.historyParameters.barsCount,
            endDate: new Date(result.historyParameters.to * 1000)
        })
            .pipe(
                map((resp: IHistoryResponse) => {
                    return resp.data;
                })
            );
    }

    private _getBacktestInstrument(result: IBacktestResultDTO): IInstrument {
        return {
            id: result.instrument.id,
            symbol: result.instrument.symbol,
            exchange: result.instrument.exchange as EExchange,
            datafeed: result.instrument.datafeed as EExchangeInstance,
            type: EMarketType.unknown,
            tickSize: 0.00001,
            pricePrecision: 5,
            baseInstrument: '',
            dependInstrument: '',
        };
    }

    private _getBacktestTimeFrame(result: IBacktestResultDTO): TradingChartDesigner.ITimeFrame {
        return TradingChartDesigner.TimeFrame.intervalTimeFrame(result.historyParameters.granularity * 1000);
    }

    private _handleThemeChange() {
        if (this.chart) {
            this.chart.theme = this._getTheme();
            this.chart.refreshAsync();
        }
    }

    ngOnDestroy() {
        if (this.chart) {
            this.chart.destroy();
        }
    }
}
