import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import { AppConfigService } from '@app/services/app.config.service';
import { IInstrument } from '@app/models/common/instrument';
import { RealtimeService } from '@app/services/realtime.service';
import { HistoryService } from '@app/services/history.service';
import { InstrumentService } from '@app/services/instrument.service';
import { IdentityService } from '@app/services/auth/identity.service';
import { BreakfreeTradingService } from './breakfreeTrading.service';

@Injectable()
export class BreakfreeTradingDiscoveryService {

    constructor(private bftService: BreakfreeTradingService) { 
        
    }
}