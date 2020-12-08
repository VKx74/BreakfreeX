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
}
