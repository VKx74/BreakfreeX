import { Injectable, Inject } from '@angular/core';
import { WebsocketBase } from '@app/interfaces/socket/socketBase';
import { BFTSocketService } from '@app/services/socket/bft.socket.service';
import { AlgoService, IBFTAlgoParameters, IRTDPayload } from '@app/services/algo.service';

export interface IPoolItem {
    resolve: any;
    reject: any;
}

@Injectable()
export class BreakfreeTradingService {

    constructor(@Inject(BFTSocketService) private ws: WebsocketBase, private alogService: AlgoService) { 
    }

    getBftIndicatorCalculation(params: IBFTAlgoParameters): Promise<object> {
        return this.alogService.calculate(params).toPromise();
    }  
    
    getRTDCalculation(params: any): Promise<IRTDPayload> {
        return this.alogService.calculateRTD(params).toPromise();
    } 
}