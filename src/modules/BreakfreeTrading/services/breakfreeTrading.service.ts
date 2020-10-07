import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import { map } from "rxjs/operators";
import { AppConfigService } from '@app/services/app.config.service';
import { IInstrument } from '@app/models/common/instrument';
import { RealtimeService } from '@app/services/realtime.service';
import { HistoryService } from '@app/services/history.service';
import { InstrumentService } from '@app/services/instrument.service';
import { IdentityService } from '@app/services/auth/identity.service';
import { WebsocketBase } from '@app/interfaces/socket/socketBase';
import { BFTSocketService } from '@app/services/socket/bft.socket.service';
import { AlgoService, IBFTAlgoParameters, IBFTScanInstrumentParameters, IBFTScanInstrumentResponse, IRTDPayload } from '@app/services/algo.service';

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