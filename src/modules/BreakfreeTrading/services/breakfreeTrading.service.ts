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
import { AlgoService, IBFTAlgoParameters } from '@app/services/algo.service';

export interface IPoolItem {
    resolve: any;
    reject: any;
}

@Injectable()
export class BreakfreeTradingService {

    // private _pool: { [symbol: string]: IPoolItem; } = {};

    constructor(@Inject(BFTSocketService) private ws: WebsocketBase, private alogService: AlgoService) { 
        // this.open().subscribe();
    }

    getBftIndicatorCalculation(params: IBFTAlgoParameters): Promise<object> {

        return this.alogService.calculate(params).toPromise();
    } 


    
    // getBftIndicatorCalculation(params: IBFTAlgoParameters): Promise<object> {
    //     const id = new Date().getTime() + params.instrument.id + params.instrument.exchange;
    //     return new Promise((resolve, reject) => {
    //         this._pool[id] = {
    //             resolve: resolve,
    //             reject: reject
    //         };

    //         this._sendRequest({
    //             ...params,
    //             id: id
    //         });
    //     });
    // }

    // open(): Observable<void> {
    //     return new Observable((observer: Observer<void>) => {
    //         this.ws.onMessage.subscribe(value => {
    //             this._processMessage(value);
    //         });

    //         this.ws.onReconnect.subscribe(() => {
    //         });

    //         this.ws.open().subscribe(value => {
    //             observer.next(value);
    //         }, error => {
    //             observer.error(error);
    //         });
    //     });
    // }

    // protected _sendRequest(params: any) {
    //     this.ws.send(params);
    // } 
    
    // protected _processMessage(data: any) {
    //     const id = data.id;
    //     if (id && this._pool[id]) {
    //         this._pool[id].resolve(data);
    //         delete this._pool[id];
    //     }
    // }  
}