import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Injector, ViewChild } from "@angular/core";
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
import { ReplayModeSync } from "@chart/services/replay-mode-sync.service";
import { TradeFromChartService } from '@chart/services/trade-from-chart.service';
import { BaseGoldenLayoutItemComponent } from "@layout/base-golden-layout-item.component";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";
import { GoldenLayoutItemState } from "angular-golden-layout";
import { LocalizationService } from "Localization";
import { AlertsService } from "modules/AutoTradingAlerts/services/alerts.service";
import { ChartTrackerService } from 'modules/BreakfreeTrading/services/chartTracker.service';
import { IndicatorAlertHandler } from 'modules/Chart/indicatorAlertHandler/indicatorAlertHandler';
import { OrderSide } from "modules/Trading/models/models";
import { takeUntil } from "rxjs/operators";
import { Actions, LinkingAction } from "../../../Linking/models";
import { TimeZoneManager } from "../../../TimeZones/services/timeZone.manager";
import { CalendarEventsDatafeed } from "../../calendarEvents/CalendarEventsDatafeed";
import { DataFeed } from "../../datafeed/DataFeed";
import { DataFeedBase } from "../../datafeed/DataFeedBase";
import { ChartTranslateService } from "../../localization/token";
import { TemplatesDataProviderService } from "../../services/templates-data-provider.service";
import { MatDialog } from '@angular/material/dialog';
import IChartInstrument = TradingChartDesigner.IInstrument;
import ITradeHandlerParams = TradingChartDesigner.ITradeHandlerParams;
import { CheckoutComponent } from "modules/BreakfreeTrading/components/checkout/checkout.component";
import { HighlightService } from "@app/services/highlight/highlight.service";
import { BrokerService } from "@app/services/broker.service";
import { of, Subscription } from "rxjs";
import { MTBroker } from "@app/services/mt/mt.broker";
import { PlatformInstrumentsDataProvider } from "./PlatformInstrumentsDataProvider";
import { IHistoryRequest } from "@app/models/common/historyRequest";
import { IPeriodicity } from "@app/models/common/periodicity";
import { IHistoryResponse } from "@app/models/common/historyResponse";
import { IBarData } from "@app/models/common/barData";
import { BinanceFuturesCoinBroker } from "@app/services/binance-futures/binance-futures-coin.broker";
import { BinanceFuturesUsdBroker } from "@app/services/binance-futures/binance-futures-usd.broker";
import { BinanceFuturesBroker } from "@app/services/binance-futures/binance-futures.broker";
import { BinanceBroker } from "@app/services/binance/binance.broker";
import { ITradeTick } from "@app/models/common/tick";
import { R } from "@angular/cdk/keycodes";

export interface ITcdComponentState {
    chartState?: any;
    instrument?: TradingChartDesigner.IInstrument;
    timeFrame?: TradingChartDesigner.ITimeFrame;
}

declare let defaultTheme: any;
declare let BreakfreeTheme: any;
declare var ResizeObserver;

interface ReplayWaiter {
    instrument: string;
    tf: number;
    date: any;
}

@Component({
    selector: 'tcd',
    templateUrl: 'tcd.component.html',
    styleUrls: ['tcd.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
export class TcdComponent extends BaseGoldenLayoutItemComponent {

    static componentName = 'Trading Chart Designer';
    static previewImgClass = 'crypto-icon-chart';

    private replayModeTimers: any[] = [];
    private replayWaiter: ReplayWaiter;
    private brokerStateChangedSubscription: Subscription;
    private handleBrokerConnectTimeout: any;
    private handleSetBALinesTimeout: any;
    private marketSubscription: Subscription;

    private _priceTickerContainerClass = "price-ticker-container";
    private _priceDirectionClass = "price-direction";
    private _currentPriceClass = "current-price";
    private _priceChangeClass = "price-change";
    private _insertAfterElementClass = "lm_title";

    private _priceDirectionElement: HTMLDivElement;
    private _currentPriceElement: HTMLDivElement;
    private _priceChangeElement: HTMLDivElement;
    private _detachedElement: JQuery<HTMLElement>;
    private _headerUpdateTimer;
    private _hourlyPriceCache: { [instrumentHash: string]: IBarData[] } = {};
    private _sizeChangeObserver: any;
    private _barsSet: boolean;
    private _trySetBACounter: number = 0;

    blur: boolean = false;
    chart: TradingChartDesigner.Chart;

    @ViewChild('chartContainer', { static: false }) chartContainer: ElementRef;
    @ViewChild('chartComponentContainer', { static: false }) chartComponentContainer: ElementRef;

    public get isDetached(): boolean {
        return !!this._detachedElement;
    }

    constructor(@Inject(GoldenLayoutItemState) protected _state: ITcdComponentState,
        private _ref: ChangeDetectorRef,
        private _datafeed: DataFeedBase,
        private _themeService: ThemeService,
        private _localizationService: LocalizationService,
        private _educationalTipsService: EducationalTipsService,
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
        private _dialog: MatDialog,
        private _highlightService: HighlightService,
        private _brokerService: BrokerService,
        protected _injector: Injector) {
        super(_injector);
        if (this._identity.isGuestMode) {
            ReplayModeSync.IsChartReplay = true;
        }
        if (this._identity.isAdmin) {
            DataFeedBase.MAX_BARS_PER_CHART = 5000;
        }
        super.setTitle(of("Loading"));
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
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.init(this._state);
            this._ref.detach();
        }, 1);
    }

    init(state?: ITcdComponentState) {
        this.linker.setDefaultLinking(true);

        let theme = state && state.chartState && state.chartState.chart.theme ? state.chartState.chart.theme : this._getTheme();

        if (state && state.chartState) {
            if (state.chartState.version !== 9) {
                console.log("Set default theme");
                theme = this._getTheme();
                if (state.chartState.chart) {
                    state.chartState.chart.theme = theme;
                }
            }
        } else {
        }

        this._datafeed.init(false).then(d => {
            const config = {
                chartContainer: this.chartContainer.nativeElement,
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
                showScrollbar: false,
                instrumentsDataProvider: new PlatformInstrumentsDataProvider(this._dialog)
            };

            this.chart = $(config.chartContainer).TradingChartDesigner(config);
            this.chart.showInstrumentWatermark = false;
            this.chart.calendarEventsManager.visibilityMode = TradingChartDesigner.CalendarEventsVisibilityMode.All;
            this.chart.isAuthorizedCustomer = this._identity.isAuthorizedCustomer;
            this.chart.isAdmin = this._identity.isAdmin;
            this.chart.showAllIndicators = this._identity.isAdmin;
            this.chart.simpleBFTIndicatorView = !this._identity.isAdmin;

            if (state && state.chartState) {
                // locale from app
                state.chartState.chart.locale = this._localizationService.locale;
                // state.chartState.chart.theme = this._getTheme();
                this.chart.applyCopy(state.chartState);

                if (this.chart.chartTypeName === "hollowCandle") {
                    console.log("Set default type");
                    this.chart.chartTypeName = "candle";
                }
            } else {
                let globalChartState = this._chartTrackerService.chartOptions;
                if (globalChartState) {
                    this.chart.setChartSettingsOptions(globalChartState);
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
            this.chart.on(TradingChartDesigner.ChartEvent.GLOBAL_THEME_CHANGED, this.themeChanged.bind(this));

            if (!state || !state.chartState) {
                let isMLAllowed = this._indicatorRestrictionService.validate(this.chart, TradingChartDesigner.BreakfreeTradingML.instanceTypeName);
                let isProAllowed = this._indicatorRestrictionService.validate(this.chart, TradingChartDesigner.BreakfreeTradingPro.instanceTypeName);
                let isDiscoveryAllowed = this._indicatorRestrictionService.validate(this.chart, TradingChartDesigner.BreakfreeTradingDiscovery.instanceTypeName);
                let isStarterAllowed = this._indicatorRestrictionService.validate(this.chart, TradingChartDesigner.BreakfreeTradingStarter.instanceTypeName);

                if (isMLAllowed) {
                    this.chart.addIndicators(new TradingChartDesigner.BreakfreeTradingML());
                } else {
                    if (isProAllowed) {
                        this.chart.addIndicators(new TradingChartDesigner.BreakfreeTradingPro());
                    } else if (isDiscoveryAllowed) {
                        this.chart.addIndicators(new TradingChartDesigner.BreakfreeTradingDiscovery());
                    } else if (isStarterAllowed) {
                        this.chart.addIndicators(new TradingChartDesigner.BreakfreeTradingStarter());
                    }
                    
                    if ((isProAllowed || isDiscoveryAllowed || isStarterAllowed) && this.chart.RTDMode) {
                        this.chart.addIndicators(new TradingChartDesigner.RTD());
                    }
                }

                this.chart.addIndicators(new TradingChartDesigner.TradingSessions());
            }

            this._chartTrackerService.addChart(this.chart);
            this._chartTrackerService.addChartComponent(this);

            this.brokerStateChangedSubscription = this._brokerService.activeBroker$.subscribe((data) => {
                this._handleBrokerConnected();
            });

            this._headerUpdateTimer = setInterval(() => {
                this._setTitlePrice();
            }, 2000);

            this._sizeChangeObserver = new ResizeObserver(entries => {
                if (!this.chart || this.isDetached || !this._barsSet) {
                    return;
                }

                this.chart.refresh();
                this.chart.refresh();
            });
            this._sizeChangeObserver.observe(this.chartContainer.nativeElement);

            this._setBALines();
        });
    }

    private _setLinkerColor() {
        const colors = this.linker.getLinkingColors();
        const charts = this._chartTrackerService.availableCharts;
        if (charts.length >= colors.length) {
            this.linker.setLinking(null);
            return;
        }
        const neededColorId = charts.length % colors.length;
        this.linker.setLinking(colors[neededColorId]);
    }

    private _setBALines() {
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
            this.marketSubscription = null;
        }

        if (this.chart.isDestroyed) {
            return;
        }

        if (this.handleSetBALinesTimeout) {
            clearTimeout(this.handleSetBALinesTimeout);
            this.handleSetBALinesTimeout = null;
        }

        let tryAgain = false;
        let instrument: IInstrument = null;
        if (!this._brokerService.activeBroker || !this._brokerService.isMappingLoaded) {
            tryAgain = true;
        } else {
            instrument = this._brokerService.activeBroker.instrumentToBrokerFormat(this.chart.instrument.id);
            if (!instrument) {
                tryAgain = true;
            }
        }

        if (tryAgain) {
            if (this._trySetBACounter > 10) {
                this._trySetBACounter = 0;
                return;
            }
            this.handleSetBALinesTimeout = setTimeout(() => {
                this._trySetBACounter++;
                this._setBALines();
            }, 3000);
            return;
        }

        this._trySetBACounter = 0;

        this.marketSubscription = this._brokerService.activeBroker.subscribeToTicks(instrument.id, (tick: ITradeTick) => {
            if (tick.symbol !== instrument.id) {
                return;
            }

            this._setTick(tick);
        });
    }

    private _setTick(tick: ITradeTick) {
        if (this.chart.isDestroyed) {
            return;
        }

        const drawings = this.chart.primaryPane.shapes;
        let amountOfExistingShapes = 0;

        for (const drawing of drawings) {
            if (!(drawing instanceof TradingChartDesigner.ShapeRealtimePriceLine)) {
                continue;
            }
            amountOfExistingShapes++;
            const priceLine = drawing as TradingChartDesigner.ShapeRealtimePriceLine;
            if (priceLine.isBelow) {
                priceLine.visualDataPoints[0].value = tick.bid;
            } else {
                priceLine.visualDataPoints[0].value = tick.ask;
            }
        }

        if (amountOfExistingShapes !== 2) {
            this._removePriceLines();
            this._addPriceLines(tick);
        }
    }

    private _addPriceLines(tick: ITradeTick) {
        const bidLine = new TradingChartDesigner.ShapeRealtimePriceLine();
        bidLine.visualDataPoints[0].value = tick.bid;
        // bidLine.text = tick.bid.toString();
        bidLine.lineWidth = 0;
        bidLine.isBelow = true;
        bidLine.selectable = false;
        bidLine.savable = false;
        bidLine.removable = false;
        bidLine.hoverable = false;
        // bidLine.showScaleVerticalFloatingLabel = false;
        bidLine.locked = true;
        bidLine.theme = {
            line: {
                lineStyle: "dash",
                strokeColor: "#ff000099"
            },
            text: {
                strokeColor: "#ff000099"
            }
        };

        const askLine = new TradingChartDesigner.ShapeRealtimePriceLine();
        askLine.visualDataPoints[0].value = tick.ask;
        // askLine.text = tick.ask.toString();
        askLine.lineWidth = 0;
        askLine.isBelow = false;
        askLine.selectable = false;
        askLine.savable = false;
        askLine.removable = false;
        askLine.hoverable = false;
        // askLine.showScaleVerticalFloatingLabel = false;
        askLine.locked = true;
        askLine.theme = {
            line: {
                lineStyle: "dash",
                strokeColor: "#00ff0099"
            },
            text: {
                strokeColor: "#00ff0099"
            }
        };

        this.chart.primaryPane.addShapes([bidLine, askLine]);
    }

    private _removePriceLines() {
        const drawings = this.chart.primaryPane.shapes;
        const shapesForRemoving = [];

        for (const drawing of drawings) {
            if (!(drawing instanceof TradingChartDesigner.ShapeRealtimePriceLine)) {
                continue;
            }

            drawing.locked = false;
            drawing.selectable = true;
            drawing.removable = true;
            shapesForRemoving.push(drawing);
        }

        if (shapesForRemoving && shapesForRemoving.length) {
            this.chart.primaryPane.removeShapes(shapesForRemoving);
        }
    }

    private _handleBrokerConnected() {
        if (!this._brokerService.activeBroker) {
            this._removePriceLines();
        }

        this._setBALines();

        if (this._brokerService.activeBroker instanceof MTBroker) {
            const account = (this._brokerService.activeBroker as MTBroker).accountInfo;
            if (account.Balance) {
                this._refreshBFTIndicators();
                return;
            }
        } else if (this._brokerService.activeBroker instanceof BinanceFuturesUsdBroker || this._brokerService.activeBroker instanceof BinanceFuturesCoinBroker) {
            const broker = this._brokerService.activeBroker as BinanceFuturesBroker;
            if (broker.assets && broker.assets.length) {
                this._refreshBFTIndicators();
                return;
            }
        } else if (this._brokerService.activeBroker instanceof BinanceBroker) {
            const broker = this._brokerService.activeBroker as BinanceBroker;
            if (broker.funds && broker.funds.length) {
                this._refreshBFTIndicators();
                return;
            }
        } else {
            this._refreshBFTIndicators();
            return;
        }

        this.handleBrokerConnectTimeout = setTimeout(() => { this._handleBrokerConnected(); }, 1000);
    }

    private _refreshBFTIndicators() {
        for (const indicator of this.chart.indicators) {
            if (indicator instanceof TradingChartDesigner.BreakfreeTradingIndicatorBase) {
                try {
                    (indicator as TradingChartDesigner.BreakfreeTradingIndicatorBase).calculate(true);
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }

    startReplayMode() {
        const dates = this.chart.dataContext.dateDataRows.values;
        if (dates.length < 100) {
            return;
        }

        if (!this.isRTDExists()) {
            const timerId = setTimeout(() => {
                this.startReplayMode();
            }, 1000);
            this.replayModeTimers.push(timerId);
            return;
        }

        this._highlightService.highlightBacktestChart();

        this.blur = true;
        this.chart.refreshAsync();

        const timerId1 = setTimeout(() => {
            this.blur = false;
            const timerId2 = setTimeout(() => {
                this._demoBroker.reset();
                this.chart.on(TradingChartDesigner.ChartEvent.BARS_APPENDED, this.barAppended.bind(this));
                this.chart.replayMode.play();
            }, 1000);
            const timerId3 = setTimeout(() => {
                this._highlightService.highlightBottomPanel(1000 * 15);
            }, 10000);

            this.replayModeTimers.push(timerId2);
            this.replayModeTimers.push(timerId3);
        }, 3000);

        this.replayModeTimers.push(timerId1);

        const timerId4 = setTimeout(() => {
            this.chart.replayMode.replaySpeed = 250;
            this.chart.setReplayByDate(dates[100], true);
        }, 1500);
        this.replayModeTimers.push(timerId4);
    }

    detach() {
        if (!this.chartContainer || this._detachedElement) {
            return;
        }

        if (this.chart.isDestroyed) {
            return;
        }

        this.chart.preventRefresh = true;
        this._detachedElement = $(this.chartContainer.nativeElement).detach();
        this._ref.detectChanges();
    }

    attach() {
        if (!this._detachedElement) {
            return;
        }

        if (this.chart.isDestroyed) {
            return;
        }

        this._detachedElement.appendTo($(this.chartComponentContainer.nativeElement));
        this._detachedElement = null;
        this._ref.detectChanges();
        this.chart.preventRefresh = false;
        this.chart.refreshAsync();
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
        this.themeChanged();
    }

    protected saveSession(eventObject: TradingChartDesigner.IValueChangedEvent) {
        this._store.dispatch(new SaveStateAction());
    }

    protected instrumentChanged(eventObject: TradingChartDesigner.IValueChangedEvent) {
        this._removePriceLines();
        this._setBALines();
        this._tradingFromChartHandler.refresh();
        this._alertingFromChartService.refresh();
    }

    protected barAppended(eventObject: TradingChartDesigner.IValueChangedEvent) {
        let lastBarIndex = this.chart.dataContext.dateDataRows.values.length;
        let lastBar = lastBarIndex > 0 ? this.chart.dataContext.bar(lastBarIndex - 1) : null;
        if (lastBar.date.getTime() >= ReplayModeSync.ReplayModeEndTime) {
            this.chart.replayMode.stopReplayMode();
            this.chart.replayMode.toRealTime();
            return;
        }

        this._demoBroker.appendBar(lastBar);

        for (const indicator of this.chart.indicators) {
            if (indicator.instanceTypeName === TradingChartDesigner.BreakfreeTradingDiscovery.instanceTypeName) {
                const payload = (indicator as TradingChartDesigner.BreakfreeTradingDiscovery).payload;
                const trade = (indicator as TradingChartDesigner.BreakfreeTradingDiscovery).trade;
                if (payload && trade) {
                    this._demoBroker.appendSignal({
                        levels: payload.levels,
                        size: payload.size,
                        trade: payload.trade as any,
                        id: new Date().getTime()
                    });
                }
            }
        }

        const shapes = this.chart.primaryPane.shapes;
        const shapeForRemoving = [];
        const shapeForAdding = [];
        for (const shape of shapes) {
            if (shape instanceof TradingChartDesigner.ShapeOrderLine) {
                shape.locked = false;
                shape.selectable = true;
                shape.removable = true;
                shapeForRemoving.push(shape);
            }
        }

        for (const order of this._demoBroker.pendingOrders) {
            const shape = this.createLine();
            shape.linePrice = order.Price;
            shape.lineType = "pending";
            shape.lineId = `${order.Id}${order.Price}`;
            shapeForAdding.push(shape);

            // const shapeSL = this.createLine();
            // shapeSL.linePrice = order.SL;
            // shapeSL.lineType = "sl";
            // shapeSL.lineId = `sl_${order.Id}${order.Price}`;
            // shapeForAdding.push(shapeSL);

            // const shapeTP = this.createLine();
            // shapeTP.linePrice = order.TP;
            // shapeTP.lineType = "tp";
            // shapeTP.lineId = `tp_${order.Id}${order.Price}`;
            // shapeForAdding.push(shapeTP);
        }

        for (const order of this._demoBroker.filledOrders) {
            const shape = this.createLine();
            shape.linePrice = order.Price;
            shape.lineType = order.Side === OrderSide.Buy ? "position_buy" : "position_sell";
            shape.lineId = `price_${order.Id}${order.Price}`;
            shape.boxText = order.NetPL ? order.NetPL.toFixed(2) : "-";
            shapeForAdding.push(shape);

            const shapeSL = this.createLine();
            shapeSL.linePrice = order.SL;
            shapeSL.lineType = "sl";
            shapeSL.lineId = `sl_${order.Id}${order.Price}`;
            shapeForAdding.push(shapeSL);

            const shapeTP = this.createLine();
            shapeTP.linePrice = order.TP;
            shapeTP.lineType = "tp";
            shapeTP.lineId = `tp_${order.Id}${order.Price}`;
            shapeForAdding.push(shapeTP);
        }

        if (shapeForRemoving.length) {
            this.chart.primaryPane.removeShapes(shapeForRemoving);
        }

        if (shapeForAdding.length) {
            this.chart.primaryPane.addShapes(shapeForAdding);
        }
    }

    protected createLine(): TradingChartDesigner.ShapeOrderLine {
        const shape = new TradingChartDesigner.ShapeOrderLine();
        shape.showClose = false;
        shape.isEditable = false;
        shape.showSLTP = false;
        return shape;
    }

    protected barsLoaded(eventObject: TradingChartDesigner.IValueChangedEvent) {
        this._getHistory();

        if (this.replayWaiter) {
            if (this.chart.instrument.id === this.replayWaiter.instrument && this.chart.timeInterval === this.replayWaiter.tf) {

                this.chart.refresh();
                this.chart.refreshIndicators();

                this.chart.setReplayByDate(this.replayWaiter.date);
            }
        }

        this._barsSet = true;

        this.replayWaiter = null;

        this._tradingFromChartHandler.setChart(this.chart, false);
        this._alertingFromChartService.setChart(this.chart);

        if (this._identity.isGuestMode && !ReplayModeSync.IsChartReplayStarted) {
            ReplayModeSync.IsChartReplayStarted = true;
            const timerId = setTimeout(() => {
                this.startReplayMode();
            }, 1000);

            this.replayModeTimers.push(timerId);
        }
    }

    protected themeChanged() {
        this._chartTrackerService.setGlobalChartOptions(this.chart.getChartSettingsOptions());
    }

    protected useDefaultLinker(): boolean {
        return true;
    }

    protected showLinkerTab(): boolean {
        return false;
    }

    protected useActiveElementLinker(): boolean {
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

    protected handleLinkingAction(action: LinkingAction) {
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
    }

    private _sendInstrumentChange(instrument: IChartInstrument) {
        const linkAction: LinkingAction = {
            type: Actions.ChangeInstrument,
            data: instrument
        };
        this.sendLinkingAction(linkAction);
    }

    private _getTheme(): any {
        switch (this._themeService.activeTheme) {
            case Theme.Dark:
                return BreakfreeTheme;
            case Theme.Light:
            // return Breakfree;
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
        if (ReplayModeSync.IsChartReplayStarted) {
            ReplayModeSync.IsChartReplayFinished = true;
            this.chart.removeIndicators();
            this.chart.removeShapes();
            this.chart.off(TradingChartDesigner.ChartEvent.BARS_APPENDED);

            this._highlightService.highlightBottomOrdersPNL(1000 * 15);

            const timerId = setTimeout(() => {
                this._showCheckout();
            }, 1000 * 20);
            this.replayModeTimers.push(timerId);
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

    private _showCheckout() {
        this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
    }

    setTitle() {
        if (this.chart && this.chart.instrument) {
            super.setTitle(of(this.chart ? this.chart.instrument.symbol : ''));
        }

        if (this._tabElement) {
            const priceTickerContainer = this._tabElement.find(`.${this._priceTickerContainerClass}`)[0];
            if (!priceTickerContainer) {
                this._createPriceTickerContainer();
            }
        }

        this._setTitlePrice();
    }

    onShow() {
        super.onShow();
        this.setTitle();
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
            this.marketSubscription = null;
        }

        if (this.brokerStateChangedSubscription) {
            this.brokerStateChangedSubscription.unsubscribe();
        }

        if (this._headerUpdateTimer) {
            clearInterval(this._headerUpdateTimer);
        }

        if (this.handleBrokerConnectTimeout) {
            clearTimeout(this.handleBrokerConnectTimeout);
        }

        if (this.handleSetBALinesTimeout) {
            clearTimeout(this.handleSetBALinesTimeout);
        }

        if (this.replayModeTimers && this.replayModeTimers.length) {
            for (const timerId of this.replayModeTimers) {
                clearTimeout(timerId);
            }
        }

        try {
            if (this._sizeChangeObserver) {
                this._sizeChangeObserver.unobserve(this.chartContainer.nativeElement);
                this._sizeChangeObserver = null;
            }
        } catch (e) {
            console.log(e);
        }

        try {
            this._chartTrackerService.removeChart(this.chart);
            this._chartTrackerService.removeChartComponent(this);
            if (this.chart) {
                this.chart.off(TradingChartDesigner.ChartEvent.INDICATOR_ADDED);
                this.chart.off(TradingChartDesigner.ChartEvent.INSTRUMENT_CHANGED);
                this.chart.off(TradingChartDesigner.ChartEvent.TIME_FRAME_CHANGED);
                this.chart.off(TradingChartDesigner.ChartEvent.REPLAY_MODE_STOPPED);
                this.chart.off(TradingChartDesigner.ChartEvent.INDICATOR_REMOVED);
                this.chart.off(TradingChartDesigner.ChartEvent.SETS_DEFAULT_SETTINGS);
                this.chart.off(TradingChartDesigner.ChartEvent.SAVE_SESSION);
                this.chart.off(TradingChartDesigner.ChartEvent.BARS_SETTED);
                this.chart.off(TradingChartDesigner.ChartEvent.GLOBAL_THEME_CHANGED);
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

    protected _createPriceTickerContainer() {
        if (!this._tabElement) {
            return;
        }

        let priceTickerContainer = document.createElement("div");
        priceTickerContainer.classList.add(this._priceTickerContainerClass);

        let priceDirection = document.createElement("div");
        priceDirection.classList.add(this._priceDirectionClass);
        priceTickerContainer.appendChild(priceDirection);
        this._priceDirectionElement = priceDirection;

        let currentPrice = document.createElement("div");
        currentPrice.classList.add(this._currentPriceClass);
        priceTickerContainer.appendChild(currentPrice);
        this._currentPriceElement = currentPrice;

        let priceChange = document.createElement("div");
        priceChange.classList.add(this._priceChangeClass);
        priceTickerContainer.appendChild(priceChange);
        this._priceChangeElement = priceChange;

        this._tabElement[0].insertBefore(priceTickerContainer, this._tabElement.find(`.${this._insertAfterElementClass}`)[0].nextSibling);
    }

    protected _setEmptyTitlePrice() {
        this._currentPriceElement.innerHTML = "";
        this._priceChangeElement.innerHTML = "";
        this._priceDirectionElement.innerHTML = "";
    }

    protected _setTitlePrice() {
        if (!this.chart) {
            return;
        }

        const instrument = this.chart.instrument as IInstrument;
        if (!instrument) {
            this._setEmptyTitlePrice();
            return;
        }

        const key = this._getKeyForInstrumentsPriceHistory(instrument);
        const barCache = this._hourlyPriceCache[key];
        if (!barCache || !barCache.length) {
            this._setEmptyTitlePrice();
            return;
        }

        const currentPrice = this.chart.dataContext.dataRows[".close"].lastValue;
        if (!currentPrice) {
            this._setEmptyTitlePrice();
            return;
        }

        const firstPrice = barCache[0].close;
        const change = (currentPrice - firstPrice) / firstPrice * 100;

        this._currentPriceElement.innerHTML = currentPrice.toFixed(instrument.pricePrecision);
        this._priceChangeElement.innerHTML = `${Math.roundToDecimals(change, 2).toFixed(2)}%`;

        if (change > 0) {
            this._priceDirectionElement.innerHTML = "▲";
            this._priceChangeElement.classList.remove("downTrend");
            this._priceDirectionElement.classList.remove("downTrend");
            this._priceChangeElement.classList.add("upTrend");
            this._priceDirectionElement.classList.add("upTrend");
        } else {
            this._priceDirectionElement.innerHTML = "▼";
            this._priceChangeElement.classList.remove("upTrend");
            this._priceDirectionElement.classList.remove("upTrend");
            this._priceChangeElement.classList.add("downTrend");
            this._priceDirectionElement.classList.add("downTrend");
        }

    }

    private _getHistory() {
        const instrument = this.chart.instrument as IInstrument;
        if (!instrument) {
            return;
        }

        const key = this._getKeyForInstrumentsPriceHistory(instrument);
        if (this._hourlyPriceCache[key]) {
            return;
        }

        let requestMsg: IHistoryRequest = {
            instrument: instrument,
            timeFrame: {
                periodicity: IPeriodicity.hour,
                interval: 1
            },
            startDate: new Date(new Date().getTime() - (60 * 60 * 24 * 5 * 1000)), // 5 days
            endDate: new Date(),
            cacheToken: key
        };

        (this._datafeed as any)._historyService.getHistory(requestMsg).subscribe((response: IHistoryResponse) => {
            if (response && response.data.length) {
                const data = response.data;
                if (data.length > 24) {
                    data.reverse().length = 24;
                    data.reverse();
                }
                this._hourlyPriceCache[key] = data;
            }
        });
    }

    private _getKeyForInstrumentsPriceHistory(instrument: IInstrument) {
        return instrument.id + instrument.exchange;
    }
}


