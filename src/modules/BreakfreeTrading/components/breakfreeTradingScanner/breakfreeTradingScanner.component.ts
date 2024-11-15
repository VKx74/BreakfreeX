import { Component, Inject, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';
import bind from "bind-decorator";
import { Observable, Subscription } from 'rxjs';
import { IInstrument } from '@app/models/common/instrument';
import { AlertService } from "@alert/services/alert.service";
import { AlgoService, IBFTATradeProbability, IBFTATradeType, IBFTATrend, IBFTScanInstrumentsResponse, IBFTScanInstrumentsResponseItem, IBFTScannerHistoryResponse, IBFTScannerResponseHistoryItem, InstrumentTypeId, InstrumentTypeName } from '@app/services/algo.service';
import { Actions, LinkingAction } from '@linking/models/models';
import { InstrumentService } from '@app/services/instrument.service';

// import { MajorForexWatchlist } from 'modules/Watchlist/services/majorForex';
// import { MinorForexWatchlist } from 'modules/Watchlist/services/minorForex';
// import { ExoticsForexWatchlist } from 'modules/Watchlist/services/exoticForex';
// import { IndicesWatchlist } from 'modules/Watchlist/services/indicaes';
// import { CommoditiesWatchlist } from 'modules/Watchlist/services/commodities';
// import { MetalsWatchlist } from 'modules/Watchlist/services/metals';
// import { BondsWatchlist } from 'modules/Watchlist/services/bonds';
// import { EquitiesWatchlist } from 'modules/Watchlist/services/equities';
// import { CryptoWatchlist } from 'modules/Watchlist/services/crypto';

import { IdentityService, SubscriptionType } from '@app/services/auth/identity.service';
import { MatDialog } from '@angular/material/dialog';
import { CheckoutComponent } from '../checkout/checkout.component';
import { TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';
import { SonarAlertDialogComponent } from 'modules/AutoTradingAlerts/components/sonar-alert-dialog/sonar-alert-dialog.component';
import { mockedSonarData } from './mocked-data';
import { mockedHistory } from './mocked-history';
import { BaseLayoutItem } from '@layout/base-layout-item';
import { EMarketType } from '@app/models/common/marketType';

export interface IScannerState {
    featured: IFeaturedResult[];
    timeframes: TimeFrames[];
    types: string[];
}

interface IFeaturedResult {
    symbol: string;
    exchange: string;
    timeframe: number;
    marketType: string;
    color: string;
    trend: IBFTATrend;
    origType: IBFTATradeType;
}

interface IGrouped {
    marketType: string;
    data: IScannerResults[];
}

interface IGroupedResults {
    timeframe: string;
    data: IGrouped[];
}

export interface IScannerResults {
    symbol: string;
    exchange: string;
    timeframe: number;
    tte: string;
    tp: string;
    color?: string;
    volatility: string;
    marketType: string;
    trend: IBFTATrend;
    origType: IBFTATradeType;
    isMocked: boolean;
}

interface IScannerHistoryResults extends IScannerResults {
    time: string;
    date: Date;
}

enum TimeFrames {
    Min1 = "1 Min",
    Min5 = "5 Min",
    Min15 = "15 Min",
    Min30 = "30 Min",
    Hour1 = "1 Hour",
    Hour4 = "4 Hour",
    Day = "Daily",
}

enum TradeTypes {
    Ext = "Extension",
    BRC = "Break Retest & Continuation",
    Swing = "Swing"
}


@Component({
    selector: 'breakfree-trading-scanner',
    templateUrl: './breakfreeTradingScanner.component.html',
    styleUrls: ['./breakfreeTradingScanner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreakfreeTradingScannerComponent extends BaseLayoutItem {
    static componentName = 'BreakfreeTradingScannerWidget';

    private _destroyed: boolean = false;
    private _initialized: boolean;
    private _featured: IFeaturedResult[] = [];
    private _loaded: IBFTScanInstrumentsResponseItem[] = [];
    private _timer: any;
    private _featuredGroupName: string = "Featured";
    private _otherGroupName: string = "Other";
    // private _types: IWatchlistItem[] = [MajorForexWatchlist, MinorForexWatchlist, ExoticsForexWatchlist, IndicesWatchlist, CommoditiesWatchlist, MetalsWatchlist, BondsWatchlist, EquitiesWatchlist, CryptoWatchlist];
    private _supportedTimeframes: number[] = [60, 300, 900, 1800, 3600, 14400, 86400];
    private _loadingProfile: boolean = true;
    private _missionsChangedSubscription: Subscription;

    public SWING = 'SWING';
    public segments: TradeTypes[] = [TradeTypes.Ext, TradeTypes.BRC, TradeTypes.Swing];
    public timeframes: TimeFrames[] = [TimeFrames.Min1, TimeFrames.Min5, TimeFrames.Min15, TimeFrames.Min30, TimeFrames.Hour1, TimeFrames.Hour4];
    public types: string[] = [this._featuredGroupName, InstrumentTypeName.MajorForex, InstrumentTypeName.ForexMinors, InstrumentTypeName.ForexExotics, InstrumentTypeName.Indices, InstrumentTypeName.Commodities, InstrumentTypeName.Metals, InstrumentTypeName.Bonds, InstrumentTypeName.Equities, InstrumentTypeName.Crypto, InstrumentTypeName.Other];
    public groupingField: string = "marketType";
    // public groups: string[] = [];
    public activeSegments: TradeTypes[] = this.segments.slice();
    public activeTimeframes: TimeFrames[] = this.timeframes.slice();
    public activeTypes: string[] = this.types.slice();
    public scannerResults: IScannerResults[] = [];
    public scannerResultsFiltered: IScannerResults[] = [];
    public scannerHistoryResults: IScannerHistoryResults[] = [];
    public scannerHistoryResultsFiltered: IScannerHistoryResults[] = [];
    public selectedScannerResult: IScannerResults;
    public output: string;
    public loading: boolean;
    public trends: any = IBFTATrend;

    get componentId(): string {
        return BreakfreeTradingScannerComponent.componentName;
    }

    public get origType() {
        return IBFTATradeType;
    }

    public get isGuest(): boolean {
        return this._identityService.isGuestMode;
    }

    public get isAuthorizedCustomer(): boolean {
        return this._identityService.isAuthorizedCustomer;
    }

    public get isAdmin(): boolean {
        return this._identityService.isAdmin;
    }

    @ViewChild('content', { static: false }) contentBox: ElementRef;
    @Output() changeView = new EventEmitter<void>();
    
    protected useDefaultLinker(): boolean {
        return true;
    }

    constructor(@Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        private _dialog: MatDialog,
        private _alertService: AlertService,
        protected _instrumentService: InstrumentService,
        private _identityService: IdentityService,
        private _alogService: AlgoService,
        private _cdr: ChangeDetectorRef,
        private _tradingProfileService: TradingProfileService) {
        super();
        // this.groups.push(this._featuredGroupName);
        // this._types.forEach(_ => {
        //     this.groups.push(_.name);
        // });
        // this.groups.push(this._otherGroupName);
        this._missionsChangedSubscription = this._tradingProfileService.MissionChanged.subscribe(() => {
            this._loadingProfile = false;
            this._filterResults(false);
            this._filterResults(true);
        });

        if (this._tradingProfileService.missions) {
            this._loadingProfile = false;
        }
    }

    getState() {
        return {
            featured: this._featured.slice(),
            timeframes: this.activeTimeframes.slice(),
            types: this.activeTypes.slice()
        };
    }

    setState(_state: IScannerState) {
        if (_state && _state.featured && _state.featured.length) {
            this._featured = _state.featured.slice();
        }

        if (_state && _state.timeframes && _state.timeframes.length) {
            this.activeTimeframes = _state.timeframes.slice();
        }

        if (_state && _state.types && _state.types.length) {
            this.activeTypes = _state.types.slice();

            if (this.activeTypes && this.activeTypes.length) {
                for (const t of this.activeTypes) {
                    if (this.types.indexOf(t) === -1) {
                        this.activeTypes = this.types.slice();
                        break;
                    }
                }
            } else {
                this.activeTypes = this.types.slice();
            }
        }

        this._initialized = true;
    }

    isProAccessRestriction(group: IGroupedResults): boolean {
        const tfValue1Min = this.toTimeframe(60 * 1);
        const tfValue5Min = this.toTimeframe(60 * 5);
        // const tfValue15Min = this.toTimeframe(60 * 15);
        // const tfValue30Min = this.toTimeframe(60 * 30);
        if (group.timeframe === tfValue1Min) {
            return this.show1MinAccessRestriction();
        }
        if (group.timeframe === tfValue5Min) {
            return this.show5MinAccessRestriction();
        }
        // if (group.timeframe === tfValue15Min) {
        //     return this.show15MinAccessRestriction();
        // }
        // if (group.timeframe === tfValue30Min) {
        //     return this.show30MinAccessRestriction();
        // }

        return false;
    }

    isLevelRestriction(group: IGroupedResults): boolean {
        const tfValue15Min = this.toTimeframe(60 * 15);
        const _15MinLevelRestriction = this.show15MinLevelRestriction();
        const _15MinAccessRestriction = this.show15MinAccessRestriction();
        if (group.timeframe === tfValue15Min && _15MinLevelRestriction && !_15MinAccessRestriction) {
            return true;
        }

        const tfValue1H = this.toTimeframe(60 * 60);
        const _1HLevelRestriction = this.show1HLevelRestriction();
        const _1HAccessRestriction = this.showHourlyAccessRestriction();
        if (group.timeframe === tfValue1H && _1HLevelRestriction && !_1HAccessRestriction) {
            return true;
        }

        return false;
    }

    show1MinAccessRestriction(): boolean {
        const is1MinAllowed = this._identityService.is1MinAllowed();
        return !is1MinAllowed;
    }

    show1MinLevelRestriction() {
        const level = this._tradingProfileService.level;
        const is1MinAllowedByLevel = this._identityService.is1MinAllowedByLevel(level);
        if (is1MinAllowedByLevel) {
            return false;
        }

        if (this._loadingProfile) {
            return false;
        }

        const is1MinSelected = this.activeTimeframes.indexOf(TimeFrames.Min1) !== -1;
        if (is1MinSelected) {
            return true;
        }

        return false;
    }

    show5MinAccessRestriction(): boolean {
        const is5MinAllowed = this._identityService.is5MinAllowed();
        return !is5MinAllowed;
    }

    show5MinLevelRestriction() {
        const level = this._tradingProfileService.level;
        const is5MinAllowedByLevel = this._identityService.is5MinAllowedByLevel(level);
        if (is5MinAllowedByLevel) {
            return false;
        }

        if (this._loadingProfile) {
            return false;
        }

        const is5MinSelected = this.activeTimeframes.indexOf(TimeFrames.Min5) !== -1;
        if (is5MinSelected) {
            return true;
        }

        return false;
    }

    show15MinAccessRestriction(): boolean {
        const is15MinAllowed = this._identityService.is15MinAllowed();
        return !is15MinAllowed;
    }

    show15MinLevelRestriction() {
        const level = this._tradingProfileService.level;
        const is15MinAllowedByLevel = this._identityService.is15MinAllowedByLevel(level);
        if (is15MinAllowedByLevel) {
            return false;
        }

        if (this._loadingProfile) {
            return false;
        }

        const is15MinSelected = this.activeTimeframes.indexOf(TimeFrames.Min15) !== -1;
        if (is15MinSelected) {
            return true;
        }

        return false;
    }

    show30MinAccessRestriction(): boolean {
        const is30MinAllowed = this._identityService.is30MinAllowed();
        return !is30MinAllowed;
    }

    show30MinLevelRestriction() {
        const level = this._tradingProfileService.level;
        const is30MinAllowedByLevel = this._identityService.is30MinAllowedByLevel(level);
        if (is30MinAllowedByLevel) {
            return false;
        }

        if (this._loadingProfile) {
            return false;
        }

        const is30MinSelected = this.activeTimeframes.indexOf(TimeFrames.Min30) !== -1;
        if (is30MinSelected) {
            return true;
        }

        return false;
    }

    showHourlyAccessRestriction() {
        const isHourAllowed = this._identityService.isHourAllowed();
        return !isHourAllowed;
    }

    show1HLevelRestriction() {
        const level = this._tradingProfileService.level;
        const isHourAllowedByLevel = this._identityService.isHourAllowedByLevel(level);
        if (isHourAllowedByLevel) {
            return false;
        }

        if (this._loadingProfile) {
            return false;
        }

        const is1HSelected = this.activeTimeframes.indexOf(TimeFrames.Hour1) !== -1;
        if (is1HSelected) {
            return true;
        }

        return false;
    }

    ngOnInit() {
        this.loading = true;
        this.scanMarkets();

        if (this.isAuthorizedCustomer) {
            this._timer = setInterval(() => {
                this.scanMarkets();
            }, 1000 * 60 * 2);
        } else {
            this._timer = setInterval(() => {
                this.scanMarkets();
            }, 1000 * 10);
        }

        this.initialized.next(this);
    }

    showRestrictions(group: IGroupedResults): boolean {
        if (this.isGuest) {
            return false;
        }

        const tfValue1Min = this.toTimeframe(60);
        const _1MinLevelRestriction = this.show1MinLevelRestriction();
        const _1MinAccessRestriction = this.show1MinAccessRestriction();
        if (group.timeframe === tfValue1Min && (_1MinLevelRestriction || _1MinAccessRestriction)) {
            return true;
        }

        const tfValue5Min = this.toTimeframe(60 * 5);
        const _5MinLevelRestriction = this.show5MinLevelRestriction();
        const _5MinAccessRestriction = this.show5MinAccessRestriction();
        if (group.timeframe === tfValue5Min && (_5MinLevelRestriction || _5MinAccessRestriction)) {
            return true;
        }

        const tfValue15Min = this.toTimeframe(60 * 15);
        const _15MinLevelRestriction = this.show15MinLevelRestriction();
        const _15MinAccessRestriction = this.show15MinAccessRestriction();
        if (group.timeframe === tfValue15Min && (_15MinLevelRestriction || _15MinAccessRestriction)) {
            return true;
        }

        const tfValue30Min = this.toTimeframe(60 * 30);
        const _30MinLevelRestriction = this.show30MinLevelRestriction();
        const _30MinAccessRestriction = this.show30MinAccessRestriction();
        if (group.timeframe === tfValue30Min && (_30MinLevelRestriction || _30MinAccessRestriction)) {
            return true;
        }

        const tfValue1H = this.toTimeframe(60 * 60);
        const _1HLevelRestriction = this.show1HLevelRestriction();
        const _hourlyAccessRestriction = this.showHourlyAccessRestriction();
        if (group.timeframe === tfValue1H && (_1HLevelRestriction || _hourlyAccessRestriction)) {
            return true;
        }

        const tfValue4H = this.toTimeframe(60 * 60 * 4);
        if (group.timeframe === tfValue4H && _hourlyAccessRestriction) {
            return true;
        }

        return false;
    }

    dataExistsInGroup(group: IGroupedResults): boolean {
        for (const marketTypes of group.data) {
            if (marketTypes.data && marketTypes.data.length) {
                return true;
            }
        }
        return false;
    }

    groupedResults(): IGroupedResults[] {
        const res: IGroupedResults[] = [];

        for (const tf of this._supportedTimeframes) {
            const item: IGroupedResults = {
                timeframe: this.toTimeframe(tf),
                data: []
            };

            // item.data.push({
            //     data: [],
            //     marketType: this._featuredGroupName
            // });

            for (const marketType of this.types) {
                item.data.push({
                    marketType: marketType,
                    data: []
                });
            }

            item.data.push({
                data: [],
                marketType: this._otherGroupName
            });

            res.push(item);
        }

        for (const scannerResult of this.scannerResultsFiltered) {
            for (const responseItem of res) {
                const tfString = this.toTimeframe(scannerResult.timeframe);
                if (responseItem.timeframe === tfString) {
                    for (const group of responseItem.data) {
                        if (group.marketType === scannerResult.marketType) {
                            group.data.push(scannerResult);
                        }
                    }
                }
            }
        }

        return res;
    }

    segmentSelected(item: any) {
        // this.activeSegments = item;
        this._filterResults(false);
        this._filterResults(true);

        this._raiseStateChanged();
    }

    timeframeSelected(item: any) {
        // this.activeTimeframes = item;
        this._filterResults(false);
        this._filterResults(true);

        this._raiseStateChanged();
    }

    typeSelected(item: any) {
        // this.activeTypes = item;
        this._filterResults(false);
        this._filterResults(true);

        this._raiseStateChanged();
    }

    scanMarkets() {
        if (this.isAuthorizedCustomer) {
            this._scanFullMarket();
        } else {
            this._scanDemo();
        }
    }

    @bind
    columnCaption(columnName: string): Observable<string> {
        return this._bftTranslateService.get(columnName);
    }

    handleScannerResultsClick(scannerVM: IScannerResults, isHistoricalRecord: boolean = false) {
        this.selectVMItem(scannerVM, isHistoricalRecord);
    }

    selectVMItem(scannerVM: IScannerResults, isHistoricalRecord: boolean) {
        this.selectedScannerResult = scannerVM;
        this._sendInstrumentChange(scannerVM, isHistoricalRecord);
    }

    ngOnDestroy() {
        this._destroyed = true;
        this.beforeDestroy.next(this);

        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }

        if (this._missionsChangedSubscription) {
            this._missionsChangedSubscription.unsubscribe();
        }
    }


    manageSubscriptions() {
        this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
    }

    processCheckout() {
        this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
    }

    toTimeframe(tf: number): string {
        switch (tf) {
            case 1 * 60: return "1 Min";
            case 5 * 60: return "5 Min";
            case 15 * 60: return "15 Min";
            case 30 * 60: return "30 Min";
            case 60 * 60: return "1 Hour";
            case 240 * 60: return "4 Hours";
            case 24 * 60 * 60: return "1 Day";
        }
        return "Undefined";
    }

    trackByTimeframe(index, group: IGroupedResults) {
        return group.timeframe;
    }

    trackByMarketType(index, group: IGrouped) {
        return group.marketType;
    }

    trackByResult(index, res: IScannerResults) {
        return res.symbol + res.exchange + res.timeframe + res.origType;
    }

    addAlert() {
        this._dialog.open(SonarAlertDialogComponent, {});
    }

    changeViewTrigger() {
        this.changeView.next();
    }

    public getFeaturedDetails(scannerVM: IScannerResults): string {
        return scannerVM.color;
    }

    public handleColorSelected(color: string, scannerVM: IScannerResults) {
        if (color) {
            this._addToFeatured(color, scannerVM);
        } else {
            this._removeFromFeatured(scannerVM);
        }
        this._reloadData();
    }

    public click(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    private _getFeatured(item: IScannerResults | IFeaturedResult | IBFTScanInstrumentsResponseItem): IFeaturedResult {
        for (const _ of this._featured) {
            if (_.exchange === item.exchange && _.symbol === item.symbol && _.timeframe === item.timeframe) {
                return _;
            }
        }
    }

    private _getLoaded(item: IScannerResults | IFeaturedResult): IBFTScanInstrumentsResponseItem {
        for (const _ of this._loaded) {
            if (_.exchange === item.exchange && _.symbol === item.symbol && _.timeframe === item.timeframe) {
                return _;
            }
        }
    }

    private _addToFeatured(color: string, scannerVM: IScannerResults) {
        const existing = this._getFeatured(scannerVM);
        if (existing) {
            existing.color = color;
            return;
        }
        const loaded = this._getLoaded(scannerVM);

        this._featured.push({
            color: color,
            exchange: loaded.exchange,
            marketType: this._getMarketType(loaded),
            symbol: loaded.symbol,
            timeframe: loaded.timeframe,
            trend: loaded.trend,
            origType: loaded.type
        });

        this._raiseStateChanged();
    }

    private _removeFromFeatured(scannerVM: IScannerResults) {
        const existing = this._getFeatured(scannerVM);
        if (!existing) {
            return;
        }

        const index = this._featured.indexOf(existing);
        this._featured.splice(index, 1);
        
        this._raiseStateChanged();
    }

    private _sendInstrumentChange(scannerVM: IScannerResults, isHistoricalRecord: boolean) {
        if (!this.isAuthorizedCustomer) {
            this.processCheckout();
            return false;
        }

        this._instrumentService.getInstruments(null, scannerVM.symbol).subscribe((data: IInstrument[]) => {
            if (!data || !data.length) {
                this._alertService.warning("Failed to view chart by symbol");
                return;
            }

            let instrument = data[0];

            for (const i of data) {
                try {
                    if (i.exchange && i.exchange.toLowerCase() === scannerVM.exchange.toLowerCase() && i.id.toLowerCase() === scannerVM.symbol.toLowerCase()) {
                        instrument = i;
                    }
                } catch (e) {
                }
            }

            let date = null;
            if (isHistoricalRecord && (scannerVM as any).date) {
                date = (scannerVM as any).date;
            }

            const linkAction: LinkingAction = {
                type: Actions.ChangeInstrumentAndTimeframe,
                data: {
                    instrument: instrument,
                    timeframe: scannerVM.timeframe,
                    replayDate: date
                }
            };
            this.onOpenChart.next(linkAction);
        }, (error) => {
            this._alertService.warning("Failed to view chart by symbol");
        });
    }

    private _reloadData() {
        if (!this.isAuthorizedCustomer) {
            return;
        }

        const res: IScannerResults[] = [];
        for (const i of this._featured) {
            const loaded = this._getLoaded(i);
            res.push({
                exchange: i.exchange,
                symbol: i.symbol,
                timeframe: i.timeframe,
                tp: loaded ? this._toTP(loaded.tp) : "Expired",
                tte: loaded ? this._toTTE(loaded.tte) : "Expired",
                volatility: loaded ? this._toVolatility(loaded.tp) : null,
                marketType: this._featuredGroupName,
                trend: loaded ? loaded.trend : i.trend,
                color: i.color,
                origType: i.origType,
                isMocked: false
            });
        }

        for (const i of this._loaded) {
            const featured = this._getFeatured(i);
            if (featured) {
                continue;
            }
            res.push({
                exchange: i.exchange,
                symbol: i.symbol,
                timeframe: i.timeframe,
                tp: this._toTP(i.tp),
                tte: this._toTTE(i.tte),
                volatility: this._toVolatility(i.tp),
                marketType: this._getMarketType(i),
                trend: i.trend,
                origType: i.type,
                isMocked: i.isMocked || false
            });
        }

        this.scannerResults = res;
        this._filterResults(false);
    }

    private _isTypeSelected(type: string): boolean {
        for (const activeType of this.activeTypes) {
            if (activeType.toLowerCase() === type.toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    private _isTypeAllowed(marketType: string): boolean {
        if (this._identityService.subscriptionType === SubscriptionType.Starter || this._identityService.subscriptionType === SubscriptionType.Discovery) {
            if (marketType === InstrumentTypeName.MajorForex ||
                marketType === InstrumentTypeName.ForexMinors ||
                marketType === InstrumentTypeName.ForexExotics) {
                return true;
            }

            if (marketType === InstrumentTypeName.Metals && this._identityService.subscriptionType === SubscriptionType.Discovery) {
                return true;
            }

            if (marketType === InstrumentTypeName.Indices && this._identityService.subscriptionType === SubscriptionType.Discovery) {
                return true;
            }

            return false;
        }

        return true;
    }

    private _isTimeframeSelected(timeframe: number): boolean {
        for (const activeTimeframe of this.activeTimeframes) {
            const tfValue = this._getTfValue(activeTimeframe);
            if (timeframe === tfValue) {
                return true;
            }
        }

        return false;
    }

    private _filterResults(isHistory: boolean) {
        const filteringData = isHistory ? this.scannerHistoryResults : this.scannerResults;
        const filteredBySegments = [];
        for (const i of filteringData) {
            if (this._isTypeSelected(i.marketType) && this._isTypeAllowed(i.marketType)) {
                filteredBySegments.push(i);
            }
        }

        const filteredByTimeframes = [];
        for (const i of filteredBySegments) {
            if (this._isTimeframeSelected(i.timeframe)) {
                filteredByTimeframes.push(i);
            }
        }

        if (isHistory) {
            this.scannerHistoryResultsFiltered = filteredByTimeframes;
        } else {
            this.scannerResultsFiltered = filteredByTimeframes;
        }

        this._refresh();
    }

    private _getTfValue(activeTimeframe: string): number {
        const min = 60;
        switch (activeTimeframe) {
            case TimeFrames.Min1: return min;
            case TimeFrames.Min5: return min * 5;
            case TimeFrames.Min15: return min * 15;
            case TimeFrames.Min30: return min * 30;
            case TimeFrames.Hour1: return min * 60;
            case TimeFrames.Hour4: return min * 60 * 4;
            case TimeFrames.Day: return min * 60 * 24;
        }
    }

    private _processData(items: IBFTScanInstrumentsResponseItem[]) {
        this._loaded = [];
        for (const i of items) {
            this._loaded.push(i);

        }
        this._reloadData();
    }

    private _getMarketType(item: IBFTScanInstrumentsResponseItem): string {
        switch (item.marketType) {
            case InstrumentTypeId.Bonds: return InstrumentTypeName.Bonds;
            case InstrumentTypeId.Commodities: return InstrumentTypeName.Commodities;
            case InstrumentTypeId.Crypto: return InstrumentTypeName.Crypto;
            case InstrumentTypeId.Equities: return InstrumentTypeName.Equities;
            case InstrumentTypeId.ForexExotics: return InstrumentTypeName.ForexExotics;
            case InstrumentTypeId.ForexMinors: return InstrumentTypeName.ForexMinors;
            case InstrumentTypeId.Indices: return InstrumentTypeName.Indices;
            case InstrumentTypeId.MajorForex: return InstrumentTypeName.MajorForex;
            case InstrumentTypeId.Metals: return InstrumentTypeName.Metals;
        }
        return InstrumentTypeId.Other;
    }

    private _toVolatility(tp: IBFTATradeProbability): string {
        let probability = "Mid";
        if (tp === IBFTATradeProbability.High) {
            probability = "High";
        }
        if (tp === IBFTATradeProbability.Low) {
            probability = "Low";
        }
        return probability;
    }

    private _toTP(tp: IBFTATradeProbability): string {
        return tp;
    }

    private _toTTE(tte: number): string {
        if (!tte || !Number(tte)) {
            return "Target hit";
        }
        return `${tte} candles`;
    }

    private _loadDemoHistory() {
        const history = this._randomize(mockedHistory.reverse()).slice(0, 100);
        for (const i of history) {
            const date = new Date(i.time * 1000);
            this.scannerHistoryResults.push({
                exchange: i.responseItem.exchange,
                symbol: i.responseItem.symbol,
                timeframe: i.responseItem.timeframe,
                tp: this._toTP(i.responseItem.tp),
                tte: this._toTTE(i.responseItem.tte),
                volatility: this._toVolatility(i.responseItem.tp),
                marketType: this._getMarketType(i.responseItem),
                trend: i.responseItem.trend,
                time: date.toLocaleString(),
                origType: i.responseItem.type,
                date: date,
                isMocked: i.responseItem.isMocked || false
            });
        }
        this._filterResults(true);
        this._refresh();
    }

    private _loadHistory() {
        this._alogService.scannerHistory().subscribe((data: IBFTScannerHistoryResponse) => {
            const history = data.items.reverse().slice(0, 100);
            this.scannerHistoryResults = [];
            for (const i of history) {
                const date = new Date(i.time * 1000);
                this.scannerHistoryResults.push({
                    exchange: i.responseItem.exchange,
                    symbol: i.responseItem.symbol,
                    timeframe: i.responseItem.timeframe,
                    tp: this._toTP(i.responseItem.tp),
                    tte: this._toTTE(i.responseItem.tte),
                    volatility: this._toVolatility(i.responseItem.tp),
                    marketType: this._getMarketType(i.responseItem),
                    trend: i.responseItem.trend,
                    time: date.toLocaleString(),
                    origType: i.responseItem.type,
                    date: date,
                    isMocked: i.responseItem.isMocked || false
                });
            }
            this._filterResults(true);
            this._refresh();
        }, (error) => {
            // this.output = "Failed to scan";
        });
    }

    private _refresh() {
        if (this._destroyed) {
            return;
        }
        this._cdr.detectChanges();
    }

    private _scanFullMarket() {
        this.loading = true;
        this.scannerResults = [];

        this._alogService.scanInstruments().subscribe((data: IBFTScanInstrumentsResponse) => {
            this.loading = false;
            this._processData(data.items);
            if (!this.scannerResults.length) {
                this.output = "No Results";
            } else {
                this.output = null;
            }
            this._refresh();
        }, (error) => {
            this.loading = false;
            this.output = "Failed to scan";
            this._refresh();
        });

        this._loadHistory();
    }

    private _scanDemo() {
        this.loading = true;
        this.scannerResults = [];
        this.loading = false;
        this._loadingProfile = false;
        this._processData(this._randomize(mockedSonarData));
        this._loadDemoHistory();
        this._refresh();
    }

    private _randomize(data: any[]): any[] {
        let result = [];
        for (let i = 0; i < data.length; i++) {
            let rand = Math.trunc(Math.random() * 4);
            if (rand >= 1) {
                result.push(data[i]);
            }
        }

        return result;
    }

    private _raiseStateChanged() {
        if (!this._initialized) {
            return;
        }

        this.stateChanged.next(this);
    }
}

