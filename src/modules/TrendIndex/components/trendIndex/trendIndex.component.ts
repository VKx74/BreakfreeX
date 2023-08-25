import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { IInstrument } from "@app/models/common/instrument";
import { Subscription } from "rxjs";
import { RealtimeService } from "@app/services/realtime.service";
import { TrendIndexTranslateService } from "../../localization/token";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { Actions, LinkingAction } from "../../../Linking/models";
import { DataFeedBase } from "@chart/datafeed/DataFeedBase";
import { DataFeed } from "@chart/datafeed/DataFeed";
import { ComponentIdentifier } from "@app/models/app-config";
import bind from "bind-decorator";
import { LayoutManagerService } from "angular-golden-layout";
import { AlertService } from '@alert/services/alert.service';
import { IdentityService } from '@app/services/auth/identity.service';
import { CheckoutComponent } from 'modules/BreakfreeTrading/components/checkout/checkout.component';
import { BaseLayoutItem } from "@layout/base-layout-item";
import { AlgoService, IMesaTrendIndex, IUserAutoTradingInfoData } from "@app/services/algo.service";
import { InstrumentService } from "@app/services/instrument.service";
import { ITrendIndexBarChartData } from "../trendIndexBarChart/trendIndexBarChart.component";
import { ITrendIndexChartData } from "../trendIndexChart/trendIndexChart.component";
import { TimeSpan } from "@app/helpers/timeFrame.helper";
import { DataTableComponent } from "modules/datatable/components/data-table/data-table.component";

const Metals = ["XAG_EUR", "XAG_USD", "XAU_EUR", "XAU_USD", "XAU_XAG", "XPD_USD", "XPT_USD"];
const Indices = ["AU200_AUD", "CN50_USD", "EU50_EUR", "FR40_EUR", "DE30_EUR", "HK33_HKD", "IN50_USD", "JP225_USD", "NL25_EUR", "SG30_SGD", "TWIX_USD", "UK100_GBP", "NAS100_USD", "US2000_USD", "SPX500_USD", "US30_USD"];
const Bounds = ["DE10YB_EUR", "UK100_GBP", "USB02Y_USD", "USB30Y_USD"];
const Commodities = ["BCO_USD", "CORN_USD", "NATGAS_USD", "SOYBN_USD", "WHEAT_USD", "WTICO_USD", "XCU_USD"];
const Crypto = ["BTCUSDT", "ETHUSDT"];
const OtherMarkets = "Markets";
const UpTrending = "Uptrending";
const DownTrending = "Downtrending";
const TopUpTrending = "Top Uptrending";
const TopDownTrending = "Top Downtrending";

interface ISymbolGroup {
    group: string;
    strength: number;
    count: number;
    avgStrength: number;
}

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
    type: string;
    avg_strength: { [id: string]: number; };

    id: string;
    symbol: string;
    datafeed: string;
    last_price: number;
    price1StrengthValue: number;
    price1Strength: ETrendIndexStrength;
    price60StrengthValue: number;
    price60Strength: ETrendIndexStrength;
    price300StrengthValue: number;
    price300Strength: ETrendIndexStrength;
    price900StrengthValue: number;
    price900Strength: ETrendIndexStrength;
    price3600StrengthValue: number;
    price3600Strength: ETrendIndexStrength;
    price14400StrengthValue: number;
    price14400Strength: ETrendIndexStrength;
    price86400StrengthValue: number;
    price86400Strength: ETrendIndexStrength;
    price2592000StrengthValue: number;
    price2592000Strength: ETrendIndexStrength;
    totalStrength: number;

    hour1State: number;
    hour4State: number;
    dailyState: number;
    monthlyState: number;

    public setData(data: IMesaTrendIndex) {
        this.id = data.symbol;
        this.symbol = data.symbol.replace("_", "");
        this.datafeed = data.datafeed;
        this.last_price = data.last_price;

        this.avg_strength = data.avg_strength;

        let s_1 = 0;
        let s_60 = 0;
        let s_300 = 0;
        let s_900 = 0;
        let s_3600 = 0;
        let s_14400 = 0;
        let s_86400 = 0;
        let s_2592000 = 0;
        if (data.timeframe_strengths) {
            s_1 = data.timeframe_strengths["1"] || 0;
            s_60 = data.timeframe_strengths["60"] || 0;
            s_300 = data.timeframe_strengths["300"] || 0;
            s_900 = data.timeframe_strengths["900"] || 0;
            s_3600 = data.timeframe_strengths["3600"] || 0;
            s_14400 = data.timeframe_strengths["14400"] || 0;
            s_86400 = data.timeframe_strengths["86400"] || 0;
            s_2592000 = data.timeframe_strengths["2592000"] || 0;
        }

        this.totalStrength = data.total_strength;

        this.price1StrengthValue = s_1;
        this.price60StrengthValue = s_60;
        this.price300StrengthValue = s_300;
        this.price900StrengthValue = s_900;
        this.price3600StrengthValue = s_3600;
        this.price14400StrengthValue = s_14400;
        this.price86400StrengthValue = s_86400;
        this.price2592000StrengthValue = s_2592000;

        this.price1Strength = this._getStrength(s_1);
        this.price60Strength = this._getStrength(s_60);
        this.price300Strength = this._getStrength(s_300);
        this.price900Strength = this._getStrength(s_900);
        this.price3600Strength = this._getStrength(s_3600);
        this.price14400Strength = this._getStrength(s_14400);
        this.price86400Strength = this._getStrength(s_86400);
        this.price2592000Strength = this._getStrength(s_2592000);

        this.hour1State = data.hour1State;
        this.hour4State = data.hour4State;
        this.dailyState = data.dailyState;
        this.monthlyState = data.monthlyState;
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
    @ViewChild(DataTableComponent, { static: false }) dataTableComponent: DataTableComponent;

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
    private _tradableInstruments: string[] = [];
    private _userAutoTradingInfoData: IUserAutoTradingInfoData;

    public groups: string[] = [];
    public groupingField: string = "type";

    public get hasAccess(): boolean {
        return true;
        // return this._identityService.isAuthorizedCustomer;
    }

    get componentId(): string {
        return TrendIndexComponent.componentName;
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

    get myAutoTradingAccount(): string {
        return this._identityService.myTradingAccount;
    }

    get userAutoTradingInfoData(): IUserAutoTradingInfoData {
        return this._userAutoTradingInfoData;
    }


    vm: TrendIndexVM[] = [];
    selectedVM: TrendIndexVM;

    editMode = false;

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

            if (this.myAutoTradingAccount && !this._userAutoTradingInfoData) {
                this.loadUserAutoTradingInfoForAccount();
            } else {
                this.loadAutoTradingInstruments();
            }
        }, 60 * 1000);

        this.loadData();

        this._identityService.myTradingAccount$.subscribe(() => {
            this.editMode = false;
            this._changesDetected = true;
            this.loadUserAutoTradingInfoForAccount();
        });
    }

    protected loadUserAutoTradingInfoForAccount() {
        if (this.myAutoTradingAccount) {
            this._algoService.getUserAutoTradingInfoForAccount(this.myAutoTradingAccount).subscribe((data) => {
                this._userAutoTradingInfoData = data;
                this.loadAutoTradingInstruments();
                this._changesDetected = true;
            }, () => {
                this._tradableInstruments = [];
                this._userAutoTradingInfoData = null;
                this._changesDetected = true;
            });
        } else {
            this._tradableInstruments = [];
            this._userAutoTradingInfoData = null;
            this._changesDetected = true;
        }
    }

    protected loadData() {
        this._algoService.getMesaTrendIndexes().subscribe((data) => {
            for (let item of data) {
                try {
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
                } catch (ex) { }
            }

            this.rankByGroups();
            // this.rankByTrending();

            this.loading = false;
            this._changesDetected = true;
        });
    }

    private rankByTrending() {
        this.vm.sort((a1, a2) => a1.totalStrength > a2.totalStrength ? -1 : 1);

        this.vm.forEach((_) => {
            _.type = OtherMarkets;
        });
        
        if (this.vm.length > 18) {
            this.vm.slice(0, 9).forEach((_) => {
                _.type = TopUpTrending;
            });

            let downtrending = this.vm.slice(-9);
            downtrending.forEach((_) => {
                _.type = TopDownTrending;
            });
            downtrending.reverse();
            this.vm.splice(-9);
            this.vm.push(...downtrending);
        }

        this.groups = [TopUpTrending, TopDownTrending, OtherMarkets];

        this.vm = this.vm.slice();
    }

    private rankByGroups() {
        for (let item of this.vm) {
            if (Math.abs(item.totalStrength) * 100 > 21) {
                if (Metals.indexOf(item.id) >= 0) {
                    item.type = `Metals`;
                } else if (Indices.indexOf(item.id) >= 0) {
                    item.type = `Indices`;
                } else if (Bounds.indexOf(item.id) >= 0) {
                    item.type = `Bounds`;
                } else if (Commodities.indexOf(item.id) >= 0) {
                    item.type = `Commodities`;
                } else if (Crypto.indexOf(item.id) >= 0) {
                    item.type = `Crypto`;
                } else {
                    let currencies = item.id.split("_");
                    item.type = `${currencies[1]}`;
                }
            }

            if (!item.type) {
                item.type = OtherMarkets;
            }
        }

        let groupsData: ISymbolGroup[] = [];
        for (let item of this.vm) {
            let g = groupsData.find((_) => _.group === item.type);
            if (!g) {
                g = {
                    group: item.type,
                    count: 1,
                    strength: Math.abs(item.totalStrength),
                    avgStrength: 0
                };
                groupsData.push(g);
            } else {
                g.count += 1;
                g.strength += Math.abs(item.totalStrength);
            }
        }

        for (let gd of groupsData) {
            if (gd.group === OtherMarkets) {
                continue;
            }

            // gd.avgStrength = gd.strength / gd.count;
            gd.avgStrength = gd.strength;
        }

        groupsData.sort((a1, a2) => Math.abs(a1.avgStrength) > Math.abs(a2.avgStrength) ? -1 : 1);

        this.groups = groupsData.map((_) => _.group);

        let usedInGroups = this.vm.filter((_) => _.type !== OtherMarkets);
        let notUsedInGroups = this.vm.filter((_) => _.type === OtherMarkets);

        usedInGroups.sort((a1, a2) => Math.abs(a1.totalStrength) > Math.abs(a2.totalStrength) ? -1 : 1);
        notUsedInGroups.sort((a1, a2) => a1.totalStrength > a2.totalStrength ? -1 : 1);

        this.vm = [...usedInGroups, ...notUsedInGroups];
    }

    protected loadAutoTradingInstruments() {
        if (this.myAutoTradingAccount && this._userAutoTradingInfoData) {
            this._algoService.getTrendIndexTradableInstrumentForAccount(this.myAutoTradingAccount).subscribe((data) => {
                this._tradableInstruments = data;
                this._changesDetected = true;
            }, () => {
                this._tradableInstruments = [];
                this._changesDetected = true;
            });
        } else {
            this._tradableInstruments = [];
        }
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
        if (this.editMode) {
            return;
        }
        this.selectVMItem(instrumentVM);
    }

    selectVMItem(instrumentVM: TrendIndexVM) {
        this.selectedVM = instrumentVM;

        this.loading = true;
        this._changesDetected = true;

        this._algoService.getMesaTrendDetails(instrumentVM.id, instrumentVM.datafeed).subscribe((data) => {
            if (data) {
                this._chartDataTrends = [];

                let minDate = 0;
                let maxDate = 0;
                for (let tf in data.mesa) {
                    let mesaDataList = data.mesa[tf].slice(-2500);
                    if (!mesaDataList.length) {
                        continue;
                    }

                    let firstTime = mesaDataList[0].t;
                    let lastTime = mesaDataList[mesaDataList.length - 1].t;

                    if (firstTime > minDate) {
                        minDate = firstTime;
                    }
                    if (lastTime > maxDate) {
                        maxDate = lastTime;
                    }
                }

                this._chartDataBars = {
                    data: {
                        dates: [],
                        values: [],
                        isUpTrending: instrumentVM.totalStrength > 0
                    },
                    timeframe: this._tfToString(60),
                    symbol: instrumentVM.symbol,
                    startDate: new Date(minDate * 1000).toLocaleString(),
                    endDate: new Date(maxDate * 1000).toLocaleString()
                };

                for (let tf in data.mesa) {
                    let mesaValues: number[] = [];
                    let mesaDates: string[] = [];
                    let avg = instrumentVM.avg_strength[tf];
                    if (!avg) {
                        continue;
                    }

                    let mesaDataList = data.mesa[tf];
                    let tfNumber = Number(tf);
                    if (tfNumber < 10 * 60) {
                        tfNumber = 15 * 60;
                    } else if (tfNumber > 60 * 60) {
                        tfNumber = 60 * 60;
                    }

                    for (let i = 0; i < mesaDataList.length; i++) {
                        let mesaItem = mesaDataList[i];
                        if (mesaItem.t > minDate) {
                            if (mesaItem.t % tfNumber === 0 || i === mesaDataList.length - 1) {
                                mesaValues.push((mesaItem.f - mesaItem.s) / avg * 100);
                                mesaDates.push(new Date(mesaItem.t * 1000).toLocaleString());
                            }
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
            case 1: return "D";
            case 60: return "1m";
            case 300: return "5m";
            case 900: return "15m";
            case 3600: return "1h";
            case 14400: return "4h";
            case 86400: return "1d";
            case 2592000: return "1M";
        }
        return tf + " Mins";
    }

    formatDateToShortForm(dateString: string): string {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
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
        if (Math.abs(value) >= 40) {
            return "Good Strength";
        }
        if (Math.abs(value) >= 35) {
            return "New Strength";
        }
        if (Math.abs(value) >= 30) {
            return "Building Strength";
        }
        if (Math.abs(value) >= 15) {
            return "Weak Strength";
        }
        if (Math.abs(value) >= 10) {
            return "No Strength";
        }
        return "No Strength";
    }

    isTradable(item: TrendIndexVM) {
        if (!this.myAutoTradingAccount) {
            return false;
        }

        for (let symbol of this._tradableInstruments) {
            let s1 = symbol.replace("_", "").toUpperCase();
            let s2 = item.symbol.replace("_", "").toUpperCase();
            if (s1 === s2) {
                return true;
            }
        }

        return false;
    }

    isAutoSelected(item: TrendIndexVM) {
        let isUserSelected = this.isInstrumentSelected(item);
        return !isUserSelected;
    }

    setEditMode() {
        this.editMode = true;
        this._cdr.markForCheck();
        setTimeout(() => {
            this.dataTableComponent.updateDimensions();
            this._cdr.markForCheck();
        }, 1);
    }

    unsetEditMode() {
        this.editMode = false;
        this._cdr.markForCheck();
        setTimeout(() => {
            this.dataTableComponent.updateDimensions();
            this._cdr.markForCheck();
        }, 1);
    }

    isInstrumentSelected(item: TrendIndexVM) {
        if (!this._userAutoTradingInfoData || !this._userAutoTradingInfoData.markets || !this._userAutoTradingInfoData.markets.length) {
            return false;
        }

        for (let m of this._userAutoTradingInfoData.markets) {
            if (m.symbol && m.symbol.replace("_", "").toLowerCase() === item.symbol.replace("_", "").toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    instrumentSelectionChanged(item: TrendIndexVM) {
        let isSelected = this.isInstrumentSelected(item);
        let symbol = item.symbol.replace("_", "").toUpperCase();
        this.loading = true;
        if (!isSelected) {
            this._algoService.addTradableInstrumentForAccount(this.myAutoTradingAccount, this._identityService.id, [symbol]).subscribe((data) => {
                this._userAutoTradingInfoData = data;
                this.loading = false;
                this._changesDetected = true;
            }, () => {
                this.loading = false;
                this._changesDetected = true;
            });
        } else {
            this._algoService.removeTradableInstrumentForAccount(this.myAutoTradingAccount, this._identityService.id, [symbol]).subscribe((data) => {
                this._userAutoTradingInfoData = data;
                this.loading = false;
                this._changesDetected = true;
            }, () => {
                this.loading = false;
                this._changesDetected = true;
            });
        }
    }

    changeUseManualTradingForAccount() {
        this.loading = true;
        this._algoService.changeUseManualTradingForAccount(this.myAutoTradingAccount, this._identityService.id, !this._userAutoTradingInfoData.useManualTrading).subscribe((data) => {
            this._userAutoTradingInfoData = data;
            this.loading = false;
            this._changesDetected = true;
        }, () => {
            this.loading = false;
            this._changesDetected = true;
        });
    }

    private _raiseStateChanged() {
        if (!this._initialized) {
            return;
        }

        this.stateChanged.next(this);
    }
}
