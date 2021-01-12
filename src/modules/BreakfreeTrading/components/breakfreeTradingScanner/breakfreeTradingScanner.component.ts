import { Component, Injector, Inject, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';
import {GoldenLayoutItemState} from "angular-golden-layout";
import bind from "bind-decorator";
import { Observable, Subscription } from 'rxjs';
import { IInstrument } from '@app/models/common/instrument';
import {AlertService} from "@alert/services/alert.service";
import { AlgoService, IBFTATradeProbability, IBFTATradeType, IBFTATrend, IBFTScanInstrumentsResponse, IBFTScanInstrumentsResponseItem, IBFTScannerHistoryResponse, IBFTScannerResponseHistoryItem } from '@app/services/algo.service';
import { Actions, LinkingAction } from '@linking/models/models';
import { InstrumentService } from '@app/services/instrument.service';
import { IWatchlistItem } from 'modules/Watchlist/services/watchlist.service';
import { MajorForexWatchlist } from 'modules/Watchlist/services/majorForex';
import { MinorForexWatchlist } from 'modules/Watchlist/services/minorForex';
import { ExoticsForexWatchlist } from 'modules/Watchlist/services/exoticForex';
import { IndicesWatchlist } from 'modules/Watchlist/services/indicaes';
import { CommoditiesWatchlist } from 'modules/Watchlist/services/commodities';
import { MetalsWatchlist } from 'modules/Watchlist/services/metals';
import { BondsWatchlist } from 'modules/Watchlist/services/bonds';
import { EquitiesWatchlist } from 'modules/Watchlist/services/equities';
import { IdentityService } from '@app/services/auth/identity.service';
import { MatDialog } from '@angular/material/dialog';
import { CheckoutComponent } from '../checkout/checkout.component';
import { PersonalInfoService } from '@app/services/personal-info/personal-info.service';
import { CryptoWatchlist } from 'modules/Watchlist/services/crypto';
import { TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';
import { NotificationsService } from '@alert/services/notifications.service';

interface IScannerState {
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
}

interface IScannerHistoryResults extends IScannerResults {
    time: string;
    date: Date;
}

enum TimeFrames {
    Min15 = "15 Min",
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
    selector: 'BreakfreeTradingScanner',
    templateUrl: './breakfreeTradingScanner.component.html',
    styleUrls: ['./breakfreeTradingScanner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreakfreeTradingScannerComponent extends BaseLayoutItemComponent {
    static componentName = 'BreakfreeTradingScanner';
    static previewImgClass = 'crypto-icon-news';

    private _featured: IFeaturedResult[] = [];
    private _loaded: IBFTScanInstrumentsResponseItem[] = [];
    private _timer: any;
    private _featuredGroupName: string = "Featured";
    private _otherGroupName: string = "Other";
    private _types: IWatchlistItem[] = [MajorForexWatchlist, MinorForexWatchlist, ExoticsForexWatchlist, IndicesWatchlist, CommoditiesWatchlist, MetalsWatchlist, BondsWatchlist, EquitiesWatchlist, CryptoWatchlist];
    private _supportedTimeframes: number[] = [60, 300, 900, 3600, 14400, 86400];
    private _loadingProfile: boolean = true;
    private _levelRestriction: number = 4;

    public SWING = 'SWING';
    public segments: TradeTypes[] = [TradeTypes.Ext, TradeTypes.BRC, TradeTypes.Swing];
    public timeframes: TimeFrames[] = [TimeFrames.Min15, TimeFrames.Hour1, TimeFrames.Hour4, TimeFrames.Day];
    public types: string[] = [this._featuredGroupName, MajorForexWatchlist.name, MinorForexWatchlist.name, ExoticsForexWatchlist.name, IndicesWatchlist.name, CommoditiesWatchlist.name, MetalsWatchlist.name, BondsWatchlist.name, EquitiesWatchlist.name, CryptoWatchlist.name, this._otherGroupName];
    public groupingField: string = "marketType";
    public groups: string[] = [];
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
    private _missionsChangedSubscription: Subscription;
    
    public get origType() {
        return IBFTATradeType;
    }

    public get isAuthorizedCustomer(): boolean {
        return this._identityService.isAuthorizedCustomer;
    }  

    public get isPro(): boolean {
        return this._identityService.isPro;
    }  
    
    @ViewChild('content', {static: false}) contentBox: ElementRef;
    
    protected useDefaultLinker(): boolean {
        return true;
    }

    constructor(@Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        @Inject(GoldenLayoutItemState) protected _state: IScannerState,
        private _dialog: MatDialog,
        private _alertService: AlertService,
        protected _instrumentService: InstrumentService,
        private _identityService: IdentityService,
        private _alogService: AlgoService,
        private _cdr: ChangeDetectorRef,
        private _personalInfoService: PersonalInfoService,
        private _tradingProfileService: TradingProfileService,
        protected _injector: Injector) {
        super(_injector);
        super.setTitle(
            this._bftTranslateService.stream('breakfreeTradingScannerComponentName')
        );
        this._loadState(_state);
        this.groups.push(this._featuredGroupName);
        this._types.forEach(_ => {
            this.groups.push(_.name);
        });
        this.groups.push(this._otherGroupName);
        this._missionsChangedSubscription = this._tradingProfileService.MissionChanged.subscribe(() => {
            this._loadingProfile = false;
            this._filterResults(false);
            this._filterResults(true);
        });
        
        if (this._tradingProfileService.missions) {
            this._loadingProfile = false;
        }
    }

    show15MinLevelRestriction() {
        const is15MinSelected = this.activeTimeframes.indexOf(TimeFrames.Min15) !== -1;
        if (this._loadingProfile) {
            return false;
        }

        let level = this._tradingProfileService.level;
        if (this.isPro && level < this._levelRestriction && is15MinSelected) {
            return true;
        }

        return false;
    }

    show1HLevelRestriction() {
        const is1HSelected = this.activeTimeframes.indexOf(TimeFrames.Hour1) !== -1;
        if (this._loadingProfile) {
            return false;
        }

        let level = this._tradingProfileService.level;
        if (!this.isPro && level < this._levelRestriction && is1HSelected) {
            return true;
        }
        
        return false;
    }

    ngOnInit() {
        if (!this._identityService.isAuthorizedCustomer) {
            return;
        }
        this.loading = true;

        this.scanMarkets();
        this._timer = setInterval(() => {
            this.scanMarkets();
        }, 1000 * 60 * 2);
    }

    isOutOfAccess(group: IGroupedResults): boolean {
        const is15MinSelected = this.activeTimeframes.indexOf(TimeFrames.Min15) !== -1;
        const tfValue15Min = this.toTimeframe(60 * 15);
        if (group.timeframe === tfValue15Min && is15MinSelected && !this.isPro) {
            return true;
        }
        return false;
    }

    showRestrictions(group: IGroupedResults): boolean {
        const tfValue15Min = this.toTimeframe(60 * 15);
        if (group.timeframe === tfValue15Min && this.show15MinLevelRestriction()) {
            return true;
        }
        
        const tfValue1H = this.toTimeframe(60 * 60);
        if (group.timeframe === tfValue1H && this.show1HLevelRestriction()) {
            return true;
        }

        return this.isOutOfAccess(group);
    }

    dataExistsInGroup(group: IGroupedResults): boolean {
        for (const marketTypes of group.data) {
            if (marketTypes.data && marketTypes.data.length) {
                return true;
            }
        }

       
        return this.showRestrictions(group);
    }

    groupedResults(): IGroupedResults[] {
        const res: IGroupedResults[] = [];

        for (const tf of this._supportedTimeframes) {
            const item: IGroupedResults = {
                timeframe: this.toTimeframe(tf),
                data: []
            };

            item.data.push({
                data: [],
                marketType: this._featuredGroupName
            });

            for (const marketType of this._types) {
                item.data.push({
                    marketType: marketType.name,
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
    }

    timeframeSelected(item: any) {
        // this.activeTimeframes = item;
        this._filterResults(false);
        this._filterResults(true);
    }

    typeSelected(item: any) {
        // this.activeTypes = item;
        this._filterResults(false);
        this._filterResults(true);
    }
    
    scanMarkets() {
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
        super.ngOnDestroy();

        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }

        if (this._missionsChangedSubscription) {
            this._missionsChangedSubscription.unsubscribe();
        }
    }

    manageSubscriptions() {
        this._personalInfoService.processUserBillingDashboard();
    }

    processCheckout() {
        this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
    }

    toTimeframe(tf: number): string {
        switch (tf) {
            case 1 * 60: return "1 Min";
            case 5 * 60: return "5 Min";
            case 15 * 60: return "15 Min";
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

    protected getComponentState(): IScannerState {
        return {
            featured: this._featured.slice(),
            timeframes: this.activeTimeframes.slice(),
            types: this.activeTypes.slice()
        };
    }

    private _loadState(_state: IScannerState) {
        if (_state && _state.featured && _state.featured.length) {
            this._featured = _state.featured.slice();
        }  
        
        if (_state && _state.timeframes && _state.timeframes.length) {
            this.activeTimeframes = _state.timeframes.slice();
        }  
        
        if (_state && _state.types && _state.types.length) {
            this.activeTypes = _state.types.slice();
        }
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
            marketType: this._getMarketType(loaded.symbol),
            symbol: loaded.symbol,
            timeframe: loaded.timeframe,
            trend: loaded.trend,
            origType: loaded.type
        });
    }
    
    private _removeFromFeatured(scannerVM: IScannerResults) {
        const existing = this._getFeatured(scannerVM);
        if (!existing) {
            return;
        }

        const index = this._featured.indexOf(existing);
        this._featured.splice(index, 1);
    }

    private _sendInstrumentChange(scannerVM: IScannerResults, isHistoricalRecord: boolean) {
        // just oanda supported
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
                } catch(e) {
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
            this.linker.sendAction(linkAction);
        }, (error) => {
            this._alertService.warning("Failed to view chart by symbol");
        });
    }

    private _reloadData() {
        const res: IScannerResults[] = [];
        for (const i of this._featured) {
            const loaded = this._getLoaded(i);
            res.push({
                exchange: i.exchange,
                symbol: i.symbol,
                timeframe: i.timeframe,
                tp: loaded ? this._toTP(loaded.tp) : "Expired",
                tte: loaded ? this._toTTE(loaded.tte) : "Expired",
                volatility:  loaded ? this._toVolatility(loaded.tp) : null,
                marketType: this._featuredGroupName,
                trend: loaded ? loaded.trend : i.trend,
                color: i.color,
                origType: i.origType
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
                marketType: this._getMarketType(i.symbol),
                trend: i.trend,
                origType: i.type
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
            if (this._isTypeSelected(i.marketType)) {
                filteredBySegments.push(i);
            }
        }

        const filteredByTimeframes = [];
        for (const i of filteredBySegments) {
            if (!this._isTFAllowed(i.timeframe)) {
                continue;
            }
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
            case TimeFrames.Min15: return min * 15;
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

    private _getMarketType(symbol: string): string {
        for (const type of this._types) {
            for (const inst of type.data) {
                if (inst.id === symbol || inst.symbol === symbol) {
                    return type.name;
                }
            }
        }
        return this._otherGroupName;
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

    private _isTFAllowed(tf: number): boolean {
       let level = this._tradingProfileService.level;
       if (this.isPro) {
            if (tf < 60 * 60 && level < this._levelRestriction) {
                return false;
            }
       } else {
            if (tf < 60 * 60 * 4 && level < this._levelRestriction) {
                return false;
            }
       }

       return true;
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
                    marketType: this._getMarketType(i.responseItem.symbol),
                    trend: i.responseItem.trend,
                    time: date.toLocaleString(),
                    origType: i.responseItem.type,
                    date: date
                });
            }
            this._filterResults(true);
            this._refresh();
        }, (error) => {
            // this.output = "Failed to scan";
        });
    }

    private _refresh() {
        this._cdr.detectChanges();
    }

}

