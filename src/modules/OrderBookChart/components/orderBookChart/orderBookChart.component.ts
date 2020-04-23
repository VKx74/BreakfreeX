import {Component, ElementRef, Inject, Injector, ViewChild} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {map, takeUntil} from "rxjs/operators";
import {IInstrument} from "@app/models/common/instrument";
import {InstrumentService} from "@app/services/instrument.service";
import {EExchange} from "@app/models/common/exchange";
import {Theme} from "@app/enums/Theme";
import {ThemeService} from "@app/services/theme.service";
import {RealtimeService} from "@app/services/realtime.service";
import {ILevel2, ITick} from "@app/models/common/tick";
import {DataFeedBase} from "@chart/datafeed/DataFeedBase";
import {DataFeed} from "@chart/datafeed/DataFeed";
import {TranslateService} from "@ngx-translate/core";
import {OrderBookChartTranslateService} from "../../localization/token";
import {LocalizationService} from "Localization";
import {Actions, LinkingAction} from "@linking/models";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {ComponentIdentifier} from "@app/models/app-config";
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import {GoldenLayoutItemState} from "angular-golden-layout";

export interface IOrderBookCartState {
    activeInstrument: IInstrument;
}

@Component({
    selector: 'orderBookChart',
    templateUrl: 'orderBookChart.component.html',
    styleUrls: ['orderBookChart.component.scss'],
    providers: [
        {
            provide: DataFeedBase,
            useClass: DataFeed
        },
        {
            provide: TranslateService,
            useExisting: OrderBookChartTranslateService
        }
    ]
})

export class OrderBookChartComponent extends BaseLayoutItemComponent {
    static componentName = 'Order Book Chart';
    static previewImgClass = 'crypto-icon-obc';
    private static readonly ALL_DEEP_LEVELS = 0;
    private subscription: Subscription;
    private ticks: Subscription;
    private _updateNeeded = false;

    @ViewChild('orderBookChart', {static: true}) public canvasElement: ElementRef;

    private _orderBookDeep: number;
    activeInstrument: IInstrument;
    orderBookChart;
    canvas: any;
    ctx: any;

    obDeepsList: number[] = [OrderBookChartComponent.ALL_DEEP_LEVELS, 25, 10, 5, 4, 3, 2];

    lastL2BuyCount: number;
    decimalsAmount: number;
    theme: Theme;
    private _interval: any;

    ticksColorDark = '#d5d5dc';
    ticksColorLight = '#474747';
    gridColorDark = 'rgba(255, 255, 255, 0.05)';
    gridColorLight = 'rgba(237, 239, 242, 1)';

    getDeepCaption = (deep: number): Observable<string> => {
        if (deep === OrderBookChartComponent.ALL_DEEP_LEVELS) {
            return this._translateService.get('orderBookChart.all');
        }

        return this._translateService.get('orderBookChart.levels')
            .pipe(map((translate: string) => {
                return `${deep} ${translate}`;
            }));
    }

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(@Inject(GoldenLayoutItemState) protected _state: IOrderBookCartState,
                private _datafeed: DataFeedBase,
                private _themeService: ThemeService,
                private _instrumentService: InstrumentService,
                private _localizationService: LocalizationService,
                private _translateService: TranslateService,
                private _realtimeService: RealtimeService,
                protected _injector: Injector) {

        super(_injector);

        this._orderBookDeep = this.obDeepsList[0];

        super.setTitle(
            this._translateService.stream('orderBookChartComponentName')
        );
    }

    ngOnInit() {
        this.createOrderBookChart();
        // this._goldenLayoutItemComponent.onResize$.asObservable().subscribe(() => {
        //     this._updateChartBackground();
        // });

        this._themeService.activeThemeChange$.pipe(takeUntil(componentDestroyed(this))).subscribe((theme: Theme) => {
            this.theme = theme;
            if (this.orderBookChart) {
                this.orderBookChart.options.scales.yAxes[0].ticks.minor.fontColor = theme === Theme.Light ? this.ticksColorLight : this.ticksColorDark ;
                this.orderBookChart.options.scales.yAxes[1].ticks.minor.fontColor = theme === Theme.Light ? this.ticksColorLight : this.ticksColorDark ;
                this.orderBookChart.options.scales.xAxes[0].ticks.minor.fontColor = theme === Theme.Light ? this.ticksColorLight : this.ticksColorDark ;
                this.orderBookChart.options.scales.yAxes[0].gridLines.color = theme === Theme.Light ? this.gridColorLight : this.gridColorDark ;
                this.orderBookChart.options.scales.yAxes[1].gridLines.color = theme === Theme.Light ? this.gridColorLight : this.gridColorDark ;
                this.orderBookChart.options.scales.xAxes[0].gridLines.color = theme === Theme.Light ? this.gridColorLight : this.gridColorDark ;
                this.orderBookChart.update();
            }
        });

        if (this._state && this._state.activeInstrument) {
            this.loadState(this._state);
        } else {
            this._instrumentService.getInstruments(EExchange.any).subscribe(values => {
                if (values && values.length) {
                    const activeInstrument = values[0];
                    this._selectInstrument(activeInstrument);
                    this.fireStateChanged();
                }
            });
        }

        this._interval = setInterval(() => {
            if (this._updateNeeded) {
                this.orderBookChart.update();
                this._updateNeeded = false;
            }
        }, 700);
        this._initLinking();
    }

    private _initLinking() {
        this.linker.onAction((action: LinkingAction) => {
            if (action.type === Actions.ChangeInstrument) {
                if (action.data !== this.activeInstrument) {
                    this._selectInstrument(action.data);
                    this.fireStateChanged();
                }
            }
        });
    }

    private _sendInstrumentChange(instrument: IInstrument) {
        const linkAction: LinkingAction = {
            type: Actions.ChangeInstrument,
            data: instrument
        };
        this.linker.sendAction(linkAction);
    }

    loadState(state: IOrderBookCartState) {
        if (!state || !state.activeInstrument || !state.activeInstrument.symbol) {
            return;
        }

        this._selectInstrument(state.activeInstrument);
    }

    protected getComponentState(): any {
        return {
            activeInstrument: this.activeInstrument
        };
    }

    handleInstrumentChange(instrument: IInstrument) {
        if (instrument !== this.activeInstrument) {
            this._sendInstrumentChange(instrument);
            this._selectInstrument(instrument);
            this.fireStateChanged();
        }
    }

    setOBDeep(deep: number) {
        this._orderBookDeep = deep;
        this._getCachedL2Ticks();
    }

    private _selectInstrument(instrument: IInstrument) {
        this.activeInstrument = instrument;
        this.decimalsAmount = instrument.pricePrecision;
        this.orderBookChart.data.datasets[0].data = [];
        this.orderBookChart.data.datasets[1].data = [];
        this.orderBookChart.data.datasets[2].data = [];
        this.orderBookChart.data.labels = [];
        this._updateNeeded = true;

        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        this._getCachedL2Ticks();

        this.subscription = this._realtimeService.subscribeToL2(this.activeInstrument, (levels: ILevel2) => {
            this._processL2(levels);
        });
    }

    private _processL2(levels: ILevel2) {
        let sellsLength = levels.sells.length;
        let buysLength = levels.buys.length;

        levels.sells.length = this._setChosenLength(sellsLength);
        levels.buys.length = this._setChosenLength(buysLength);

        this.lastL2BuyCount = levels.buys.length - 1;
        this.orderBookChart.data.datasets[0].data = [];
        this.orderBookChart.data.datasets[1].data = [];
        this.orderBookChart.data.datasets[2].data = [];
        this.orderBookChart.data.labels = [];

        if (levels.buys.length > 1 || levels.sells.length > 1) {
            this.calculateOrderBookData(levels.buys, levels.sells);
        }

        this._updateNeeded = true;
    }

    private _getGradientColor(borderColor: string): CanvasGradient {
        let gradientHeight = this.canvasElement.nativeElement.offsetHeight;
        let gradient = this.canvas.getContext('2d').createLinearGradient(0, gradientHeight, 0, 0);
        gradient.addColorStop(1, borderColor);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        return gradient;
    }

    private _updateChartBackground() {
        this.orderBookChart.data.datasets[0].backgroundColor = this._getGradientColor('rgba(39, 207, 109, 0.2)');
        this.orderBookChart.data.datasets[1].backgroundColor = this._getGradientColor('rgba(240, 38, 69, 0.2)');
        this.orderBookChart.update();
    }

    createOrderBookChart() {
        const theme = this._themeService.getActiveTheme();
        this.theme = theme;
        this.canvas = this.canvasElement.nativeElement;
        this.ctx = this.canvas.getContext('2d');
        this.orderBookChart = new Chart(this.ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Total',
                    borderColor: "rgba(39, 207, 109, 1)",
                    backgroundColor: this._getGradientColor('rgba(39, 207, 109, 0.2)'),
                    lineTension: 0.1,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    yAxisID: "y-axis-0",
                    data: []
                },
                {
                    label: 'Total',
                    borderColor: "rgba(240, 38, 69, 1)",
                    backgroundColor: this._getGradientColor('rgba(240, 38, 69, 0.2)'),
                    lineTension: 0.1,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    yAxisID: "y-axis-0",
                    data: []
                },
                {
                    yAxisID: "y-axis-1",
                    showLine: false,
                    pointRadius: 0,
                    data: []
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0, // general animation time
                },
                hover: {
                    animationDuration: 0, // duration of animations when hovering an item
                },
                responsiveAnimationDuration: 0, // animation duration after a resize
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: true,
                            color: theme === Theme.Light ? this.gridColorLight : this.gridColorDark ,
                            lineWidth: 1
                        },
                        ticks: {
                            fontColor: theme === Theme.Light ? this.ticksColorLight : this.ticksColorDark ,
                            autoSkipPadding: 30,
                            autoSkip: true,
                            maxRotation: 0,
                            minRotation: 0,
                            labelOffset: 0,
                            padding: 10,
                        },
                    }],
                    yAxes: [{
                        position: 'left',
                        gridLines: {
                            display: true,
                            color: theme === Theme.Light ? this.gridColorLight : this.gridColorDark ,
                            lineWidth: 1
                        },
                        id: "y-axis-0",
                        ticks: {
                            fontColor: theme === Theme.Light ? this.ticksColorLight : this.ticksColorDark ,
                        }
                    }, {
                        stacked: true,
                        position: 'right',
                        id: "y-axis-1",
                        gridLines: {
                            display: true,
                            color: theme === Theme.Light ? this.gridColorLight : this.gridColorDark ,
                            lineWidth: 1
                        },
                        ticks: {
                            fontColor: theme === Theme.Light ? this.ticksColorLight : this.ticksColorDark ,
                        }
                    }]
                },
                legend: {
                    display: false
                },
                tooltips: {
                    backgroundColor: 'rgba(9,25,41, 0.6)',
                    bodySpacing: 6,
                    titleMarginBottom: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(tooltipItem, data) {
                            const label = data.datasets[tooltipItem.datasetIndex].label;
                            const value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            return label + ': ' + value;
                        },
                        title: function(tooltipItem) {
                            const value = tooltipItem[0].xLabel;
                            return "Price: " + value;
                        }
                    }
                }
            },

        });
    }

    calculateOrderBookData(buys: ITick[], sells: ITick[]) {
        let totalVolume = 0;
        let maxVolume = 0;

        for (let i = 0; i < buys.length; i++) {
            totalVolume += buys[i].volume;
            this.orderBookChart.data.labels[this.lastL2BuyCount - i] = buys[i].price.toFixed(this.decimalsAmount);
            this.orderBookChart.data.datasets[0].data[this.lastL2BuyCount - i]  = totalVolume.toFixed(this.decimalsAmount);
        }

        if (!buys.length) {
            this.orderBookChart.data.datasets[0].data[0] = 0;
        }

        if (maxVolume < totalVolume) {
            maxVolume = totalVolume;
        }

        totalVolume = 0;
        for (let i = 0; i < sells.length; i++) {
            totalVolume += sells[i].volume;
            this.orderBookChart.data.labels[this.lastL2BuyCount + i]  = sells[i].price.toFixed(this.decimalsAmount);
            this.orderBookChart.data.datasets[1].data[this.lastL2BuyCount + i] = totalVolume.toFixed(this.decimalsAmount);
        }

        if (!sells.length) {
            this.orderBookChart.data.datasets[1].data[this.lastL2BuyCount] = 0;
        }

        if (maxVolume < totalVolume) {
            maxVolume = totalVolume;
        }

        this.orderBookChart.data.datasets[2].data[0] = maxVolume;
    }

    private _setChosenLength(length: number): number {
        if (length > this._orderBookDeep && this._orderBookDeep !== OrderBookChartComponent.ALL_DEEP_LEVELS) {
            return this._orderBookDeep;
        }

        return length;
    }

    private _getCachedL2Ticks() {
        const cachedL2 = this._realtimeService.getLastL2Ticks(this.activeInstrument);

        if (cachedL2) {
            this._processL2(cachedL2);
        }
    }

    ngOnDestroy() {
       super.ngOnDestroy();

        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        if (this.ticks) {
            this.ticks.unsubscribe();
        }

        if (this._interval) {
            clearInterval(this._interval);
        }

        this.orderBookChart.destroy();
    }
}
