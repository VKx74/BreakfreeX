import { Component, Injector, Inject, ElementRef, ViewChild } from '@angular/core';
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';
import bind from "bind-decorator";
import { Observable } from 'rxjs';
import { IInstrument } from '@app/models/common/instrument';
import {AlertService} from "@alert/services/alert.service";
import { AlgoService, IBFTScanInstrumentsResponse, IBFTScanInstrumentsResponseItem } from '@app/services/algo.service';
import { Actions, LinkingAction } from '@linking/models/models';
import { InstrumentService } from '@app/services/instrument.service';

interface IScannerResults {
    symbol: string;
    exchange: string;
    timeframe: string;
    timeInterval: number;
    trend: string;
    tte: string;
    tp: string;
    open: number;
    high: number;
    low: number;
    close: number;
}

@Component({
    selector: 'BreakfreeTradingScanner',
    templateUrl: './breakfreeTradingScanner.component.html',
    styleUrls: ['./breakfreeTradingScanner.component.scss']
})
export class BreakfreeTradingScannerComponent extends BaseLayoutItemComponent {

    static componentName = 'BreakfreeTradingScanner';
    static previewImgClass = 'crypto-icon-watchlist';

    private _timer: any;

    public segments: string[] = ["Forex", "Stoks"];
    public scanningTime: string;
    public activeSegment: string;
    public scannerResults: IScannerResults[] = [];
    public selectedScannerResult: IScannerResults;
    public output: string;
    
    @ViewChild('content', {static: false}) contentBox: ElementRef;
    
    protected useDefaultLinker(): boolean {
        return true;
    }

    constructor(@Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        private _alertService: AlertService,
        protected _instrumentService: InstrumentService,
        private _alogService: AlgoService,
        protected _injector: Injector) {
        super(_injector);
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

    getComponentState(): any {
        // save your state
        return {
        };
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
    }

    @bind
    columnCaption(columnName: string): Observable<string> {
        return this._bftTranslateService.get(columnName);
    }

    handleScannerResultsClick(instrumentVM: IScannerResults) {
        this.selectVMItem(instrumentVM);
    }

    selectVMItem(instrumentVM: IScannerResults) {
        this.selectedScannerResult = instrumentVM;
        this._sendInstrumentChange(instrumentVM);
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
    }

    private _sendInstrumentChange(instrumentVM: IScannerResults) {
        this._instrumentService.getInstruments(null, instrumentVM.symbol).subscribe((data: IInstrument[]) => {
            if (!data || !data.length) {
                this._alertService.warning("Failed to view chart by symbol");
                return;
            }

            let instrument = data[0];

            for (const i of data) {
                if (i.exchange.toLowerCase() === instrumentVM.exchange.toLowerCase() && i.id.toLowerCase() === instrumentVM.symbol.toLowerCase()) {
                    instrument = i;
                }
            }

            const linkAction: LinkingAction = {
                type: Actions.ChangeInstrumentAndTimeframe,
                data: {
                    instrument: instrument,
                    timeframe: instrumentVM.timeInterval
                }
            };
            this.linker.sendAction(linkAction);
        }, (error) => {
            this._alertService.warning("Failed to view chart by symbol");
        });
    }
    
    private _processData(items: IBFTScanInstrumentsResponseItem[]) {
        const res = [];
        for (const i of items) {
            if (i.tte > 50) {
                continue;
            }
            res.push({
                exchange: i.exchange,
                symbol: i.symbol,
                trend: i.trend,
                timeframe: this._toTimeframe(i.timeframe),
                timeInterval: i.timeframe,
                tp: this._toTP(i.tp),
                tte: this._toTTE(i.tte),
                open: i.open,
                high: i.high,
                low: i.low,
                close: i.close
            });
        }

        this.scannerResults = res;
    }

    private _toTP(tp: number): string {
        let probability = "Mid";
        if (tp > 50) {
            probability = "High";
        }
        if (tp < -20) {
            probability = "Low";
        }
        const sign = tp > 0 ? "+" : "-";
        return `${probability} (Vol. ${sign}${Math.abs(tp)} %)`;
    }

    private _toTTE(tte: number): string {
        return `${tte} candles`;
    }

    private _toTimeframe(tf: number): string {
        switch (tf) {
            case 1 * 60: return "1 Min";
            case 5 * 60: return "5 Min";
            case 15 * 60: return "15 Min";
            case 60 * 60: return "1 Hour";
            case 240 * 60: return "4 Hours";
        }
        return "Undefined";
    }
}

