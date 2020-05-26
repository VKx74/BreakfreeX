import {ChangeDetectionStrategy, Component, ElementRef, Inject, Injector, ViewChild} from "@angular/core";
import {ThemeService} from "@app/services/theme.service";
import {Theme} from "@app/enums/Theme";
import {of} from "rxjs";
import {takeUntil, tap} from "rxjs/operators";
import {DataFeedBase} from "../../datafeed/DataFeedBase";
import {DataFeed} from "../../datafeed/DataFeed";
import {TemplatesDataProviderService} from "../../services/templates-data-provider.service";
import {TimeZoneManager} from "../../../TimeZones/services/timeZone.manager";
import {LocalizationService} from "Localization";
import {TranslateService} from "@ngx-translate/core";
import {ChartTranslateService} from "../../localization/token";
import {Actions, LinkingAction} from "../../../Linking/models";
import {LinkerFactory} from "../../../Linking/linking-manager";
import {CalendarEventsDatafeed} from "../../calendarEvents/CalendarEventsDatafeed";
import {IndicatorAlertHandler} from 'modules/Chart/indicatorAlertHandler/indicatorAlertHandler';
import {AutoTradingAlertConfigurationService} from 'modules/AutoTradingAlerts/services/auto-trading-alert-configuration.service';
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {ComponentIdentifier} from "@app/models/app-config";
import {EducationalTipsService} from "@app/services/educational-tips.service";
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import {IInstrument} from "@app/models/common/instrument";
import IChartInstrument = TradingChartDesigner.IInstrument;
import ITradeHandlerParams = TradingChartDesigner.ITradeHandlerParams;
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {BrokerService} from "@app/services/broker.service";
import {ICryptoPlaceOrderAction} from "../../../Trading/models/crypto/crypto.models";
import TradeAction = TradingChartDesigner.TradeAction;
import {OrderSide, OrderTypes} from "../../../Trading/models/models";
import {AlertService} from "@alert/services/alert.service";
import {GoldenLayoutItemState} from "angular-golden-layout";
import { InstrumentService } from '@app/services/instrument.service';
import { EExchange } from '@app/models/common/exchange';

export interface ITcdComponentState {
    chartState?: any;
    instrument?: TradingChartDesigner.IInstrument;
    timeFrame?: TradingChartDesigner.ITimeFrame;
}

declare let defaultTheme: any;
declare let darkTheme: any;
declare let fintatechDarkTheme: any;

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
        CalendarEventsDatafeed
    ]
})
export class TcdComponent extends BaseLayoutItemComponent {
    
    static componentName = 'Trading Chart Designer';
    static previewImgClass = 'crypto-icon-chart';

    chart: TradingChartDesigner.Chart;
    // linksList: TradingChartDesigner.IHelpLinks;
    showSpinner = true;

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
                private _brokerService: BrokerService,
                private _alertService: AlertService,
                private _alertChartService: AutoTradingAlertConfigurationService,
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
        this._educationalTipsService.getLinkForComponent(ComponentIdentifier.chart)
            .subscribe(links => {
                // this.linksList = links;
                this.init(this._state);
            }, e => {
                console.log(e);
                this.init(this._state);
            });
    }

    init(state?: ITcdComponentState) {
        const theme = state && state.chartState && state.chartState.chart.theme ? state.chartState.chart.theme : this._getTheme();
        const instrumentsNeeded = !state || !state.instrument;

        this._datafeed.init(instrumentsNeeded).then(d => {
            const config = {
                chartContainer: this.chartContainer.nativeElement,
                width: '100%',
                height: 'calc( 100% - 66px )',
                theme: theme,
                addThemeClass: false,
                //  crossHair: "crossBars",
                datafeed: d,
                hideScrollToLastBar: true,
                instrument: state ? state.instrument : d.instruments[0],
                timeFrame: state && state.timeFrame,
                supportedTimeFrames: DataFeedBase.supportedTimeFramesStr,
                templateDataProvider: this._templateDataProviderService,
                marketEventsDatafeed: this._calendarEventsDatafeed,
                indicatorAlertsHandler: new IndicatorAlertHandler(this._alertChartService),
                // helpLinks: this.linksList,
                showHelp: this._educationalTipsService.isTipsShown(),
                locale: this._localizationService.locale,
                tradeHandler: this.tradeHandler.bind(this),
                searchInstrumentHandler: this.searchInstrumentHandler.bind(this),
            };

            this.chart = $(config.chartContainer).TradingChartDesigner(config);
            this.chart.showInstrumentWatermark = false;
            this.chart.calendarEventsManager.visibilityMode = TradingChartDesigner.CalendarEventsVisibilityMode.All;

            if (state && state.chartState) {
                // locale from app
                state.chartState.chart.locale = this._localizationService.locale;
                state.chartState.chart.theme = this._getTheme();

                this.chart.applyCopy(state.chartState);
            }

            (window as any).tcd = this.chart;

            this._subscribeOnChartEvents(this.chart);

            this.setTitle();
            setTimeout(() => {
                this.showSpinner = false;
            }, 1000);
        });
    }

    protected useDefaultLinker(): boolean {
        return true;
    }

    private searchInstrumentHandler(symbol: string): Promise<IInstrument[]> {
        const self = this;
        return new Promise<IInstrument[]>(function (resolve, reject) {
            self._instrumentService.getInstruments(EExchange.any, symbol).subscribe((instruments: IInstrument[]) => {
                self._datafeed.instruments = instruments;
                resolve(instruments);
            });
        });
    }

    private tradeHandler(params: ITradeHandlerParams) {
        const instrument = this.chart.instrument as IInstrument;
        const orderType = OrderTypes[params.orderName];

        if (this._brokerService.isInstrumentAvailable(instrument, orderType)) {
            const broker = this._brokerService.activeBroker as CryptoBroker;
            if (!params.amount) {
                this._alertService.error(this._translateService.get('amountMustHaveValue'));
                return;
            }
            const placeOrderData: ICryptoPlaceOrderAction = {
                symbol: instrument.symbol,
                side: OrderSide[TradeAction[params.action]],
                size: params.amount,
                type: orderType,
                price: orderType === OrderTypes.Limit || orderType === OrderTypes.StopLimit ? params.limitPrice : null,
                stopPrice: (orderType === OrderTypes.Stop || orderType === OrderTypes.StopLimit) ? params.stopPrice : null
            };

            broker.placeOrder(placeOrderData)
                .subscribe(value => {
                    if (value.result) {
                        this._alertService.success(this._translateService.get('orderPlaced'));
                    } else {
                        this._alertService.error(value.msg);
                    }
                }, error => {
                    this._alertService.error(error.message);
                });
        } else {
            this._alertService.error(this._translateService.get('brokerNotSupportThisSymbol'));
        }
    }

    private _subscribeOnChartEvents(chart: TradingChartDesigner.Chart) {
        chart.on(TradingChartDesigner.ChartEvent.INSTRUMENT_CHANGED,
            (e: TradingChartDesigner.IValueChangedEvent) => {
                this._handleChartInstrumentChange(e.value);
            });

        chart.on(TradingChartDesigner.ChartEvent.TIME_FRAME_CHANGED, (e: TradingChartDesigner.IValueChangedEvent) => {
            this._handleChartStateChanged();
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
            TradingChartDesigner.ChartEvent.GLOBAL_THEME_CHANGED,
            // TradingChartDesigner.ShapeEvent.POINTS_CHANGED
        ].join(' ');
    }

    private _initLinking() {
        this.linker.onAction((action: LinkingAction) => {
            if (action.type === Actions.ChangeInstrument) {
                if (this.chart) {
                    const chart = this.chart;
                    const instrument = action.data as IChartInstrument;
                    const chartInstrument = chart.instrument;

                    if (chartInstrument.symbol !== instrument.symbol
                        || chartInstrument.exchange !== instrument.exchange) {

                        chart.instrument = Object.assign({}, instrument);
                        chart.sendBarsRequest();
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
            if (this.chart) {
                this.chart.destroy();
            }
        } catch (e) {
            console.log(e);
        }
    }
}
