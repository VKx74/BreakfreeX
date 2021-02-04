import { Injectable, Inject } from '@angular/core';
import { WebsocketBase } from '@app/interfaces/socket/socketBase';
import { BFTSocketService } from '@app/services/socket/bft.socket.service';
import { AlgoService, IBFTAAlgoResponse, IBFTAAlgoResponseV2, IBFTAlgoParameters, IBFTAMarketInfo, IRTDPayload } from '@app/services/algo.service';
import { IInstrument } from '@app/models/common/instrument';

export interface IPoolItem {
    resolve: any;
    reject: any;
}

@Injectable()
export class BreakfreeTradingService {

    constructor(@Inject(BFTSocketService) private ws: WebsocketBase, private alogService: AlgoService) { 
    }

    getBftIndicatorCalculation(params: IBFTAlgoParameters): Promise<IBFTAAlgoResponse> {
        return this.alogService.calculate(params).toPromise();
    }  
    
    getBftIndicatorCalculationV2(params: IBFTAlgoParameters): Promise<IBFTAAlgoResponseV2> {
        return this.alogService.calculateV2(params).toPromise();
    }  
    
    getRTDCalculation(params: any): Promise<IRTDPayload> {
        return this.alogService.calculateRTD(params).toPromise();
    } 
}