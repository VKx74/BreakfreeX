import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Theme } from "@app/enums/Theme";
import { ThemeService } from "@app/services/theme.service";
import { DataFeedBase } from "@chart/datafeed/DataFeedBase";
import { SonarChartDataFeed } from "@chart/datafeed/SonarChartDataFeed";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";
import { LocalizationService } from "Localization";
import { takeUntil } from "rxjs/operators";

declare let defaultTheme: any;
declare let darkTheme: any;
declare let fintatechDarkTheme: any;

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
    }

    private _init() {
        let theme = this._getTheme();

        this._datafeed.init(false).then(d => {
            const config = {
                chartContainer: this.chartContainer.nativeElement,
                width: '100%',
                height: '100%',
                theme: theme,
                addThemeClass: false,
                // chartType: 'hollowCandle',
                crossHair: "crossBars",
                datafeed: this._datafeed,
                hideScrollToLastBar: true,
                instrument: DataFeedBase.DefaultInstrument,
                // timeFrame: state && state.timeFrame,
                supportedTimeFrames: DataFeedBase.supportedTimeFramesStr,
                locale: this._localizationService.locale,
                showScrollbar: false
            };

            this.chart = $(config.chartContainer).TradingChartDesigner(config);
            this.chart.showInstrumentWatermark = false;
        });
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
}