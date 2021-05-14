import { Component, ElementRef, Inject, Injector, ViewChild } from "@angular/core";
import { Theme } from "@app/enums/Theme";
import { IInstrument } from "@app/models/common/instrument";
import { IdentityService } from "@app/services/auth/identity.service";
import { SignalsDemoBrokerService } from "@app/services/demo.broker/signals-demo-broker.service";
import { EducationalTipsService } from "@app/services/educational-tips.service";
import { InstrumentService } from '@app/services/instrument.service';
import { ThemeService } from "@app/services/theme.service";
import { SaveStateAction } from '@app/store/actions/platform.actions';
import { AppState } from "@app/store/reducer";
import { AlertingFromChartService } from "@chart/services/alerting-from-chart.service";
import { IndicatorDataProviderService } from '@chart/services/indicator-data-provider.service';
import { IndicatorRestrictionService } from '@chart/services/indicator-restriction.service';
import { TradeFromChartService } from '@chart/services/trade-from-chart.service';
import { BaseLayoutItemComponent } from "@layout/base-layout-item.component";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";
import { GoldenLayoutItemState } from "angular-golden-layout";
import { LocalizationService } from "Localization";
import { AlertsService } from "modules/AutoTradingAlerts/services/alerts.service";
import { ChartTrackerService } from 'modules/BreakfreeTrading/services/chartTracker.service';
import { IndicatorAlertHandler } from 'modules/Chart/indicatorAlertHandler/indicatorAlertHandler';
import { takeUntil } from "rxjs/operators";
import { Actions, LinkingAction } from "../../../Linking/models";
import { TimeZoneManager } from "../../../TimeZones/services/timeZone.manager";
import { CalendarEventsDatafeed } from "../../calendarEvents/CalendarEventsDatafeed";
import { DataFeed } from "../../datafeed/DataFeed";
import { DataFeedBase } from "../../datafeed/DataFeedBase";
import { ChartTranslateService } from "../../localization/token";
import { TemplatesDataProviderService } from "../../services/templates-data-provider.service";
import IChartInstrument = TradingChartDesigner.IInstrument;
import ITradeHandlerParams = TradingChartDesigner.ITradeHandlerParams;

export interface ITcdComponentState {
    chartState?: any;
    instrument?: TradingChartDesigner.IInstrument;
    timeFrame?: TradingChartDesigner.ITimeFrame;
}

declare let defaultTheme: any;
declare let darkTheme: any;
declare let fintatechDarkTheme: any;

interface ReplayWaiter {
    instrument: string;
    tf: number;
    date: any;
}

@Component({
    selector: 'tcd',
    templateUrl: 'tcd.component.html',
    styleUrls: ['tcd.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: DataFeedBase,
            useClass: DataFeed
        },
        {
            provide: TranslateService,
            useExisting: ChartTranslateService
        },
        CalendarEventsDatafeed,
        TradeFromChartService,
        AlertingFromChartService
    ]
})
export class TcdComponent extends BaseLayoutItemComponent {
    
    static componentName = 'Trading Chart Designer';
    static previewImgClass = 'crypto-icon-chart';

    private isGuestModeReplayed: boolean;
    private replayWaiter: ReplayWaiter;

    blur: boolean = false;
    chart: TradingChartDesigner.Chart;

    @ViewChild('chartContainer', {static: false}) chartContainer: ElementRef;

    constructor(@Inject(GoldenLayoutItemState) protected _state: ITcdComponentState,
                private _datafeed: DataFeedBase,
                private _themeService: ThemeService,
                private _localizationService: LocalizationService,
                private _educationalTipsService: EducationalTipsService,
                private _translateService: TranslateService,
                private _timeZoneManager: TimeZoneManager,
                private _templateDataProviderService: TemplatesDataProviderService,
                private _instrumentService: InstrumentService,
                private _calendarEventsDatafeed: CalendarEventsDatafeed,
                private _alertsService: AlertsService,
                private _indicatorRestrictionService: IndicatorRestrictionService,
                private _indicatorDataProviderService: IndicatorDataProviderService,
                private _tradingFromChartHandler: TradeFromChartService,
                private _alertingFromChartService: AlertingFromChartService,
                private _chartTrackerService: ChartTrackerService,
                private _store: Store<AppState>,
                private _identity: IdentityService,
                private _demoBroker: SignalsDemoBrokerService,
                protected _injector: Injector) {
        super(_injector);
    }
    
    ngOnInit() {
        TradingChartDesigner.UserAgent.directory.htmlDialogs = '../node_modules/trading-chart-designer/htmldialogs/';
        TradingChartDesigner.UserAgent.directory.localization = '../node_modules/trading-chart-designer/localization/';
        (TradingChartDesigner.SVGLoader as any)._defPath = "../node_modules/trading-chart-designer/img/svg-icons/";

        this._themeService.activeThemeChange$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => this._handleThemeChange());

        this._localizationService.localeChange$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => this._handleLocaleChange());

        this._educationalTipsService.showTipsChange$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => this._handleShowEducationalTipsChange());

        this._timeZoneManager.timeZoneChange$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => {
                this._handleTimeZoneChange();
            });

        // this._goldenLayoutItemComponent.onResize$
        //     .pipe(takeUntil(componentDestroyed(this)))
        //     .subscribe(() => {
        //         this.refreshChartSize();
        //     });
        //
        // this._goldenLayoutItemComponent.onShow$
        //     .pipe(takeUntil(componentDestroyed(this)))
        //     .subscribe(() => {
        //         this.refreshChartSize();
        //     });

        this.setTitle();
        this._initLinking();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.init(this._state);
        }, 1);
    }

    init(state?: ITcdComponentState) {
        let theme = state && state.chartState && state.chartState.chart.theme ? state.chartState.chart.theme : this._getTheme();
        // const instrumentsNeeded = !state || !state.instrument;
        
        if (state && state.chartState) {
            if (state.chartState.version !== 8) {
                console.log("Set default theme");
                theme = this._getTheme();
                if (state.chartState.chart) {
                    state.chartState.chart.theme = theme;
                }
            }
        }

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
                instrument: state ? state.instrument : DataFeedBase.DefaultInstrument,
                timeFrame: state && state.timeFrame,
                supportedTimeFrames: DataFeedBase.supportedTimeFramesStr,
                templateDataProvider: this._templateDataProviderService,
                indicatorsDataProvider: this._indicatorDataProviderService,
                marketEventsDatafeed: this._calendarEventsDatafeed,
                indicatorAlertsHandler: new IndicatorAlertHandler(this._alertsService),
                indicatorsRestrictionsProvider: this._indicatorRestrictionService,
                // helpLinks: this.linksList,
                showHelp: this._educationalTipsService.isTipsShown(),
                locale: this._localizationService.locale,
                tradeHandler: this.tradeHandler.bind(this),
                searchInstrumentHandler: this.searchInstrumentHandler.bind(this),
                tradingFromChartHandler: this._tradingFromChartHandler,
                alertingFromChartHandler: this._alertingFromChartService,
                showScrollbar: false
            };

            this.chart = $(config.chartContainer).TradingChartDesigner(config);
            this.chart.showInstrumentWatermark = false;
            this.chart.calendarEventsManager.visibilityMode = TradingChartDesigner.CalendarEventsVisibilityMode.All;

            if (state && state.chartState) {
                // locale from app
                state.chartState.chart.locale = this._localizationService.locale;
                // state.chartState.chart.theme = this._getTheme();
                this.chart.applyCopy(state.chartState);

                if (this.chart.chartTypeName === "hollowCandle") {
                    console.log("Set default type");
                    this.chart.chartTypeName = "candle";
                }
            }

            (window as any).tcd = this.chart;

            this._subscribeOnChartEvents(this.chart);

            let pane = this.chart.primaryPane;

            if (pane) {
                pane.preserveAutoScaling();
            }

            this.setTitle();

            this.chart.on(TradingChartDesigner.ChartEvent.INDICATOR_ADDED, this.indicatorAdded.bind(this));
            this.chart.on(TradingChartDesigner.ChartEvent.INDICATOR_REMOVED, this.indicatorRemoved.bind(this));
            this.chart.on(TradingChartDesigner.ChartEvent.SETS_DEFAULT_SETTINGS, this.setDefaultSettings.bind(this));
            this.chart.on(TradingChartDesigner.ChartEvent.SAVE_SESSION, this.saveSession.bind(this));
            this.chart.on(TradingChartDesigner.ChartEvent.INSTRUMENT_CHANGED, this.instrumentChanged.bind(this));
            this.chart.on(TradingChartDesigner.ChartEvent.BARS_SETTED, this.barsLoaded.bind(this));

            if (!state) {
                let isProAllowed = this._indicatorRestrictionService.validate(this.chart, TradingChartDesigner.BreakfreeTradingPro.instanceTypeName);
                let isDiscoveryAllowed = this._indicatorRestrictionService.validate(this.chart, TradingChartDesigner.BreakfreeTradingDiscovery.instanceTypeName);

                if (isProAllowed) {
                    this.chart.addIndicators(new TradingChartDesigner.BreakfreeTradingPro());
                } else if (isDiscoveryAllowed) {
                    this.chart.addIndicators(new TradingChartDesigner.BreakfreeTradingDiscovery());
                }

                if ((isProAllowed || isDiscoveryAllowed) && this.chart.RTDMode) {
                    this.chart.addIndicators(new TradingChartDesigner.RTD());
                }
            }

            this._chartTrackerService.addChart(this.chart);
        });
    }

    startReplayMode() {
        if (this.isGuestModeReplayed) {
            return;
        }

        const dates = this.chart.dataContext.dateDataRows.values;
        if (dates.length < 100) {
            return;
        }

        if (!this.isRTDExists()) {
            setTimeout(() => {
                this.startReplayMode();
            }, 1000);
            return;
        }

        this.isGuestModeReplayed = true;
        this.blur = true;
        this.chart.refreshAsync();

        setTimeout(() => {
            this.blur = false;
            setTimeout(() => {
                this._demoBroker.reset();
                this.chart.on(TradingChartDesigner.ChartEvent.BARS_APPENDED, this.barAppended.bind(this));
                this.chart.replayMode.play();
            }, 1000);
        }, 3000); 
        
        setTimeout(() => {
            this.chart.replayMode.replaySpeed = 1000;
            this.chart.setReplayByDate(dates[100], true);
        }, 2000);
    }

    protected isRTDExists() {
        for (const indicator of this.chart.indicators) {
            if (indicator.instanceTypeName === TradingChartDesigner.RTD.instanceTypeName) {
                const payload = (indicator as TradingChartDesigner.RTD).payload;
                if (payload) {
                    return true;
                }
            }
        }
        return false;
    }

    protected indicatorAdded(eventObject: TradingChartDesigner.IValueChangedEvent) {
        console.log("Added");
        const indicator = eventObject.value as TradingChartDesigner.Indicator;
        console.log(eventObject);
        if (!this.chart || this.chart.isDestroyed) {
            return;
        }
    }
    
    protected indicatorRemoved(eventObject: TradingChartDesigner.IValueChangedEvent) {
        console.log("Removed");
        const indicator = eventObject.value as TradingChartDesigner.Indicator;
        console.log(eventObject);
        if (!this.chart || this.chart.isDestroyed) {
            return;
        }
    } 
    
    protected setDefaultSettings(eventObject: TradingChartDesigner.IValueChangedEvent) {
        console.log("Set default");
        if (!this.chart || this.chart.isDestroyed) {
            return;
        }

        this.chart.theme = this._getTheme();
        this.chart.refreshAsync();
    }

    protected saveSession(eventObject: TradingChartDesigner.IValueChangedEvent) {
        this._store.dispatch(new SaveStateAction());
    }

    protected instrumentChanged(eventObject: TradingChartDesigner.IValueChangedEvent) {
        this._tradingFromChartHandler.refresh();
        this._alertingFromChartService.refresh();
    }

    protected barAppended(eventObject: TradingChartDesigner.IValueChangedEvent) {
        let lastBarIndex = this.chart.dataContext.dateDataRows.values.length;
        let lastBar = lastBarIndex > 0 ? this.chart.dataContext.bar(lastBarIndex - 1) : null;
        
        this._demoBroker.appendBar(lastBar);

        for (const indicator of this.chart.indicators) {
            if (indicator.instanceTypeName === TradingChartDesigner.BreakfreeTradingDiscovery.instanceTypeName) {
                const payload = (indicator as TradingChartDesigner.BreakfreeTradingDiscovery).payload;
                const trade = (indicator as TradingChartDesigner.BreakfreeTradingDiscovery).trade;
                if (payload && trade) {
                    this._demoBroker.appendSignal({
                        levels: payload.levels,
                        size: payload.size,
                        trade: payload.trade as any
                    });
                }
            }
        }
    }

    protected barsLoaded(eventObject: TradingChartDesigner.IValueChangedEvent) {
        if (this.replayWaiter) {
            if (this.chart.instrument.id === this.replayWaiter.instrument && this.chart.timeInterval === this.replayWaiter.tf) {

                this.chart.refresh();
                this.chart.refreshIndicators();

                this.chart.setReplayByDate(this.replayWaiter.date);
            }
        }

        this.replayWaiter = null;
        
        this._tradingFromChartHandler.setChart(this.chart);
        this._alertingFromChartService.setChart(this.chart);

        if (this._identity.isGuestMode) {
            setTimeout(() => {
                this.startReplayMode();
            }, 1000);
        }
    }

    protected useDefaultLinker(): boolean {
        return true;
    }

    private searchInstrumentHandler(symbol: string): Promise<IInstrument[]> {
        const self = this;
        return new Promise<IInstrument[]>(function (resolve, reject) {
            self._instrumentService.getInstruments(undefined, symbol).subscribe((instruments: IInstrument[]) => {
                self._datafeed.instruments = instruments;
                resolve(instruments);
            });
        });
    }

    private tradeHandler(params: ITradeHandlerParams) {
    }

    private _subscribeOnChartEvents(chart: TradingChartDesigner.Chart) {
        chart.on(TradingChartDesigner.ChartEvent.INSTRUMENT_CHANGED,
            (e: TradingChartDesigner.IValueChangedEvent) => {
                this._handleChartInstrumentChange(e.value);
            });

        chart.on(TradingChartDesigner.ChartEvent.TIME_FRAME_CHANGED, (e: TradingChartDesigner.IValueChangedEvent) => {
            this._handleChartStateChanged();
        });
        
        chart.on(TradingChartDesigner.ChartEvent.REPLAY_MODE_STOPPED, (e: TradingChartDesigner.IValueChangedEvent) => {
            this._replayModeFinished();
        });

        chart.on(this._getChartStateChangedEvents(), (e) => {
            this._handleChartStateChanged();
        });
    }
    private _getChartStateChangedEvents(): string {
        return [
            TradingChartDesigner.ChartEvent.INSTRUMENT_CHANGED,
            TradingChartDesigner.ChartEvent.TIME_FRAME_CHANGED,
            TradingChartDesigner.ChartEvent.INDICATOR_ADDED,
            TradingChartDesigner.ChartEvent.INDICATOR_REMOVED,
            TradingChartDesigner.PaneEvent.SHAPE_ADDED,
            TradingChartDesigner.PaneEvent.THEME_CHANGED,
            TradingChartDesigner.PaneEvent.SHAPE_REMOVED,
            TradingChartDesigner.ChartEvent.CHART_TYPE_CHANGED,
            TradingChartDesigner.ChartEvent.CROSS_HAIR_CHANGED,
            TradingChartDesigner.ChartEvent.THEME_CHANGED,
            TradingChartDesigner.ChartEvent.GLOBAL_THEME_CHANGED
        ].join(' ');
    }

    private _initLinking() {
        this.linker.onAction((action: LinkingAction) => {
            if (action.type === Actions.ChangeInstrument) {
                if (this.chart) {
                    const chart = this.chart;
                    const instrument = action.data as IChartInstrument;
                    const chartInstrument = chart.instrument;

                    if (!instrument) {
                        return;
                    }

                    if (chartInstrument.symbol !== instrument.symbol || chartInstrument.exchange !== instrument.exchange) {

                        chart.instrument = Object.assign({}, instrument);
                        chart.sendBarsRequest();
                    }
                }
            } else if (action.type === Actions.ChangeInstrumentAndTimeframe) {
                if (this.chart) {
                    const chart = this.chart;
                    const replayDate = action.data.replayDate;
                    const instrument = action.data.instrument as IChartInstrument;
                    const timeInterval = (action.data.timeframe as number) * 1000;
                    const chartInstrument = chart.instrument;

                    if (!instrument) {
                        return;
                    }
                    
                    if (chartInstrument.symbol !== instrument.symbol || chartInstrument.exchange !== instrument.exchange || chart.timeInterval !== timeInterval) {

                        chart.switchOffReplayMode();
                        chart.refresh();
                        chart.refreshIndicators();

                        chart.instrument = Object.assign({}, instrument);
                        chart.timeFrame = TradingChartDesigner.TimeFrame.intervalTimeFrame(timeInterval);

                        if (replayDate) {
                            this.replayWaiter = {
                                instrument: instrument.id,
                                tf: timeInterval,
                                date: replayDate
                            };
                        }
                        chart.sendBarsRequest();
                    } else {
                        if (replayDate) {
                            chart.setReplayByDate(replayDate);
                        } else {
                            chart.switchOffReplayMode();
                        }
                    }
                }
            }
        });
    }

    private _sendInstrumentChange(instrument: IChartInstrument) {
        const linkAction: LinkingAction = {
            type: Actions.ChangeInstrument,
            data: instrument
        };
        this.linker.sendAction(linkAction);
    }

    private _getTheme(): any {
        switch (this._themeService.activeTheme) {
            case Theme.Dark:
                return fintatechDarkTheme;
            case Theme.Light:
                // return fintatech;
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

    private _handleLocaleChange() {
        if (this.chart) {
            this.chart.locale = this._localizationService.locale;
            this.chart.refreshAsync(true);
            // this.setTitle();
        }
    }

    private _handleShowEducationalTipsChange() {
        if (this.chart) {
            // this.chart.showHelp = this._educationalTipsService.isTipsShown();
            this.chart.refreshAsync(true);
        }
    }

    private _handleTimeZoneChange() {
        if (this.chart) {
            // temp solution

            (this.chart as any)._newBarsRequest = {
                name: TradingChartDesigner.RequestName.BARS,
                count: TradingChartDesigner.DEFAULT_MORE_BARS_COUNT,
                endDate: null
            };

            this.chart.dataContext.clearBarDataRows(this.chart.instrument);
            this.chart.sendBarsRequest();
        }
    }

    private _handleChartInstrumentChange(instrument: IChartInstrument) {
        this._sendInstrumentChange(instrument);
        this.setTitle();
        // this._handleChartStateChanged();
    }

    private _replayModeFinished() {
        if (this._identity.isGuestMode) {
            this.chart.removeIndicators();
            this.chart.removeShapes();
            this.chart.off(TradingChartDesigner.ChartEvent.BARS_APPENDED);
        }
    }

    private _handleChartStateChanged() {
        this.fireStateChanged();
    }

    protected getComponentState(): ITcdComponentState {
        return {
            chartState: this.chart.retrieveCopy(),
            instrument: this.chart.instrument,
            timeFrame: this.chart.timeFrame
        } as ITcdComponentState;
    }

    private refreshChartSize() {
        if (this.chart) {
            this.chart.refreshAsync();
        }
    }

    setTitle() {
        super.setTitle(
            this._translateService.stream('chartComponentTitle', {
                symbol: this.chart ? this.chart.instrument.symbol : ''
            })
        );
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        try {
            this._chartTrackerService.removeChart(this.chart);
            if (this.chart) {
                this.chart.off(TradingChartDesigner.ChartEvent.INDICATOR_ADDED);
                this.chart.off(TradingChartDesigner.ChartEvent.INSTRUMENT_CHANGED);
                this.chart.off(TradingChartDesigner.ChartEvent.TIME_FRAME_CHANGED);
                this.chart.off(TradingChartDesigner.ChartEvent.REPLAY_MODE_STOPPED);
                this.chart.off(TradingChartDesigner.ChartEvent.INDICATOR_REMOVED);
                this.chart.off(TradingChartDesigner.ChartEvent.SETS_DEFAULT_SETTINGS);
                this.chart.off(TradingChartDesigner.ChartEvent.SAVE_SESSION);
                this.chart.off(TradingChartDesigner.ChartEvent.BARS_SETTED);
                this.chart.destroy();
            }
        } catch (e) {
            console.log(e);
        } 
        
        try {
            this._tradingFromChartHandler.dispose();
        } catch (e) {
            console.log(e);
        }

        try {
            this._alertingFromChartService.dispose();
        } catch (e) {
            console.log(e);
        }
    }
}
