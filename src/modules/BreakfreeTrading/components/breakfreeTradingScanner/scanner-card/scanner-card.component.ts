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
            case 1 * 60: return "1 Min";
            case 5 * 60: return "5 Min";
            case 15 * 60: return "15 Min";
            case 60 * 60: return "1 Hour";
            case 240 * 60: return "4 Hours";
            case 24 * 60 * 60: return "1 Day";
        }
        return "Undefined";
    }
}
