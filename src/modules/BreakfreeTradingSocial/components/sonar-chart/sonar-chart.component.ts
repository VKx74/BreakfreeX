import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { Theme } from "@app/enums/Theme";
import { IInstrument } from "@app/models/common/instrument";
import { ThemeService } from "@app/services/theme.service";
import { DataFeedBase } from "@chart/datafeed/DataFeedBase";
import { IndicatorDataProviderService, SonarChartIndicatorDataProviderService } from "@chart/services/indicator-data-provider.service";
import { TradeFromChartService } from "@chart/services/trade-from-chart.service";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";
import { LocalizationService } from "Localization";
import { takeUntil } from "rxjs/operators";

declare var ResizeObserver;
declare let defaultTheme: any;
declare let fintatechDarkTheme: any;

class RestrictionManager {
    getRestrictions(chart: TradingChartDesigner.Chart): string[] {
        return [];
    }
    canRunStrategyReplay(chart: TradingChartDesigner.Chart): boolean {
        return true;
    }
    canRunXModeReplay(chart: TradingChartDesigner.Chart): boolean {
        return true;
    }
}

@Component({
    selector: 'sonar-chart',
    templateUrl: './sonar-chart.component.html',
    styleUrls: ['./sonar-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        TradeFromChartService
    ]
})
export class SonarChartComponent implements OnInit {
    private _visibleCount = 140;
    private _visibleCountRatio = 0.6;
    private _isVisible: boolean;
    private _initialized: boolean;
    private _attached: boolean;
    private _detachedHost: any;
    private _sizeChangeObserver: any;

    private chart: TradingChartDesigner.Chart;

    @ViewChild('chartContainer', { static: false }) chartContainer: ElementRef;
    @ViewChild('chartContainerHost', { static: false }) chartContainerHost: ElementRef;

    @Input() public instrument: IInstrument;
    @Input() public granularity: number;
    @Input() public time: number;

    @Input() public set isVisible(value: boolean) {
        this._isVisible = value;

        if (this._isVisible) {
            if (!this.chart) {
                this._initChart();
            } else {
                this._attachChart();
            }
        } else {
            this._detachChart();
        }
    }

    constructor(private _datafeed: DataFeedBase,
        private _themeService: ThemeService,
        private host: ElementRef,
        private _indicatorDataProviderService: SonarChartIndicatorDataProviderService,
        private _localizationService: LocalizationService,
        private _tradingFromChartHandler: TradeFromChartService,
        protected _cdr: ChangeDetectorRef) {
        this._themeService.activeThemeChange$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => this._handleThemeChange());
    }

    ngOnInit() {
        this._sizeChangeObserver = new ResizeObserver(entries => {
            if (this.chart) {
                this.chart.refresh();
            }
            this._cdr.detectChanges();
        });
        this._sizeChangeObserver.observe(this.host.nativeElement);
    }

    ngAfterViewInit() {
        this._initialized = true;
        this._initChart();
    }

    ngOnDestroy() {
        try {
            if (this.chart) {
                this.chart.off(TradingChartDesigner.ChartEvent.BARS_SETTED);
                this.chart.destroy();
                this.chart = null;
            }
            if (this._sizeChangeObserver) {
                this._sizeChangeObserver.unobserve(this.host.nativeElement);
            }
        } catch (e) {
            console.log(e);
        }

        try {
            this._tradingFromChartHandler.dispose();
        } catch (e) {
            console.log(e);
        }
    }

    private _detachChart() {
        if (!this.chart || !this._attached || this._detachedHost) {
            return;
        }
        this._detachedHost = $(this.chartContainer.nativeElement).detach();
        this._attached = false;
    }

    private _attachChart() {
        if (!this.chart || this._attached || !this._detachedHost) {
            return;
        }

        this._detachedHost.appendTo($(this.chartContainerHost.nativeElement));
        this._detachedHost = null;
        this._attached = true;
        this.chart.refreshAsync(true);
    }

    private _initChart() {
        if (!this.instrument || !this.granularity || !this.time) {
            return;
        }

        if (!this._initialized || !this._isVisible || this.chart) {
            return;
        }

        let theme = this._clone(this._getTheme());
        let fontSize = 8;
        let timeFrame = TradingChartDesigner.TimeFrame.intervalTimeFrame(this.granularity * 1000);

        theme.pane.title.fontSize = fontSize;
        theme.pane.title.fontSize = fontSize;
        theme.scaleVertical.text.fontSize = fontSize;
        theme.scaleVertical.scaleVerticalFloatingLabel.text.fontSize = fontSize;
        theme.scaleHorizontal.text.fontSize = fontSize;
        theme.scaleHorizontal.scaleHorizontalFloatingLabel.text.fontSize = fontSize;

        const config = {
            chartContainer: this.chartContainer.nativeElement,
            showToolbar: false,
            theme: theme,
            addThemeClass: false,
            // chartType: 'hollowCandle',
            // crossHair: "crossBars",
            datafeed: this._datafeed,
            hideScrollToLastBar: true,
            instrument: this.instrument,
            timeFrame: timeFrame,
            supportedTimeFrames: DataFeedBase.supportedTimeFramesStr,
            locale: this._localizationService.locale,
            showScrollbar: false,
            indicatorsDataProvider: this._indicatorDataProviderService,
            isRestrictedMode: true,
            indicatorsRestrictionsProvider: new RestrictionManager(),
            tradingFromChartHandler: this._tradingFromChartHandler
        };

        this.chart = $(config.chartContainer).TradingChartDesigner(config);
        this.chart.showInstrumentWatermark = false;
        this.chart.on(TradingChartDesigner.ChartEvent.BARS_SETTED, this.barAppended.bind(this));
    }

    private _clone(object: any): any {
        return JSON.parse(JSON.stringify(object));
    }

    private _getTheme(): any {
        switch (this._themeService.activeTheme) {
            case Theme.Dark:
                return fintatechDarkTheme;
            case Theme.Light:
            default:
                return defaultTheme;
        }
    }

    private _handleThemeChange() {
        if (this.chart) {
            this.chart.theme = this._getTheme();
            this.chart.refreshAsync();
        }
    }

    protected barAppended(eventObject: TradingChartDesigner.IValueChangedEvent) {
        if (!this.chart) {
            return;
        }

        this._cdr.detectChanges();
        try {
            this.chart.setReplayByDate(new Date(this.time * 1000), true);
        } catch (error) {
            console.error(error);
            return;
        }
        let barsCount = this.chart.primaryBarDataRows().low.length;
        let visibleCount = this._visibleCount;
        if (barsCount < visibleCount) {
            visibleCount = barsCount;
        }
        if (barsCount > 0) {
            this.chart.firstVisibleRecord = barsCount - visibleCount;
            this.chart.lastVisibleRecord = barsCount + (visibleCount * this._visibleCountRatio);
        }

        let pane = this.chart.primaryPane;
        pane.preserveAutoScaling();
        this.chart.autoScalePanes(TradingChartDesigner.AutoScalePanesKind.PanesWithPreservingAutoScaling);

        const indicator = new TradingChartDesigner.BreakfreeTradingPro();
        this.chart.addIndicators(indicator);
        this.chart.XMode = false;
        this.chart.crossHair.destroy();
        this.chart.refreshAsync(true);
        this._attached = true;

        this._tradingFromChartHandler.setChart(this.chart);
    }
}