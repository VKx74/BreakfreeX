import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Injector, ViewChild } from "@angular/core";
import { ConfirmModalComponent } from "UI";
import { IInstrument } from "@app/models/common/instrument";
import { Subscription, of } from "rxjs";
import { RealtimeService } from "@app/services/realtime.service";
import { ILevel2, ITick } from "@app/models/common/tick";
import { JsUtil } from "../../../../utils/jsUtil";
import { map } from "rxjs/operators";
import { TrendIndexTranslateService } from "../../localization/token";
import { TranslateService } from "@ngx-translate/core";
import { InstrumentSearchComponent } from "@instrument-search/components/instrument-search/instrument-search.component";
import { MatDialog } from "@angular/material/dialog";
import { Actions, LinkingAction } from "../../../Linking/models";
import { DataFeedBase } from "@chart/datafeed/DataFeedBase";
import { DataFeed } from "@chart/datafeed/DataFeed";
import { ComponentIdentifier } from "@app/models/app-config";
import {
    ColumnSortDataAccessor,
    DataTableComponent
} from "../../../datatable/components/data-table/data-table.component";
import bind from "bind-decorator";
import { LayoutManagerService } from "angular-golden-layout";
import { ITcdComponentState } from "Chart";
import { PriceAlertDialogComponent } from "../../../AutoTradingAlerts/components/price-alert-dialog/price-alert-dialog.component";
import { AlertService } from '@alert/services/alert.service';
import { HostListener } from '@angular/core';
import { IdentityService } from '@app/services/auth/identity.service';
import { CheckoutComponent } from 'modules/BreakfreeTrading/components/checkout/checkout.component';
import { BaseLayoutItem } from "@layout/base-layout-item";
import { AlgoService, IMesaTrendIndex } from "@app/services/algo.service";
import { EExchangeInstance } from "@app/interfaces/exchange/exchange";
import { InstrumentService } from "@app/services/instrument.service";
import { ITrendIndexBarChartData } from "../trendIndexBarChart/trendIndexBarChart.component";
import { ITrendIndexChartData } from "../trendIndexChart/trendIndexChart.component";
import { TimeSpan } from "@app/helpers/timeFrame.helper";

const TopUpTrending = "Top Uptrending";
const TopDownTrending = "Top Downtrending";
const AllInstruments = "Markets";

export interface ITrendIndexComponentState {
}

export enum ETrendIndexStrength {
    Sideways,
    Up,
    Down,
    StrongUp,
    StrongDown
}

interface ITrendIndexChartDataVM {
    data: ITrendIndexChartData;
    strength: number;
    timeframe: string;
    granularity: number;
}

interface ITrendIndexBarChartDataVM {
    data: ITrendIndexBarChartData;
    timeframe: string;
    symbol: string;
    startDate: string;
    endDate: string;
}

class TrendIndexVM {
    type: string = AllInstruments;
    strength: { [id: string]: number; };
    avg_strength: { [id: string]: number; };

    id: string;
    symbol: string;
    datafeed: string;
    last_price: number;
    price1StrengthValue: number;
    price1Strength: ETrendIndexStrength;
    price60: number;
    price60Change: number;
    price60StrengthValue: number;
    price60Strength: ETrendIndexStrength;
    price300: number;
    price300Change: number;
    price300StrengthValue: number;
    price300Strength: ETrendIndexStrength;
    price900: number;
    price900Change: number;
    price900StrengthValue: number;
    price900Strength: ETrendIndexStrength;
    price3600: number;
    price3600Change: number;
    price3600StrengthValue: number;
    price3600Strength: ETrendIndexStrength;
    price14400: number;
    price14400Change: number;
    price14400StrengthValue: number;
    price14400Strength: ETrendIndexStrength;
    price86400: number;
    price86400Change: number;
    price86400StrengthValue: number;
    price86400Strength: ETrendIndexStrength;
    totalStrength: number;
    weights: { [id: string]: number; } = {
        "1": 0.033,
        "60": 0.066,
        "300": 0.1,
        "900": 0.15,
        "3600": 0.2,
        "14400": 0.2,
        "86400": 0.25
    };

    public setData(data: IMesaTrendIndex) {
        this.id = data.symbol;
        this.symbol = data.symbol.replace("_", "");
        this.datafeed = data.datafeed;
        this.last_price = data.last_price;

        this.price60 = data.price60;
        this.price300 = data.price300;
        this.price900 = data.price900;
        this.price3600 = data.price3600;
        this.price14400 = data.price14400;
        this.price86400 = data.price86400;

        this.price60Change = (this.last_price - this.price60) / this.last_price * 100;
        this.price300Change = (this.last_price - this.price300) / this.last_price * 100;
        this.price900Change = (this.last_price - this.price900) / this.last_price * 100;
        this.price3600Change = (this.last_price - this.price3600) / this.last_price * 100;
        this.price14400Change = (this.last_price - this.price14400) / this.last_price * 100;
        this.price86400Change = (this.last_price - this.price86400) / this.last_price * 100;

        this.avg_strength = data.avg_strength;

        this.strength = {};

        for (let key in data.strength) {
            this.strength[key] = data.strength[key].f - data.strength[key].s;
        }

        let s_1 = this.strength["1"] / this.avg_strength["1"];
        let s_60 = this.strength["60"] / this.avg_strength["60"];
        let s_300 = this.strength["300"] / this.avg_strength["300"];
        let s_900 = this.strength["900"] / this.avg_strength["900"];
        let s_3600 = this.strength["3600"] / this.avg_strength["3600"];
        let s_14400 = this.strength["14400"] / this.avg_strength["14400"];
        let s_86400 = this.strength["86400"] / this.avg_strength["86400"];

        this.totalStrength =
            s_1 * this.weights["1"] +
            s_60 * this.weights["60"] +
            s_300 * this.weights["300"] +
            s_900 * this.weights["900"] +
            s_3600 * this.weights["3600"] +
            s_14400 * this.weights["14400"] +
            s_86400 * this.weights["86400"];

        this.price1StrengthValue = s_1;
        this.price60StrengthValue = s_60;
        this.price300StrengthValue = s_300;
        this.price900StrengthValue = s_900;
        this.price3600StrengthValue = s_3600;
        this.price14400StrengthValue = s_14400;
        this.price86400StrengthValue = s_86400;

        this.price1Strength = this._getStrength(s_1);
        this.price60Strength = this._getStrength(s_60);
        this.price300Strength = this._getStrength(s_300);
        this.price900Strength = this._getStrength(s_900);
        this.price3600Strength = this._getStrength(s_3600);
        this.price14400Strength = this._getStrength(s_14400);
        this.price86400Strength = this._getStrength(s_86400);
    }

    private _getStrength(value: number): ETrendIndexStrength {
        if (value > 0.75) {
            return ETrendIndexStrength.StrongUp;
        }
        if (value > 0.1) {
            return ETrendIndexStrength.Up;
        }
        if (value < -0.75) {
            return ETrendIndexStrength.StrongDown;
        }
        if (value < -0.1) {
            return ETrendIndexStrength.Down;
        }
        return ETrendIndexStrength.Sideways;
    }
}

@Component({
    selector: 'trend-index',
    templateUrl: 'trendIndex.component.html',
    styleUrls: ['trendIndex.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: DataFeedBase,
            useClass: DataFeed
        },
        {
            provide: TranslateService,
            useExisting: TrendIndexTranslateService
        }
    ]
})
export class TrendIndexComponent extends BaseLayoutItem {
    static componentName = 'TrendIndex';
    static previewImgClass = 'crypto-icon-watchlist';
    // @ViewChild(DataTableComponent, { static: false }) dataTableComponent: DataTableComponent;

    loading: boolean;
    instrumentsPriceHistory: { [symbolName: string]: number[] } = {};

    private _realtimeSubscriptions: { [instrumentHash: string]: Subscription } = {};
    private _initialized: boolean;
    private _changesDetected: boolean;
    private _updateInterval: any;
    private _reloadInterval: any;
    private _state: ITrendIndexComponentState;
    private _chartDataBars: ITrendIndexBarChartDataVM;
    private _chartDataTrends: ITrendIndexChartDataVM[] = [];

    public groups: string[] = [TopUpTrending, TopDownTrending, AllInstruments];
    public groupingField: string = "type";

    public get hasAccess(): boolean {
        return this._identityService.isAuthorizedCustomer;
    }

    get componentId(): string {
        return TrendIndexComponent.componentName;
    }

    get isAuthorizedCustomer(): boolean {
        return this._identityService.isAuthorizedCustomer;
    }

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    get chartDataBars(): ITrendIndexBarChartDataVM {
        return this._chartDataBars;
    }

    get chartDataTrends(): ITrendIndexChartDataVM[] {
        return this._chartDataTrends;
    }

    vm: TrendIndexVM[] = [];
    selectedVM: TrendIndexVM;

    constructor(protected _dialog: MatDialog,
        protected _realtimeService: RealtimeService,
        protected _translateService: TranslateService,
        protected _layoutManagerService: LayoutManagerService,
        protected _alertManager: AlertService,
        protected _algoService: AlgoService,
        protected _instrumentService: InstrumentService,
        protected _cdr: ChangeDetectorRef,
        protected _identityService: IdentityService) {
        super();
    }

    ngOnInit() {
        this.initialized.next(this);

        if (!this.hasAccess) {
            return;
        }

        this.loading = true;

        this._updateInterval = setInterval(() => {
            if (this._changesDetected) {
                this._cdr.markForCheck();
            }
            this._changesDetected = false;
        }, 500);

        this._reloadInterval = setInterval(() => {
            this.loadData();
        }, 60 * 1000);

        this.loadData();

    }

    protected loadData() {
        this._algoService.getMesaTrendIndexes().subscribe((data) => {
            for (let item of data) {
                let exists = false;
                for (let existingItem of this.vm) {
                    if (item.symbol === existingItem.id) {
                        existingItem.setData(item);
                        exists = true;
                        break;
                    }
                }

                if (!exists) {
                    let model = new TrendIndexVM();
                    model.setData(item);
                    this.vm.push(model);
                }
            }

            this.vm.sort((a1, a2) => a1.totalStrength > a2.totalStrength ? -1 : 1);
            this.vm = this.vm.slice();
            if (this.vm.length > 10) {
                this.vm.slice(0, 5).forEach((_) => {
                    _.type = TopUpTrending;
                });

                let downtrending = this.vm.slice(-5);
                downtrending.forEach((_) => {
                    _.type = TopDownTrending;
                });
                downtrending.reverse();
                this.vm.splice(-5);
                this.vm.push(...downtrending);
            }

            this.loading = false;
            this._changesDetected = true;
        });
    }


    protected useDefaultLinker(): boolean {
        return true;
    }

    getState(): ITrendIndexComponentState {
        return {
        };
    }

    @bind
    columnCaption(value: string) {
        return this._translateService.get(`trend-index.${value}`);
    }

    processCheckout() {
        this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
    }

    private _sendInstrumentChange(instrument: IInstrument) {
        const linkAction: LinkingAction = {
            type: Actions.ChangeInstrumentAndTimeframe,
            data: {
                instrument: instrument,
                timeframe: TimeSpan.MILLISECONDS_IN_MINUTE / 1000
            }
        };
        this.onOpenChart.next(linkAction);
    }

    handleInstrumentClick(instrumentVM: TrendIndexVM) {
        this.selectVMItem(instrumentVM);
    }

    selectVMItem(instrumentVM: TrendIndexVM) {
        this.selectedVM = instrumentVM;

        this.loading = true;
        this._changesDetected = true;

        this._algoService.getMesaTrendDetails(instrumentVM.id, instrumentVM.datafeed).subscribe((data) => {
            if (data) {
                let values: number[] = [];
                let dates: string[] = [];

                for (let bar of data.bars) {
                    values.push(bar.c);
                    dates.push(new Date(bar.t * 1000).toLocaleString());
                }

                this._chartDataBars = {
                    data: {
                        dates: dates,
                        values: values,
                        isUpTrending: instrumentVM.totalStrength > 0
                    },
                    timeframe: this._tfToString(60),
                    symbol: instrumentVM.symbol,
                    startDate: new Date(data.bars[0].t * 1000).toLocaleString(),
                    endDate: new Date(data.bars[data.bars.length - 1].t * 1000).toLocaleString()
                };

                this._chartDataTrends = [];

                let maxDate = 0;
                for (let tf in data.mesa) {
                    let mesaDataList = data.mesa[tf];
                    let firstTime = mesaDataList[0].t;

                    if (firstTime > maxDate) {
                        maxDate = firstTime;
                    }
                }

                for (let tf in data.mesa) {
                    let mesaValues: number[] = [];
                    let mesaDates: string[] = [];
                    let avg = instrumentVM.avg_strength[tf];
                    if (!avg) {
                        continue;
                    }

                    let mesaDataList = data.mesa[tf];
                    for (let mesaItem of mesaDataList) {
                        if (mesaItem.t > maxDate) {
                            mesaValues.push((mesaItem.f - mesaItem.s) / avg * 100);
                            mesaDates.push(new Date(mesaItem.t * 1000).toLocaleString());
                        }
                    }

                    this._chartDataTrends.push({
                        timeframe: this._tfToString(Number(tf)),
                        granularity: Number(tf),
                        strength: mesaValues[mesaValues.length - 1],
                        data: {
                            dates: mesaDates,
                            values: mesaValues
                        }
                    });
                }
            }
            console.log(">>> Calculation finished");
            this.loading = false;
            this._changesDetected = true;
        }, (error: any) => {
            console.log('error:');
            console.log(error);
            this.loading = false;
            this._changesDetected = true;
        });

        this._instrumentService.getInstrumentsBySymbolOrId(instrumentVM.symbol)
            .subscribe((instruments: IInstrument[]) => {
                if (instruments) {
                    let instrument = instruments[0];
                    for (let i of instruments) {
                        if (i.datafeed.toLowerCase() === instrumentVM.datafeed.toLowerCase()) {
                            instrument = i;
                            break;
                        }
                    }

                    this._sendInstrumentChange(instrument);
                }
            }, (error: any) => {
                console.log('error:');
                console.log(error);
            });
    }

    private _tfToString(tf: number): string {
        switch (tf) {
            case 1: return "Driver";
            case 60: return "1 Min";
            case 300: return "5 Mins";
            case 900: return "15 Mins";
            case 3600: return "1 Hour";
            case 14400: return "4 Hours";
            case 86400: return "1 Day";
        }
        return tf + " Mins";
    }

    setState(state: ITrendIndexComponentState) {
        if (state) {
            this._state = state;
        }

        this._initialized = true;
    }

    closeCharts() {
        this._chartDataBars = null;
        this._chartDataTrends = [];
    }

    ngOnDestroy() {
        this.beforeDestroy.next(this);

        Object.keys(this._realtimeSubscriptions).forEach((prop) => {
            this._realtimeSubscriptions[prop].unsubscribe();
        });

        if (this._updateInterval) {
            clearInterval(this._updateInterval);
        }

        if (this._reloadInterval) {
            clearInterval(this._reloadInterval);
        }
    }

    getRelativeStrengthClass(value: number) {
        value = value * 100;
        if (Math.abs(value) >= 60) {
            return "color-s";
        }
        if (Math.abs(value) >= 50) {
            return "color-a";
        }
        if (Math.abs(value) >= 40) {
            return "color-b";
        }
        if (Math.abs(value) >= 30) {
            return "color-c";
        }
        if (Math.abs(value) >= 20) {
            return "color-d";
        }
        if (Math.abs(value) >= 10) {
            return "color-e";
        }
        return "color-f";
    }

    getRelativeStrengthTooltip(value: number) {
        value = value * 100;
        if (Math.abs(value) >= 60) {
            return "Strong Strength";
        }
        if (Math.abs(value) >= 50) {
            return "Good Strength";
        }
        if (Math.abs(value) >= 40) {
            return "Building Strength";
        }
        if (Math.abs(value) >= 30) {
            return "Building Strength";
        }
        if (Math.abs(value) >= 20) {
            return "Low Strength";
        }
        if (Math.abs(value) >= 10) {
            return "No Strength";
        }
        return "Sideways";
    }

    private _raiseStateChanged() {
        if (!this._initialized) {
            return;
        }

        this.stateChanged.next(this);
    }
}
