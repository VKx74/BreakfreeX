import { Injectable } from '@angular/core';
import { AlgoService, IBFTABacktestResponse, IBFTAExtHitTestResult, IBFTBacktestAlgoParameters, IBFTAHitTestAlgoParameters, IBFTABacktestV2Response, IBFTBacktestV2AlgoParameters } from '@app/services/algo.service';

@Injectable()
export class BreakfreeTradingBacktestService {
    constructor(private alogService: AlgoService) { 
    }

    public backtest(params: IBFTBacktestAlgoParameters): Promise<IBFTABacktestResponse> {

        return this.alogService.backtest(params).toPromise();
    } 
     
    public backtestV2(params: IBFTBacktestV2AlgoParameters): Promise<IBFTABacktestV2Response> {

        return this.alogService.backtestV2(params).toPromise();
    } 
    
    public extHitTest(params: IBFTAHitTestAlgoParameters): Promise<IBFTAExtHitTestResult> {

        return this.alogService.extHitTest(params).toPromise();
    } 
}