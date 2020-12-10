import {Component, Input, OnInit} from '@angular/core';
import { IBFTATradeType, IBFTATrend } from '@app/services/algo.service';
import { IScannerResults } from '../breakfreeTradingScanner.component';

@Component({
    selector: 'scanner-card',
    templateUrl: './scanner-card.component.html',
    styleUrls: ['./scanner-card.component.scss']
})
export class ScannerCardComponent {
    @Input() result: IScannerResults;
    public trends: any = IBFTATrend;
    public origType: any = IBFTATradeType;
    
    constructor() {
    }

    toTimeframe(tf: number): string {
        switch (tf) {
            case 1 * 60: return "1M";
            case 5 * 60: return "5M";
            case 15 * 60: return "15M";
            case 60 * 60: return "1H";
            case 240 * 60: return "4H";
            case 24 * 60 * 60: return "1D";
        }
        return "";
    }
}
