import { Injectable } from '@angular/core';
import { AlgoService, IBFTABacktestResponse, IBFTAExtHitTestResult, IBFTBacktestAlgoParameters } from '@app/services/algo.service';

@Injectable()
export class BreakfreeTradingBacktestService {
    constructor(private alogService: AlgoService) { 
    }

    public backtest(params: IBFTBacktestAlgoParameters): Promise<IBFTABacktestResponse> {

        return this.alogService.backtest(params).toPromise();
    } 
    
    public extHitTest(params: IBFTBacktestAlgoParameters): Promise<IBFTAExtHitTestResult> {

        return this.alogService.extHitTest(params).toPromise();
    } 
}