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
    trend: string;
    tte: string;
    tp: string;
}

@Component({
    selector: 'BreakfreeTradingScanner',
    templateUrl: './breakfreeTradingScanner.component.html',
    styleUrls: ['./breakfreeTradingScanner.component.scss']
})
export class BreakfreeTradingScannerComponent extends BaseLayoutItemComponent {

    static componentName = 'BreakfreeTradingScanner';

    static previewImgClass = 'crypto-icon-watchlist';

    public segments: string[] = ["Forex", "Stoks"];
    public activeSegment: string;
    public scannerResults: IScannerResults[] = [];
    public selectedScannerResult: IScannerResults;
    public output: string;
    
    @ViewChild('content', {static: false}) contentBox: ElementRef;

    
    constructor(@Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        private _alertService: AlertService,
        protected _instrumentService: InstrumentService,
        private _alogService: AlgoService,
        protected _injector: Injector) {
        super(_injector);
    }

    ngOnInit() {
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
        this.output = "Scanning...";
        this.scannerResults = [];

        this._alogService.scanInstruments(this.activeSegment).subscribe((data: IBFTScanInstrumentsResponse) => {
            if (!data.items || !data.items.length) {
                this.output = "No Results";
            } else {
                this.output = null;
            }

            this._processData(data.items);
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

    private _sendInstrumentChange(instrumentVM: IScannerResults) {
        this._instrumentService.getInstrumentsBySymbol(instrumentVM.symbol).subscribe((data: IInstrument[]) => {
            if (!data || !data.length) {
                this._alertService.warning("Failed to view chart by order symbol");
                return;
            }

            let instrument = data[0];

            for (const i of data) {
                if (i.exchange.toLowerCase() === instrumentVM.exchange.toLowerCase()) {
                    instrument = i;
                }
            }

            const linkAction: LinkingAction = {
                type: Actions.ChangeInstrumentAndTimeframe,
                data: {
                    instrument: instrument,
                    timeframe: instrumentVM.timeframe
                }
            };
            this.linker.sendAction(linkAction);
        }, (error) => {
            this._alertService.warning("Failed to view chart by order symbol");
        });
    }
    
    private _processData(items: IBFTScanInstrumentsResponseItem[]) {
        for (const i of items) {
            this.scannerResults.push({
                exchange: i.exchange,
                symbol: i.symbol,
                trend: i.trend,
                timeframe: this._toTimeframe(i.timeframe),
                tp: this._toTP(i.tp),
                tte: this._toTTE(i.tte),
            });
        }
    }

    private _toTP(tp: number): string {
        let probability = "Mid";
        if (tp > 50) {
            probability = "High";
        }
        if (tp < -20) {
            probability = "Low";
        }
        return `${probability} (Vol. ${tp})`;
    }

    private _toTTE(tte: number): string {
        return `${tte} candles`;
    }

    private _toTimeframe(tf: number): string {
        switch (tf) {
            case 1: return "1 MIn";
            case 5: return "5 MIn";
            case 15: return "15 MIn";
            case 60: return "60 MIn";
            case 240: return "240 MIn";
        }
        return "Undefined";
    }
}

