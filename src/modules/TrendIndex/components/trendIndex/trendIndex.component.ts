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
import { AlgoService, IAutoTradingSymbolInfoResponse, IMesaTrendIndex, INALog, ITrendPeriodDescriptionResponse, IUserAutoTradingInfoData, IUserMarketConfigData, TradingDirection } from "@app/services/algo.service";
import { InstrumentService } from "@app/services/instrument.service";
import { ITrendIndexBarChartData } from "../trendIndexBarChart/trendIndexBarChart.component";
import { ITrendIndexChartData } from "../trendIndexChart/trendIndexChart.component";
import { TimeSpan } from "@app/helpers/timeFrame.helper";
import { DataTableComponent } from "modules/datatable/components/data-table/data-table.component";
import { IJSONViewDialogData, JSONViewDialogComponent } from "modules/Shared/components/json-view/json-view-dialog.component";
import { IPercentageInputModalConfig, PercentageInputModalComponent } from "modules/UI/components/percentage-input-modal/percentage-input-modal.component";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BotTradingSettingsComponent } from 'modules/BreakfreeTrading/components/bot-trading/bot-trading-settings/bot-trading-settings.component';
import { MatSelectChange } from "@angular/material/select";
import { ConfirmModalComponent } from "UI";
import { TradingDirectionModalComponent } from "modules/UI/components/trading-direction-input-modal/trading-direction-input-modal.component";
import { UserSettingsService } from "@app/services/user-settings/user-settings.service";

// const Metals = ["XAG_EUR", "XAG_USD", "XAU_EUR", "XAU_USD", "XAU_XAG", "XPD_USD", "XPT_USD"];
// const Indices = ["AU200_AUD", "CN50_USD", "EU50_EUR", "FR40_EUR", "DE30_EUR", "HK33_HKD", "IN50_USD", "JP225_USD", "NL25_EUR", "SG30_SGD", "TWIX_USD", "UK100_GBP", "NAS100_USD", "US2000_USD", "SPX500_USD", "US30_USD"];
// const Bounds = ["DE10YB_EUR", "UK100_GBP", "USB02Y_USD", "USB30Y_USD"];
// const Commodities = ["BCO_USD", "CORN_USD", "NATGAS_USD", "SOYBN_USD", "WHEAT_USD", "WTICO_USD", "XCU_USD"];
// const Crypto = ["BTCUSDT", "ETHUSDT", "LTCUSDT", "SOLUSDT"];
const OtherMarkets = "Unaligned Markets";
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

enum StrategyType {
    Auto = -1,
    SR = 0,
    N = 2
}

enum PhaseState {
    Capitulation = 1,
    Tail = 2,
    Drive = 3,
    CD = 4,
    CapitulationTransition = 5,
    TailTransition = 6,
    DriveTransition = 7
}

interface ITrendIndexChartDataVM {
    strengthChart: ITrendIndexChartData;
    volatilityChart: ITrendIndexChartData;
    strength: number;
    volatility: number;
    timeframe: string;
    phase: string;
    granularity: number;
}

interface ITrendIndexBarChartDataVM {
    data: ITrendIndexBarChartData;
    timeframe: string;
    symbol: string;
    startDate: string;
    endDate: string;
}

function GetPhaseName(p: number): string {
    let phase = "None";
    if (p === PhaseState.Capitulation) {
        phase = "Capitulation";
    } else if (p === PhaseState.Tail) {
        phase = "Tail";
    } else if (p === PhaseState.Drive) {
        phase = "Drive";
    } else if (p === PhaseState.CD) {
        phase = "Counter Drive";
    } else if (p === PhaseState.CapitulationTransition) {
        phase = "Cap Transition";
    } else if (p === PhaseState.TailTransition) {
        phase = "Tail Transition";
    } else if (p === PhaseState.DriveTransition) {
        phase = "Drive Transition";
    }
    return phase;
}

function GetPhaseShortName(p: number): string {
    let phase = "None";
    if (p === PhaseState.Capitulation) {
        phase = "Cap";
    } else if (p === PhaseState.Tail) {
        phase = "Tail";
    } else if (p === PhaseState.Drive) {
        phase = "Drive";
    } else if (p === PhaseState.CD) {
        phase = "C-D";
    } else if (p === PhaseState.CapitulationTransition) {
        phase = "Cap Trans";
    } else if (p === PhaseState.TailTransition) {
        phase = "Tail Trans";
    } else if (p === PhaseState.DriveTransition) {
        phase = "Drive Trans";
    }
    return phase;
}

class TrendIndexVM {
    type: string;
    avg_strength: { [id: string]: number; };
    trend_phases: { [id: string]: string; };
    trend_period_descriptions: { [key: number]: ITrendPeriodDescriptionResponse };

    id: string;
    symbol: string;
    datafeed: string;
    last_price: number;
    price1StrengthValue: number;
    price1VolatilityValue: number;
    price1Strength: ETrendIndexStrength;
    price60StrengthValue: number;
    price60VolatilityValue: number;
    price60Strength: ETrendIndexStrength;
    price300StrengthValue: number;
    price300VolatilityValue: number;
    price300Strength: ETrendIndexStrength;
    price900StrengthValue: number;
    price900VolatilityValue: number;
    price900Strength: ETrendIndexStrength;
    price3600StrengthValue: number;
    price3600VolatilityValue: number;
    price3600Strength: ETrendIndexStrength;
    price14400StrengthValue: number;
    price14400VolatilityValue: number;
    price14400Strength: ETrendIndexStrength;
    price86400StrengthValue: number;
    price86400VolatilityValue: number;
    price86400Strength: ETrendIndexStrength;
    price2592000StrengthValue: number;
    price2592000VolatilityValue: number;
    price2592000Strength: ETrendIndexStrength;
    price31104000StrengthValue: number;
    price31104000VolatilityValue: number;
    price31104000Strength: ETrendIndexStrength;
    price311040000StrengthValue: number;
    price311040000VolatilityValue: number;
    price311040000Strength: ETrendIndexStrength;
    totalStrength: number;
    tradingState: number;

    minute1State: number;
    minute5State: number;
    minute15State: number;
    hour1State: number;
    hour4State: number;
    dailyState: number;
    monthlyState: number;
    yearlyState: number;
    year10State: number;

    minute1Phase: string;
    minute5Phase: string;
    minute15Phase: string;
    hour1Phase: string;
    hour4Phase: string;
    dailyPhase: string;
    monthlyPhase: string;
    yearlyPhase: string;
    year10Phase: string;

    driveDuration: string;
    minute1Duration: string;
    minute5Duration: string;
    minute15Duration: string;
    hour1Duration: string;
    hour4Duration: string;
    dailyDuration: string;
    monthlyDuration: string;

    currentMarketState: string;
    get abbreviatedCurrentMarketState(): string {
        return this.currentMarketState
            .split(' ')
            .map(word => word[0])
            .join('');
    }
    expectedMarketState: string;

    shortGroupStrengthValue: number;
    shortGroupVolatilityValue: number;
    shortGroupStrength: ETrendIndexStrength;
    shortGroupDuration: string;
    shortGroupPhase: string;

    midGroupStrengthValue: number;
    midGroupVolatilityValue: number;
    midGroupStrength: ETrendIndexStrength;
    midGroupDuration: string;
    midGroupPhase: string;

    longGroupStrengthValue: number;
    longGroupVolatilityValue: number;
    longGroupStrength: ETrendIndexStrength;
    longGroupDuration: string;
    longGroupPhase: string;

    risk: number;
    strategyType: StrategyType;

    public static getDurationString(t: number) {
        if (!t) {
            return "";
        }
        if (t < 0) {
            return "Exceeded";
        }

        let minutes = Math.floor(t / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
        let weeks = Math.floor(days / 7);

        if (hours < 1) {
            return minutes.toFixed(0) + " m";
        }

        if (days < 1) {
            return hours.toFixed(0) + " h";
        }

        if (weeks < 1) {
            return days.toFixed(0) + " d";
        }
        return weeks.toFixed(0) + " w";
    }

    public setData(data: IMesaTrendIndex, strategyType: StrategyType) {
        this.id = data.symbol;
        this.strategyType = strategyType;
        this.type = data.group ? data.group : OtherMarkets;
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
        let s_31104000 = 0;
        let s_311040000 = 0;
        if (data.timeframe_strengths) {
            s_1 = data.timeframe_strengths["1"] || 0;
            s_60 = data.timeframe_strengths["60"] || 0;
            s_300 = data.timeframe_strengths["300"] || 0;
            s_900 = data.timeframe_strengths["900"] || 0;
            s_3600 = data.timeframe_strengths["3600"] || 0;
            s_14400 = data.timeframe_strengths["14400"] || 0;
            s_86400 = data.timeframe_strengths["86400"] || 0;
            s_2592000 = data.timeframe_strengths["2592000"] || 0;
            s_31104000 = data.timeframe_strengths["31104000"] || 0;
            s_311040000 = data.timeframe_strengths["311040000"] || 0;
        }

        if (data.volatility) {
            this.price1VolatilityValue = data.volatility["1"] - 100 || 0;
            this.price60VolatilityValue = data.volatility["60"] - 100 || 0;
            this.price300VolatilityValue = data.volatility["300"] - 100 || 0;
            this.price900VolatilityValue = data.volatility["900"] - 100 || 0;
            this.price3600VolatilityValue = data.volatility["3600"] - 100 || 0;
            this.price14400VolatilityValue = data.volatility["14400"] - 100 || 0;
            this.price86400VolatilityValue = data.volatility["86400"] - 100 || 0;
            this.price2592000VolatilityValue = data.volatility["2592000"] - 100 || 0;
            this.price31104000VolatilityValue = data.volatility["31104000"] - 100 || 0;
            this.price311040000VolatilityValue = data.volatility["311040000"] - 100 || 0;
        }

        if (data.durations) {
            this.driveDuration = TrendIndexVM.getDurationString(data.durations["1"]);
            this.minute1Duration = TrendIndexVM.getDurationString(data.durations["60"]);
            this.minute5Duration = TrendIndexVM.getDurationString(data.durations["300"]);
            this.minute15Duration = TrendIndexVM.getDurationString(data.durations["900"]);
            this.hour1Duration = TrendIndexVM.getDurationString(data.durations["3600"]);
            this.hour4Duration = TrendIndexVM.getDurationString(data.durations["14400"]);
            this.dailyDuration = TrendIndexVM.getDurationString(data.durations["86400"]);
            this.monthlyDuration = TrendIndexVM.getDurationString(data.durations["2592000"]);
        }

        if (data.timeframe_state) {
            this.minute1State = data.timeframe_state["60"];
            this.minute5State = data.timeframe_state["300"];
            this.minute15State = data.timeframe_state["900"];
            this.hour1State = data.timeframe_state["3600"];
            this.hour4State = data.timeframe_state["14400"];
            this.dailyState = data.timeframe_state["86400"];
            this.monthlyState = data.timeframe_state["2592000"];
            this.yearlyState = data.timeframe_state["31104000"];
            this.year10State = data.timeframe_state["311040000"];
        }

        this.trend_phases = {};
        if (data.timeframe_phase) {
            this.minute1Phase = GetPhaseShortName(data.timeframe_phase["60"]);
            this.trend_phases["60"] = this.minute1Phase;
            this.minute5Phase = GetPhaseShortName(data.timeframe_phase["300"]);
            this.trend_phases["300"] = this.minute5Phase;
            this.minute15Phase = GetPhaseShortName(data.timeframe_phase["900"]);
            this.trend_phases["900"] = this.minute15Phase;
            this.hour1Phase = GetPhaseShortName(data.timeframe_phase["3600"]);
            this.trend_phases["3600"] = this.hour1Phase;
            this.hour4Phase = GetPhaseShortName(data.timeframe_phase["14400"]);
            this.trend_phases["14400"] = this.hour4Phase;
            this.dailyPhase = GetPhaseShortName(data.timeframe_phase["86400"]);
            this.trend_phases["86400"] = this.dailyPhase;
            this.monthlyPhase = GetPhaseShortName(data.timeframe_phase["2592000"]);
            this.trend_phases["2592000"] = this.monthlyPhase;
            this.yearlyPhase = GetPhaseShortName(data.timeframe_phase["31104000"]);
            this.trend_phases["31104000"] = this.yearlyPhase;
            this.year10Phase = GetPhaseShortName(data.timeframe_phase["311040000"]);
            this.trend_phases["311040000"] = this.year10Phase;
        }

        this.trend_period_descriptions = data.trend_period_descriptions;

        this.totalStrength = data.total_strength;

        this.price1StrengthValue = s_1;
        this.price60StrengthValue = s_60;
        this.price300StrengthValue = s_300;
        this.price900StrengthValue = s_900;
        this.price3600StrengthValue = s_3600;
        this.price14400StrengthValue = s_14400;
        this.price86400StrengthValue = s_86400;
        this.price2592000StrengthValue = s_2592000;
        this.price31104000StrengthValue = s_31104000;
        this.price311040000StrengthValue = s_311040000;

        this.price1Strength = this._getStrength(s_1);
        this.price60Strength = this._getStrength(s_60);
        this.price300Strength = this._getStrength(s_300);
        this.price900Strength = this._getStrength(s_900);
        this.price3600Strength = this._getStrength(s_3600);
        this.price14400Strength = this._getStrength(s_14400);
        this.price86400Strength = this._getStrength(s_86400);
        this.price2592000Strength = this._getStrength(s_2592000);
        this.price31104000Strength = this._getStrength(s_31104000);
        this.price311040000Strength = this._getStrength(s_311040000);

        this.currentMarketState = GetPhaseName(data.current_phase);
        this.expectedMarketState = GetPhaseName(data.next_phase);

        if (strategyType === StrategyType.N) {
            this.tradingState = data.trading_state_n;
        } else if (strategyType === StrategyType.SR) {
            this.tradingState = data.trading_state_sr;
        } else {
            if (data.trading_state_n === 2) {
                this.tradingState = 2;
                this.strategyType = StrategyType.N;
            } else {
                this.tradingState = data.trading_state_sr;
                this.strategyType = StrategyType.SR;
            }
        }

        for (let key in this.trend_period_descriptions) {
            let item = this.trend_period_descriptions[key];
            if (key === "0") {
                this.shortGroupStrengthValue = item.strength;
                this.shortGroupStrength = this._getStrength(item.strength);
                this.shortGroupPhase = GetPhaseShortName(item.phase);
                this.shortGroupVolatilityValue = item.volatility;
                this.shortGroupDuration = TrendIndexVM.getDurationString(item.duration);
            } else if (key === "1") {
                this.midGroupStrengthValue = item.strength;
                this.midGroupStrength = this._getStrength(item.strength);
                this.midGroupPhase = GetPhaseShortName(item.phase);
                this.midGroupVolatilityValue = item.volatility;
                this.midGroupDuration = TrendIndexVM.getDurationString(item.duration);
            } else if (key === "2") {
                this.longGroupStrengthValue = item.strength;
                this.longGroupStrength = this._getStrength(item.strength);
                this.longGroupPhase = GetPhaseShortName(item.phase);
                this.longGroupVolatilityValue = item.volatility;
                this.longGroupDuration = TrendIndexVM.getDurationString(item.duration);
            }
        }
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
    emptyResponse: boolean;
    instrumentsPriceHistory: { [symbolName: string]: number[] } = {};

    private _realtimeSubscriptions: { [instrumentHash: string]: Subscription } = {};
    private _initialized: boolean;
    private _changesDetected: boolean;
    private _updateInterval: any;
    private _reloadInterval: any;
    private _logRefreshInterval: any;
    private _state: ITrendIndexComponentState;
    private _chartDataBars: ITrendIndexBarChartDataVM;
    private _chartDataTrends: ITrendIndexChartDataVM[] = [];
    private _tradableInstruments: IUserMarketConfigData[] = [];
    private _userAutoTradingInfoData: IUserAutoTradingInfoData;
    private _singleRowClickTimer;
    private _lastLogRefreshTime: number;
    private _maxInstrumentCount: number = null;
    private _myAutoTradingAccount: string;
    private _adminData: { [key: string]: IAutoTradingSymbolInfoResponse; };

    public logs: INALog[] = [];
    public isBotOnline: boolean;
    public updateTime: number;
    public naVersion: string;

    public groups: string[] = [];
    public groupingField: string = "type";
    public extendedMode: boolean = false;
    public riskManagementVisible: boolean = false;
    public logsVisible: boolean = false;
    public isSync: boolean = false;
    public autoAvailable: number = null;
    public autoSelected: number = null;
    public hitlAvailable: number = null;
    public hitlSelected: number = null;
    public showLogsButtons: boolean = false;
    // public strategyType: StrategyType = StrategyType.SR;

    public get hasAccess(): boolean {
        return true;
        // return this._identityService.isAuthorizedCustomer;
    }

    get lastLogRefreshTime(): Date {
        if (!this._lastLogRefreshTime) {
            return null;
        }
        return new Date(this._lastLogRefreshTime);
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
        return this._myAutoTradingAccount;
    }

    get myAutoTradingAccounts(): string[] {
        return this._identityService.myTradingAccounts;
    }

    get userAutoTradingInfoData(): IUserAutoTradingInfoData {
        return this._userAutoTradingInfoData;
    }

    get strategyType(): StrategyType {
        return this._userAutoTradingInfoData ? this._userAutoTradingInfoData.strategy : null;
    }

    get risksPerGroup(): { [key: string]: number } {
        return this._userAutoTradingInfoData ? this._userAutoTradingInfoData.risksPerGroup : null;
    }

    get accountRisk(): number {
        return this._userAutoTradingInfoData ? this._userAutoTradingInfoData.accountRisk : null;
    }

    get defaultMarketRisk(): number {
        return this._userAutoTradingInfoData ? this._userAutoTradingInfoData.defaultMarketRisk : null;
    }

    get defaultGroupRisk(): number {
        return this._userAutoTradingInfoData ? this._userAutoTradingInfoData.defaultGroupRisk : null;
    }

    get maxInstrumentCount(): number {
        return this._maxInstrumentCount;
    }

    get botShutDown(): boolean {
        return this._userAutoTradingInfoData ? this._userAutoTradingInfoData.botShutDown : false;
    }

    get isBotConnected(): boolean {
        return !!this.myAutoTradingAccount && !!this.userAutoTradingInfoData;
    }

    get isAdmin(): boolean {
        return this._identityService.isAdmin;
    }

    vm: TrendIndexVM[] = [];
    selectedVM: TrendIndexVM;
    TradingDirection = TradingDirection;

    constructor(protected _realtimeService: RealtimeService,
        protected _translateService: TranslateService,
        protected _layoutManagerService: LayoutManagerService,
        protected _alertManager: AlertService,
        protected _algoService: AlgoService,
        protected _instrumentService: InstrumentService,
        protected _cdr: ChangeDetectorRef,
        protected _identityService: IdentityService,
        protected _serSettingsService: UserSettingsService,
        protected _matDialog: MatDialog) {
        super();

        _serSettingsService.getSettings().subscribe((s) => {
            this.showLogsButtons = !!s.showLogsButtons;
        });
    }

    toggleUseManualTradingForAccount() {
        this.userAutoTradingInfoData.useManualTrading = !this.userAutoTradingInfoData.useManualTrading;
        this._cdr.detectChanges(); // trigger change detection
    }

    toggleRiskManagement() {
        this.riskManagementVisible = !this.riskManagementVisible;
    }

    ngOnInit() {
        this.initialized.next(this);
    }

    initData() {
        if (!this.hasAccess) {
            return;
        }

        this.loading = true;

        this._myAutoTradingAccount = this._identityService.myTradingAccount;

        this._updateInterval = setInterval(() => {
            if (this._changesDetected) {
                this._cdr.markForCheck();
            }
            this._changesDetected = false;
        }, 500);

        this._reloadInterval = setInterval(() => {
            this.loadData();
            if (this.myAutoTradingAccount && !this._userAutoTradingInfoData) {
                this.loadUserAutoTradingInfoForAccount(false);
            } else {
                this.loadAutoTradingInstruments();
            }
            this.loadAdminData();
        }, 60 * 1000);

        this._logRefreshInterval = setInterval(() => {
            if (!this.logsVisible) {
                return;
            }
            this.getUserAutoTradingRuntimeLogs();
        }, 3 * 60 * 1000);

        this.loadData();
        this.loadAdminData();

        this._identityService.myTradingAccount$.subscribe(() => {
            this._changesDetected = true;
            this._myAutoTradingAccount = this._identityService.myTradingAccount;
            this.loadUserAutoTradingInfoForAccount(true);
            this.getUserAutoTradingRuntimeLogs();
        });
    }

    accountChanged(accountChange: MatSelectChange) {
        if (accountChange.value) {
            this._identityService.setMyAutoTradingAccount(accountChange.value);
        } else {
            this._changesDetected = true;
            accountChange.source.value = this._identityService.myTradingAccount;
            // this._myAutoTradingAccount = accountChange.source.value;
        }
    }

    manageAccounts(event: MouseEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.botSettings();
    }

    protected setRisksForInstruments() {
        if (!this._userAutoTradingInfoData || !this._userAutoTradingInfoData.risksPerMarket || !this.vm) {
            return;
        }

        for (let i of this.vm) {
            let dataSet = false;
            for (let s in this._userAutoTradingInfoData.risksPerMarket) {
                let nS1 = s.replace("_", "").toUpperCase();
                let nS2 = i.symbol.replace("_", "").toUpperCase();

                if (nS1 === nS2) {
                    i.risk = this._userAutoTradingInfoData.risksPerMarket[s];
                    dataSet = true;
                    break;
                }
            }

            if (!dataSet) {
                i.risk = this._userAutoTradingInfoData.defaultMarketRisk;
            }
        }

        this.countInfo();
    }

    resetToDefaultSettings() {
        this._matDialog.open(ConfirmModalComponent, {
            data: {
                message: `Do you really want to reset you NA settings to default for account #${this.myAutoTradingAccount}?`,
                onConfirm: () => {
                    this._resetToDefaultSettings();
                }
            }
        });
    }

    protected _resetToDefaultSettings() {
        this.loading = true;
        this._algoService.resetBotSettingsToDefault(this.myAutoTradingAccount, this._identityService.id).subscribe((data) => {
            this._userAutoTradingInfoData = data;
            this.loadUpdatedData();
        }, (_) => {
            if (_ && _.status === 403 && _.error) {
                this._alertManager.info(_.error);
            } else {
                this._alertManager.info("Failed to reset settings");
            }
            this.loading = false;
            this._changesDetected = true;
        });
    }

    protected loadUserAutoTradingInfoForAccount(showSpinner: boolean) {
        if (this.myAutoTradingAccount) {
            if (showSpinner) {
                this.loading = true;
            }
            this._algoService.getUserAutoTradingInfoForAccount(this.myAutoTradingAccount).subscribe((data) => {
                this._userAutoTradingInfoData = data;
                this._maxInstrumentCount = this._userAutoTradingInfoData ? this._userAutoTradingInfoData.maxInstrumentCount : null;
                this.isSync = false;
                this.loadUpdatedData();

                if (showSpinner) {
                    this.loading = false;
                }
            }, (_) => {
                if (_ && _.status === 401 && showSpinner) {
                    this.isSync = true;
                }
                this._tradableInstruments = [];
                this._userAutoTradingInfoData = null;
                this._changesDetected = true;
                this._maxInstrumentCount = null;

                if (showSpinner) {
                    this.loading = false;
                }
            });
        } else {
            this._tradableInstruments = [];
            this._userAutoTradingInfoData = null;
            this._maxInstrumentCount = null;
            this._changesDetected = true;
        }
    }

    protected getUserAutoTradingRuntimeLogs() {
        if (this.myAutoTradingAccount) {
            this._algoService.getUserAutoTradingRuntimeLogs(this.myAutoTradingAccount).subscribe((data) => {
                this._lastLogRefreshTime = new Date().getTime();
                if (data) {
                    this.logs = data.logs;
                    this.naVersion = data.naVersion;

                    if (this.logs) {
                        for (let l of this.logs) {
                            l.date = l.date * 1000;
                        }
                    }
                    if (data.lastOnlineDate) {
                        this.updateTime = data.lastOnlineDate * 1000;
                        let utcNow = new Date().getTime() / 1000;
                        let minPassed = Math.floor((utcNow - data.lastOnlineDate) / 60);
                        this.isBotOnline = minPassed < 3;
                    }
                }
                this._changesDetected = true;
            }, (_) => {
                this._lastLogRefreshTime = new Date().getTime();
                this._changesDetected = true;
            });
        } else {
            this.logs = [];
            this.isBotOnline = false;
            this.updateTime = null;
            this._lastLogRefreshTime = new Date().getTime();
            this._changesDetected = true;
        }
    }

    protected loadData() {
        this._algoService.getMesaTrendIndexes().subscribe((data) => {
            if (data) {
                for (let item of data) {
                    try {
                        let exists = false;
                        for (let existingItem of this.vm) {
                            if (item.symbol === existingItem.id) {
                                existingItem.setData(item, this.strategyType);
                                exists = true;
                                break;
                            }
                        }

                        if (!exists) {
                            let model = new TrendIndexVM();
                            model.setData(item, this.strategyType);
                            this.vm.push(model);
                        }
                    } catch (ex) { }
                }
            }

            this.rankByGroups();
            // this.rankByTrending();

            this.emptyResponse = !(this.vm.length);
            this.loading = false;
            this._changesDetected = true;
        }, () => {
            this.emptyResponse = true;
            this.loading = false;
            this._changesDetected = true;
        });
    }

    protected loadAdminData() {
        if (!this.isAdmin) {
            return;
        }

        this._algoService.getTrendsAdminOverview().subscribe((data) => {
            this._adminData = data;
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
        this.setRisksForInstruments();
    }

    private rankByGroups() {
        let groupsData: ISymbolGroup[] = [];
        for (let item of this.vm) {
            let g = groupsData.find((_) => _.group === item.type);
            let isTradableInstrument = this.isTradable(item);
            let isAutoSelectedInstrument = this.isAutoSelected(item);
            let points = Math.abs(item.totalStrength);

            if (isTradableInstrument) {
                points += 1000;
                if (isAutoSelectedInstrument) {
                    points += 10000;
                }
            }

            if (!g) {
                g = {
                    group: item.type,
                    count: 1,
                    strength: points,
                    avgStrength: 0
                };
                groupsData.push(g);
            } else {
                g.count += 1;
                g.strength += points;
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
        this.setRisksForInstruments();
    }

    protected countInfo() {
        this.autoSelected = 0;
        this.autoAvailable = 0;
        this.hitlSelected = 0;
        this.hitlAvailable = 0;

        for (let v of this.vm) {
            if (v.tradingState === 1) {
                this.hitlAvailable++;
            } else if (v.tradingState === 2) {
                this.autoAvailable++;
                this.autoSelected++;
                if (!this.isTradable(v) || this.isInstrumentDisabled(v)) {
                    this.autoSelected--;
                }
            }
            // if (this.isInstrumentSelected(v)) {
            //     this.hitlSelected++;
            // }
        }

        if (this._userAutoTradingInfoData && this._userAutoTradingInfoData.markets) {
            this.hitlSelected = this._userAutoTradingInfoData.markets.length;
        }
    }

    protected loadAutoTradingInstruments() {
        if (this.myAutoTradingAccount && this._userAutoTradingInfoData) {
            this._algoService.getTrendIndexMarketsConfigForAccount(this.myAutoTradingAccount, this.strategyType).subscribe((data) => {
                this._tradableInstruments = data;
                this.rankByGroups();
                this._changesDetected = true;
            }, () => {
                // this._tradableInstruments = [];
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
        this._matDialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
    }

    private _sendInstrumentChange(instrument: IInstrument) {
        const linkAction: LinkingAction = {
            type: Actions.ChangeInstrumentAndTimeframe,
            data: {
                instrument: instrument,
                timeframe: TimeSpan.MILLISECONDS_IN_HOUR / 1000
            }
        };
        this.onOpenChart.next(linkAction);
    }

    instrumentSelect(instrumentVM: TrendIndexVM) {
        this.selectedVM = instrumentVM;
    }

    showDetails(instrumentVM: TrendIndexVM, e: PointerEvent) {
        e.stopPropagation();
        e.preventDefault();

        let d: { [key: string]: any } = {};

        for (let key in instrumentVM.trend_period_descriptions) {
            let phaseKey;
            if (key === "0") {
                phaseKey = "Short";
            } else if (key === "1") {
                phaseKey = "Mid";
            } else if (key === "2") {
                phaseKey = "Long";
            }

            let item = instrumentVM.trend_period_descriptions[key];

            d[phaseKey] = {
                strength: (item.strength * 100).toFixed(0) + "%",
                volatility: item.volatility ? (item.volatility - 100).toFixed(0) + "%" : "None",
                duration: TrendIndexVM.getDurationString(item.duration),
                phase: GetPhaseName(item.phase)
            };
        }

        this._matDialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Details',
                json: d
            }
        });
    }

    viewOnChart(instrumentVM: TrendIndexVM) {
        this.loading = true;
        this._changesDetected = true;
        this._instrumentService.getInstrumentsBySymbolOrId(instrumentVM.symbol)
            .subscribe((instruments: IInstrument[]) => {
                this.loading = false;
                this._changesDetected = true;
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
                this.loading = false;
                this._changesDetected = true;
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
            case 31104000: return "1Y";
            case 311040000: return "10Y";
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

        // if (this._state && this._state.StrategyType) {
        //     this.strategyType = this._state.StrategyType;
        // }

        this._initialized = true;

        this.initData();
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

        if (this._logRefreshInterval) {
            clearInterval(this._logRefreshInterval);
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
            let s1 = symbol.symbol.replace("_", "").toUpperCase();
            let s2 = item.symbol.replace("_", "").toUpperCase();
            if (s1 === s2) {
                return symbol.isTradable;
            }
        }

        return false;
    }

    getStrategyType(item: TrendIndexVM): number {
        if (!this.myAutoTradingAccount) {
            return;
        }

        for (let symbol of this._tradableInstruments) {
            let s1 = symbol.symbol.replace("_", "").toUpperCase();
            let s2 = item.symbol.replace("_", "").toUpperCase();
            if (s1 === s2 && symbol.isTradable) {
                return item.strategyType;
            }
        }

        return;
    }

    showInfo(item: TrendIndexVM, e: PointerEvent) {
        e.preventDefault();
        e.stopImmediatePropagation();
        for (let i in this._adminData) {
            let names = i.split("_");
            if (names.length < 3) {
                continue;
            }

            names.splice(0, 2);
            let normalizedSymbolName = names.join("").toLowerCase();
            if (normalizedSymbolName === "btcusd") {
                normalizedSymbolName = "btcusdt";
            }
            
            if (normalizedSymbolName !== item.symbol.toLowerCase()) {
                continue;
            }

            this._matDialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
                data: {
                    title: 'Info 1',
                    json: this._adminData[i]
                }
            });
            return;
        }
    }

    showInfo2(item: TrendIndexVM, e: PointerEvent) {
        e.preventDefault();
        e.stopImmediatePropagation();
        this._matDialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Info 2',
                json: item
            }
        });
    }

    isAutoSelected(item: TrendIndexVM) {
        let isUserSelected = this.isInstrumentSelected(item);
        return !isUserSelected;
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

    isInstrumentDisabled(item: TrendIndexVM) {
        if (!this._userAutoTradingInfoData || !this._userAutoTradingInfoData.disabledMarkets || !this._userAutoTradingInfoData.disabledMarkets.length) {
            return false;
        }

        for (let symbol of this._userAutoTradingInfoData.disabledMarkets) {
            if (symbol && symbol.replace("_", "").toLowerCase() === item.symbol.replace("_", "").toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    instrumentTradingDirection(item: TrendIndexVM): TradingDirection {
        if (!this._userAutoTradingInfoData || !this._userAutoTradingInfoData.disabledMarkets || !this._userAutoTradingInfoData.disabledMarkets.length) {
            return null;
        }

        for (let m of this._userAutoTradingInfoData.markets) {
            if (m.symbol && m.symbol.replace("_", "").toLowerCase() === item.symbol.replace("_", "").toLowerCase()) {
                return m.tradingDirection;
            }
        }

        return null;
    }

    instrumentTradingDirectionText(item: TrendIndexVM): string {
        let direction = this.instrumentTradingDirection(item);
        if (direction === TradingDirection.Short) {
            return "Short";
        }
        if (direction === TradingDirection.Long) {
            return "Long";
        }
        return "Auto";
    }

    instrumentSelectionChanged(item: TrendIndexVM, e: PointerEvent) {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.enableDisableHITLTrading(item);
    }

    disableAllAutoTrading() {
        if (!this.isBotConnected) {
            return;
        }

        let forDeselect = [];
        for (let v of this.vm) {
            let isDisabled = this.isInstrumentDisabled(v);
            if (!isDisabled && v.tradingState === 2) {
                let symbol = v.symbol.replace("_", "").toUpperCase();
                forDeselect.push(symbol);
            }
        }

        if (forDeselect.length) {
            this._algoService.disableTradableInstrumentForAccount(this.myAutoTradingAccount, this._identityService.id, forDeselect).subscribe((data) => {
                this._userAutoTradingInfoData = data;
                this.loadUpdatedData();
            }, (_) => {
                if (_ && _.status === 403 && _.error) {
                    this._alertManager.info(_.error);
                } else {
                    this._alertManager.info("Failed to disable trading instrument");
                }
                this.loading = false;
                this._changesDetected = true;
            });
        }
    }

    canEnableAllAutoTrading() {
        if (!this.isBotConnected) {
            return false;
        }

        let forSelect = [];
        for (let v of this.vm) {
            let isDisabled = this.isInstrumentDisabled(v);
            if (isDisabled && v.tradingState === 2) {
                let symbol = v.symbol.replace("_", "").toUpperCase();
                forSelect.push(symbol);
            }
        }

        return forSelect.length > 0;
    }

    canDisableAllAutoTrading() {
        if (!this.isBotConnected) {
            return false;
        }

        let forDeselect = [];
        for (let v of this.vm) {
            let isDisabled = this.isInstrumentDisabled(v);
            if (!isDisabled && v.tradingState === 2) {
                let symbol = v.symbol.replace("_", "").toUpperCase();
                forDeselect.push(symbol);
            }
        }

        return forDeselect.length > 0;
    }

    enableAllAutoTrading() {
        if (!this.isBotConnected) {
            return;
        }

        let forSelect = [];
        for (let v of this.vm) {
            let isDisabled = this.isInstrumentDisabled(v);
            if (isDisabled && v.tradingState === 2) {
                let symbol = v.symbol.replace("_", "").toUpperCase();
                forSelect.push(symbol);
            }
        }

        if (forSelect.length) {
            this._algoService.enableTradableInstrumentForAccount(this.myAutoTradingAccount, this._identityService.id, forSelect).subscribe((data) => {
                this._userAutoTradingInfoData = data;
                this.loadUpdatedData();
            }, (_) => {
                if (_ && _.status === 403 && _.error) {
                    this._alertManager.info(_.error);
                } else {
                    this._alertManager.info("Failed to enable trading instrument");
                }
                this.loading = false;
                this._changesDetected = true;
            });
        }
    }

    disableAllHITLTrading() {
        if (!this.isBotConnected) {
            return;
        }

        if (!this._userAutoTradingInfoData || !this._userAutoTradingInfoData.markets || !this._userAutoTradingInfoData.markets.length) {
            return;
        }

        this._algoService.removeTradableInstrumentForAccount(this.myAutoTradingAccount, this._identityService.id, this._userAutoTradingInfoData.markets.map((_) => _.symbol)).subscribe((data) => {
            this._userAutoTradingInfoData = data;
            this.loadUpdatedData();
        }, (_) => {
            if (_ && _.status === 403 && _.error) {
                this._alertManager.info(_.error);
            } else {
                this._alertManager.info("Failed to disable trading instrument");
            }
            this.loading = false;
            this._changesDetected = true;
        });
    }
    enableDisableHITLTrading(item: TrendIndexVM) {
        if (!this.isBotConnected) {
            return;
        }

        let isSelected = this.isInstrumentSelected(item);
        let symbol = item.symbol.replace("_", "").toUpperCase();
        this.loading = true;
        if (!isSelected) {
            this._matDialog.open<TradingDirectionModalComponent>(TradingDirectionModalComponent).afterClosed().subscribe((value) => {
                if (value === null || value === undefined) {
                    this.loading = false;
                    this._changesDetected = true;
                    return;
                }
                this.addMarkets(symbol, value);
            });
        } else {
            this._algoService.removeTradableInstrumentForAccount(this.myAutoTradingAccount, this._identityService.id, [symbol]).subscribe((data) => {
                this._userAutoTradingInfoData = data;
                this.loadUpdatedData();
            }, (_) => {
                if (_ && _.status === 403 && _.error) {
                    this._alertManager.info(_.error);
                } else {
                    this._alertManager.info("Failed to disable trading instrument");
                }
                this.loading = false;
                this._changesDetected = true;
            });
        }
    }

    private addMarkets(symbol: string, tradingDirection: TradingDirection) {
        this._algoService.addTradableInstrumentForAccount(this.myAutoTradingAccount, this._identityService.id, [{ symbol, tradingDirection }]).subscribe((data) => {
            this._userAutoTradingInfoData = data;
            this.loadUpdatedData();
        }, (_) => {
            if (_ && _.status === 403 && _.error) {
                this._alertManager.info(_.error);
            } else {
                this._alertManager.info("Failed to enable trading instrument");
            }
            this.loading = false;
            this._changesDetected = true;
        });
    }

    enableDisableTrading(item: TrendIndexVM) {
        if (!this.isBotConnected) {
            return;
        }

        let isDisabled = this.isInstrumentDisabled(item);
        let symbol = item.symbol.replace("_", "").toUpperCase();
        this.loading = true;
        if (isDisabled) {
            this._algoService.enableTradableInstrumentForAccount(this.myAutoTradingAccount, this._identityService.id, [symbol]).subscribe((data) => {
                this._userAutoTradingInfoData = data;
                this.loadUpdatedData();
            }, (_) => {
                if (_ && _.status === 403 && _.error) {
                    this._alertManager.info(_.error);
                } else {
                    this._alertManager.info("Failed to enable trading instrument");
                }
                this.loading = false;
                this._changesDetected = true;
            });
        } else {
            this._algoService.disableTradableInstrumentForAccount(this.myAutoTradingAccount, this._identityService.id, [symbol]).subscribe((data) => {
                this._userAutoTradingInfoData = data;
                if (this.isInstrumentSelected(item)) {
                    this.enableDisableHITLTrading(item);
                } else {
                    this.loadUpdatedData();
                }
            }, (_) => {
                if (_ && _.status === 403 && _.error) {
                    this._alertManager.info(_.error);
                } else {
                    this._alertManager.info("Failed to disable trading instrument");
                }
                this.loading = false;
                this._changesDetected = true;
            });
        }
    }

    changeRiskForInstrument(symbol: string, risk: number) {
        this._algoService.changeMarketRiskForAccount(this.myAutoTradingAccount, this._identityService.id, symbol, risk).subscribe((data) => {
            this._userAutoTradingInfoData = data;
            this.loadUpdatedData();
        }, (_) => {
            if (_ && _.status === 403 && _.error) {
                this._alertManager.info(_.error);
            } else {
                this._alertManager.info("Failed to change instrument risk");
            }
            this.loading = false;
            this._changesDetected = true;
        });
    }

    changeGroupRiskForAccount(group: string, risk: number) {
        this._algoService.changeGroupRiskForAccount(this.myAutoTradingAccount, this._identityService.id, group, risk).subscribe((data) => {
            this._userAutoTradingInfoData = data;
            this.loadUpdatedData();
        }, (_) => {
            if (_ && _.status === 403 && _.error) {
                this._alertManager.info(_.error);
            } else {
                this._alertManager.info("Failed to change group risk");
            }
            this.loading = false;
            this._changesDetected = true;
        });
    }

    changeRiskForAccount(risk: number) {
        this._algoService.changeRiskForAccount(this.myAutoTradingAccount, this._identityService.id, risk).subscribe((data) => {
            this._userAutoTradingInfoData = data;
            this.loadUpdatedData();
        }, (_) => {
            if (_ && _.status === 403 && _.error) {
                this._alertManager.info(_.error);
            } else {
                this._alertManager.info("Failed to change instrument risk");
            }
            this.loading = false;
            this._changesDetected = true;
        });
    }

    changeDefaultMarketRisk(risk: number) {
        this._algoService.changeDefaultMarketRisk(this.myAutoTradingAccount, this._identityService.id, risk).subscribe((data) => {
            this._userAutoTradingInfoData = data;
            this.loadUpdatedData();
        }, (_) => {
            if (_ && _.status === 403 && _.error) {
                this._alertManager.info(_.error);
            } else {
                this._alertManager.info("Failed to change instrument risk");
            }
            this.loading = false;
            this._changesDetected = true;
        });
    }

    changeDefaultGroupRisk(risk: number) {
        this._algoService.changeDefaultGroupRisk(this.myAutoTradingAccount, this._identityService.id, risk).subscribe((data) => {
            this._userAutoTradingInfoData = data;
            this.loadUpdatedData();
        }, (_) => {
            if (_ && _.status === 403 && _.error) {
                this._alertManager.info(_.error);
            } else {
                this._alertManager.info("Failed to change group risk");
            }
            this.loading = false;
            this._changesDetected = true;
        });
    }

    changeUseManualTradingForAccount() {
        this.loading = true;
        this._algoService.changeUseManualTradingForAccount(this.myAutoTradingAccount, this._identityService.id, !this._userAutoTradingInfoData.useManualTrading).subscribe((data) => {
            this._userAutoTradingInfoData = data;
            this._tradableInstruments = [];
            this.loadUpdatedData();
        }, () => {
            this.loading = false;
            this._changesDetected = true;
        });
    }

    changeBotEnabledForAccount() {
        this.loading = true;
        this._algoService.changeBotEnabledForAccount(this.myAutoTradingAccount, this._identityService.id, !this._userAutoTradingInfoData.botShutDown).subscribe((data) => {
            this._userAutoTradingInfoData = data;
            this.loadUpdatedData();
        }, () => {
            this.loading = false;
            this._changesDetected = true;
        });
    }

    setExtendedMode() {
        this.extendedMode = !this.extendedMode;
        let extendedColumns = ['short_g', 'mid_g', 'long_g', 'min_1', 'min_5', 'min_15', 'h_1', 'h_4', 'd_1', 'month_1', 'year_1', 'year_10'];
        let groupedColumns = [];

        for (let c of extendedColumns) {
            if (this.extendedMode && !this.dataTableComponent.isColumnVisible(c)) {
                this.dataTableComponent.toggleColumn(c);
            }
            if (!this.extendedMode && this.dataTableComponent.isColumnVisible(c)) {
                this.dataTableComponent.toggleColumn(c);
            }
        }

        for (let c of groupedColumns) {
            if (!this.extendedMode && !this.dataTableComponent.isColumnVisible(c)) {
                this.dataTableComponent.toggleColumn(c);
            }
            if (this.extendedMode && this.dataTableComponent.isColumnVisible(c)) {
                this.dataTableComponent.toggleColumn(c);
            }
        }

        this._changesDetected = true;
    }

    showCharts(instrumentVM: TrendIndexVM) {
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
                    let volatilityValues: number[] = [];
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
                        if (mesaItem.t > minDate || true) {
                            if (mesaItem.t % tfNumber === 0 || i === mesaDataList.length - 1) {
                                mesaValues.push((mesaItem.f - mesaItem.s) / avg * 100);
                                if (mesaItem.v) {
                                    volatilityValues.push(mesaItem.v - 100);
                                }
                                mesaDates.push(new Date(mesaItem.t * 1000).toLocaleString());
                            }
                        }
                    }

                    let phase = instrumentVM.trend_phases[tf];

                    this._chartDataTrends.push({
                        timeframe: this._tfToString(Number(tf)),
                        granularity: Number(tf),
                        strength: mesaValues[mesaValues.length - 1],
                        volatility: volatilityValues[volatilityValues.length - 1],
                        strengthChart: {
                            dates: mesaDates,
                            values: mesaValues,
                        },
                        volatilityChart: {
                            dates: mesaDates,
                            values: volatilityValues
                        },
                        phase: phase
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
    }

    rowClicked(instrumentVM: TrendIndexVM) {
        console.log("rowClicked");
        this.selectedVM = instrumentVM;
        if (this._singleRowClickTimer) {
            clearTimeout(this._singleRowClickTimer);
        }
        this._singleRowClickTimer = setTimeout(() => {
            // this.viewOnChart(this.selectedVM);
            this._singleRowClickTimer = null;
        }, 600);
    }

    setInstrumentRisk(instrumentVM: TrendIndexVM, e: PointerEvent) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (!this.isBotConnected) {
            return;
        }

        this._matDialog.open<PercentageInputModalComponent, IPercentageInputModalConfig>(PercentageInputModalComponent, {
            data: {
                value: instrumentVM.risk > 0 ? instrumentVM.risk : 30,
                title: instrumentVM.symbol + " risk allocation"
            }
        }).afterClosed().subscribe((value) => {
            if (!Number.isFinite(value)) {
                return;
            }
            this.changeRiskForInstrument(instrumentVM.symbol, value);
        });
    }

    setGroupRisk(group: string, e: PointerEvent) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (!this.isBotConnected) {
            return;
        }

        let existingRisk = this.getRiskPerGroup(group);

        this._matDialog.open<PercentageInputModalComponent, IPercentageInputModalConfig>(PercentageInputModalComponent, {
            data: {
                value: existingRisk > 0 ? existingRisk : 100,
                title: group + " group risk allocation"
            }
        }).afterClosed().subscribe((value) => {
            if (!Number.isFinite(value)) {
                return;
            }
            this.changeGroupRiskForAccount(group, value);
        });
    }

    setAccountRisk(e: PointerEvent) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (!this.isBotConnected) {
            return;
        }

        this._matDialog.open<PercentageInputModalComponent, IPercentageInputModalConfig>(PercentageInputModalComponent, {
            data: {
                value: this.accountRisk ? this.accountRisk : 30,
                title: "Risk Allocation"
            }
        }).afterClosed().subscribe((value) => {
            if (!Number.isFinite(value)) {
                return;
            }
            this.changeRiskForAccount(value > 0 ? value : 30);
        });
    }

    setDefaultMarketRisk(e: PointerEvent) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (!this.isBotConnected) {
            return;
        }

        this._matDialog.open<PercentageInputModalComponent, IPercentageInputModalConfig>(PercentageInputModalComponent, {
            data: {
                value: this.defaultMarketRisk ? this.defaultMarketRisk : 12,
                title: "Default Risk Per Market"
            }
        }).afterClosed().subscribe((value) => {
            if (!Number.isFinite(value)) {
                return;
            }
            this.changeDefaultMarketRisk(value > 0 ? value : 12);
        });
    }

    setDefaultGroupRisk(e: PointerEvent) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (!this.isBotConnected) {
            return;
        }

        this._matDialog.open<PercentageInputModalComponent, IPercentageInputModalConfig>(PercentageInputModalComponent, {
            data: {
                value: this.defaultGroupRisk ? this.defaultGroupRisk : 100,
                title: "Default Risk Per Group"
            }
        }).afterClosed().subscribe((value) => {
            if (!Number.isFinite(value)) {
                return;
            }
            this.changeDefaultGroupRisk(value);
        });
    }

    doubleClicked(instrumentVM: TrendIndexVM) {
        return;
        // disabled double click function
        console.log("doubleClicked");
        this.logsVisible = false;
        this.riskManagementVisible = false;
        this.selectedVM = instrumentVM;
        this.showCharts(this.selectedVM);
        if (this._singleRowClickTimer) {
            clearTimeout(this._singleRowClickTimer);
        }
    }

    handleContextMenuSelected(menu_id: string) {
        switch (menu_id) {
            case "openCharts": this.showCharts(this.selectedVM); break;
            case "viewOnChart": this.viewOnChart(this.selectedVM); break;
            case "trade": this.enableDisableHITLTrading(this.selectedVM); break;
            case "disableMarket": this.enableDisableTrading(this.selectedVM); break;
        }
    }

    isSelectedInstrumentTradable() {
        return this.isInstrumentSelected(this.selectedVM);
    }

    isMarketDisabled() {
        return this.isInstrumentDisabled(this.selectedVM);
    }

    public refreshLogs() {
        this._lastLogRefreshTime = null;
        this.getUserAutoTradingRuntimeLogs();
    }

    private loadUpdatedData() {
        this.loading = false;
        this.setRisksForInstruments();
        this.loadAutoTradingInstruments();
    }

    botSettings(): void {
        const screenHeight = window.innerHeight;
        this._matDialog.open(BotTradingSettingsComponent, {
            backdropClass: 'backdrop-background',
            position: {
                top: screenHeight > 667 ? "100px" : null
            }
        });
    }

    botLogs(): void {
        this.logsVisible = !this.logsVisible;
        this._cdr.markForCheck();

        if (!this.logsVisible) {
            return;
        }

        let time = this._lastLogRefreshTime ? this._lastLogRefreshTime : 0;
        let diff = (new Date().getTime() - time) / 1000 / 60;
        if (diff > 1) {
            this._lastLogRefreshTime = null;
            this.getUserAutoTradingRuntimeLogs();
        }
    }

    getRiskPerGroup(group: string): number {
        let groups = this.risksPerGroup;
        if (!!groups) {
            if (groups[group]) {
                return groups[group];
            }
        }

        let defaultRisk = this.defaultGroupRisk;
        if (!!defaultRisk) {
            return defaultRisk;
        }

        return -1;
    }

    getRiskPerGroupText(group: string): string {
        let risk = this.getRiskPerGroup(group);
        if (risk > 0) {
            return risk + "%";
        }

        return "All";
    }

    useSRStrategy() {
        if (this.strategyType === StrategyType.SR) {
            return;
        }

        // this.strategyType = StrategyType.SR;
        // this.loadData();
        // this.loadUserAutoTradingInfoForAccount(true);
        // this.stateChanged.next(this);
        this.changeStrategy(StrategyType.SR);
    }

    useNStrategy() {
        if (this.strategyType === StrategyType.N) {
            return;
        }

        this.changeStrategy(StrategyType.N);
    }

    useCombinedStrategy() {
        if (this.strategyType === StrategyType.Auto) {
            return;
        }

        this.changeStrategy(StrategyType.Auto);
    }

    private changeStrategy(strategy: StrategyType) {
        this.loading = true;
        this._algoService.changeBotStrategyForAccount(this.myAutoTradingAccount, this._identityService.id, strategy).subscribe((data) => {
            this._userAutoTradingInfoData = data;
            this.loadData();
            this.loadUserAutoTradingInfoForAccount(true);
        }, () => {
            this.loading = false;
            this._changesDetected = true;
        });
    }
}
