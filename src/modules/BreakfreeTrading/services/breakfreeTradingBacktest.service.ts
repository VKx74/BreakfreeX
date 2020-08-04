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
import { AlgoService, IBFTAlgoParameters, IBFTABacktestResponse, IBFTAExtHitTestResult } from '@app/services/algo.service';

@Injectable()
export class BreakfreeTradingBacktestService {
    constructor(private alogService: AlgoService) { 
    }

    public backtest(params: IBFTAlgoParameters): Promise<IBFTABacktestResponse> {

        return this.alogService.backtest(params).toPromise();
    } 
    
    public extHitTest(params: IBFTAlgoParameters): Promise<IBFTAExtHitTestResult> {

        return this.alogService.extHitTest(params).toPromise();
    } 
}