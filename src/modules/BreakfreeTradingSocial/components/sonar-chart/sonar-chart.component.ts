import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Theme } from "@app/enums/Theme";
import { ThemeService } from "@app/services/theme.service";
import { DataFeedBase } from "@chart/datafeed/DataFeedBase";
import { SonarChartDataFeed } from "@chart/datafeed/SonarChartDataFeed";
import { IndicatorDataProviderService } from "@chart/services/indicator-data-provider.service";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";
import { LocalizationService } from "Localization";
import { takeUntil } from "rxjs/operators";

declare let defaultTheme: any;
declare let darkTheme: any;
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
    providers: [
        {
            provide: DataFeedBase,
            useClass: SonarChartDataFeed
        }
    ]
})
export class SonarChartComponent implements OnInit {
    private chart: TradingChartDesigner.Chart;

    @ViewChild('chartContainer', { static: false }) chartContainer: ElementRef;

    constructor(private _datafeed: DataFeedBase,
        private _themeService: ThemeService,
        private _indicatorDataProviderService: IndicatorDataProviderService,
        private _localizationService: LocalizationService) {
        this._themeService.activeThemeChange$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => this._handleThemeChange());
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this._init();
        }, 1);
    }

    ngOnDestroy() {
        try {
            if (this.chart) {
                this.chart.off(TradingChartDesigner.ChartEvent.BARS_SETTED);
                this.chart.destroy();
            }
        } catch (e) {
            console.log(e);
        }
    }

    private _init() {
        let theme = this._clone(this._getTheme());
        let fontSize = 8;

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
            instrument: DataFeedBase.DefaultInstrument,
            // timeFrame: state && state.timeFrame,
            supportedTimeFrames: DataFeedBase.supportedTimeFramesStr,
            locale: this._localizationService.locale,
            showScrollbar: false,
            indicatorsDataProvider: this._indicatorDataProviderService,
            isRestrictedMode: true,
            indicatorsRestrictionsProvider: new RestrictionManager()
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
        try {
            this.chart.setReplayByDate(new Date('05/26/2021'), true);
        } catch (error) {
            console.error(error);
            return;
        }
        let barsCount = this.chart.primaryBarDataRows().low.length;
        let visibleCount = 150;
        if (barsCount < visibleCount) {
            visibleCount = barsCount;
        }
        if (barsCount > 0) {
            this.chart.firstVisibleRecord = barsCount - visibleCount;
            this.chart.lastVisibleRecord = barsCount + (visibleCount * 0.6);
        }

        let pane = this.chart.primaryPane;
        pane.preserveAutoScaling();
        this.chart.autoScalePanes(TradingChartDesigner.AutoScalePanesKind.PanesWithPreservingAutoScaling);

        const indicator = new TradingChartDesigner.BreakfreeTradingPro();
        this.chart.addIndicators(indicator);
        this.chart.XMode = false;
        this.chart.refreshAsync(true);
    }
}