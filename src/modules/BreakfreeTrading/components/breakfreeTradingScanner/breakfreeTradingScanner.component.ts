import { Component, Injector, Inject, ElementRef, ViewChild } from '@angular/core';
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';
import {GoldenLayoutItemState} from "angular-golden-layout";
import bind from "bind-decorator";
import { Observable } from 'rxjs';
import { IInstrument } from '@app/models/common/instrument';
import {AlertService} from "@alert/services/alert.service";
import { AlgoService, IBFTATradeType, IBFTATrend, IBFTScanInstrumentsResponse, IBFTScanInstrumentsResponseItem, IBFTScannerHistoryResponse, IBFTScannerResponseHistoryItem } from '@app/services/algo.service';
import { Actions, LinkingAction } from '@linking/models/models';
import { InstrumentService } from '@app/services/instrument.service';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { IWatchlistItem } from 'modules/Watchlist/services/watchlist.service';
import { MajorForexWatchlist } from 'modules/Watchlist/services/majorForex';
import { MinorForexWatchlist } from 'modules/Watchlist/services/minorForex';
import { ExoticsForexWatchlist } from 'modules/Watchlist/services/exoticForex';
import { IndicesWatchlist } from 'modules/Watchlist/services/indicaes';
import { CommoditiesWatchlist } from 'modules/Watchlist/services/commodities';
import { MetalsWatchlist } from 'modules/Watchlist/services/metals';
import { BondsWatchlist } from 'modules/Watchlist/services/bonds';
import { EquitiesWatchlist } from 'modules/Watchlist/services/equities';

interface IScannerState {
    featured: IFeaturedResult[];
}

interface IFeaturedResult {
    symbol: string;
    exchange: string;
    type: string;
    timeframe: number;
    marketType: string;
    color: string;
    trend: IBFTATrend;
}

interface IScannerResults {
    symbol: string;
    exchange: string;
    type: string;
    timeframe: number;
    tte: string;
    tp: string;
    color?: string;
    volatility: string;
    marketType: string;
    trend: IBFTATrend;
}

interface IScannerHistoryResults extends IScannerResults {
    time: string;
}

@Component({
    selector: 'BreakfreeTradingScanner',
    templateUrl: './breakfreeTradingScanner.component.html',
    styleUrls: ['./breakfreeTradingScanner.component.scss']
})
export class BreakfreeTradingScannerComponent extends BaseLayoutItemComponent {

    static componentName = 'BreakfreeTradingScanner';
    static previewImgClass = 'crypto-icon-watchlist';

    private _featured: IFeaturedResult[] = [];
    private _loaded: IBFTScanInstrumentsResponseItem[] = [];
    private _timer: any;
    private _featuredGroupName: string = "Featured";
    private _otherGroupName: string = "Other";
    private _types: IWatchlistItem[] = [MajorForexWatchlist, MinorForexWatchlist, ExoticsForexWatchlist, IndicesWatchlist, CommoditiesWatchlist, MetalsWatchlist, BondsWatchlist, EquitiesWatchlist];

    public segments: string[] = ["Forex", "Stoks"];
    public groupingField: string = "marketType";
    public groups: string[] = [];
    public scanningTime: string;
    public activeSegment: string;
    public scannerResults: IScannerResults[] = [];
    public scannerHistoryResults: IScannerHistoryResults[] = [];
    public selectedScannerResult: IScannerResults;
    public output: string;
    
    @ViewChild('content', {static: false}) contentBox: ElementRef;
    
    protected useDefaultLinker(): boolean {
        return true;
    }

    constructor(@Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        @Inject(GoldenLayoutItemState) protected _state: IScannerState,
        private _alertService: AlertService,
        protected _instrumentService: InstrumentService,
        private _alogService: AlgoService,
        protected _injector: Injector) {
        super(_injector);

        this._loadState(_state);

        this.groups.push(this._featuredGroupName);
        this._types.forEach(_ => {
            this.groups.push(_.name);
        });
        this.groups.push(this._otherGroupName);
    }

    ngOnInit() {
        this._timer = setInterval(() => {
            this.scanMarkets();
        }, 1000 * 60 * 2);

        super.setTitle(
            this._bftTranslateService.stream('breakfreeTradingScannerComponentName')
        );
        this.segmentSelected(this.segments[0]);
    }

    segmentSelected(item: string) {
        this.activeSegment = item;
        this.scanMarkets();
    }

    scanMarkets() {
        if (!this.activeSegment) {
            return;
        }

        this.output = "Scanning...";
        this.scannerResults = [];

        this._alogService.scanInstruments(this.activeSegment).subscribe((data: IBFTScanInstrumentsResponse) => {
            this.scanningTime = new Date(data.scanning_time * 1000).toUTCString();
            this._processData(data.items);
            if (!this.scannerResults.length) {
                this.output = "No Results";
            } else {
                this.output = null;
            }
        }, (error) => {
            this.output = "Failed to scan";
        }); 
        
        this._loadHistory();
    }

    @bind
    columnCaption(columnName: string): Observable<string> {
        return this._bftTranslateService.get(columnName);
    }

    handleScannerResultsClick(scannerVM: IScannerResults) {
        this.selectVMItem(scannerVM);
    }

    selectVMItem(scannerVM: IScannerResults) {
        this.selectedScannerResult = scannerVM;
        this._sendInstrumentChange(scannerVM);
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
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
            featured: this._featured.slice()
        };
    }

    private _loadState(_state: IScannerState) {
        if (_state && _state.featured && _state.featured.length) {
            this._featured = _state.featured.slice();
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
            type: loaded.type,
            trend: loaded.trend,
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

    private _sendInstrumentChange(scannerVM: IScannerResults) {
        // just oanda supported
        this._instrumentService.getInstruments(EExchangeInstance.OandaExchange, scannerVM.symbol).subscribe((data: IInstrument[]) => {
            if (!data || !data.length) {
                this._alertService.warning("Failed to view chart by symbol");
                return;
            }

            let instrument = data[0];

            for (const i of data) {
                if (i.exchange.toLowerCase() === scannerVM.exchange.toLowerCase() && i.id.toLowerCase() === scannerVM.symbol.toLowerCase()) {
                    instrument = i;
                }
            }

            const linkAction: LinkingAction = {
                type: Actions.ChangeInstrumentAndTimeframe,
                data: {
                    instrument: instrument,
                    timeframe: scannerVM.timeframe
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
                type: loaded ? this._getType(loaded) : this._getType(i),
                trend: loaded ? loaded.trend : i.trend,
                color: i.color
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
                type: this._getType(i),
                trend: i.trend
            });
        }  

        this.scannerResults = res;
    }
    
    private _processData(items: IBFTScanInstrumentsResponseItem[]) {
        this._loaded = [];
        for (const i of items) {
            if (i.tte > 50) {
                continue;
            }
            this._loaded.push(i);
            
        }
        this._reloadData();
    }

    private _getType(item: IBFTScanInstrumentsResponseItem | IFeaturedResult): string {
        const tf = this._toTimeframe(item.timeframe);
        const ud = item.trend === IBFTATrend.Up ? "U" : "D";
        let type = item.type.toString();
        if (type === IBFTATradeType.SwingExt || type === IBFTATradeType.SwingN) {
            type = "SWING";
        }
        return `${type}_${ud}_${tf}`;
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

    private _toVolatility(tp: number): string {
        let probability = "Mid";
        if (tp > 50) {
            probability = "High";
        }
        if (tp < -20) {
            probability = "Low";
        }
        return probability;
    }

    private _toTP(tp: number): string {
        let volatility = this._toVolatility(tp);
        const sign = tp > 0 ? "+" : "-";
        return `${volatility} (Vol. ${sign}${Math.abs(tp)} %)`;
    }

    private _toTTE(tte: number): string {
        if (!tte || !Number(tte)) {
            return "Target hit";
        }
        return `${tte} candles`;
    }

    private _toTimeframe(tf: number): string {
        switch (tf) {
            case 1 * 60: return "1 Min";
            case 5 * 60: return "5 Min";
            case 15 * 60: return "15 Min";
            case 60 * 60: return "1 Hour";
            case 240 * 60: return "4 Hours";
            case 24 * 60 * 60: return "Daily";
        }
        return "Undefined";
    }

    private _loadHistory() {
        this._alogService.scannerHistory(this.activeSegment).subscribe((data: IBFTScannerHistoryResponse) => {
            const history = data.items;
            this.scannerHistoryResults = [];
            for (const i of history) {
                this.scannerHistoryResults.unshift({
                    exchange: i.responseItem.exchange,
                    symbol: i.responseItem.symbol,
                    timeframe: i.responseItem.timeframe,
                    tp: this._toTP(i.responseItem.tp),
                    tte: this._toTTE(i.responseItem.tte),
                    volatility: this._toVolatility(i.responseItem.tp),
                    marketType: this._getMarketType(i.responseItem.symbol),
                    type: this._getType(i.responseItem),
                    trend: i.responseItem.trend,
                    time: new Date(i.time * 1000).toLocaleString()
                });
            }
        }, (error) => {
            // this.output = "Failed to scan";
        });
    }
}

