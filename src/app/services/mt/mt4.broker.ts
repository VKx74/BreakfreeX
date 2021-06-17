import { Inject, Injector } from '@angular/core';
import { EBrokerInstance, IBrokerState } from '@app/interfaces/broker/broker';
import { MTConnectionData } from 'modules/Trading/models/forex/mt/mt.models';
import { ActionResult } from 'modules/Trading/models/models';
import { Observable, of } from 'rxjs';
import { AlgoService } from '../algo.service';
import { InstrumentMappingService } from '../instrument-mapping.service';
import { MTSocketService } from '../socket/mt.socket.service';
import { MT4SocketService } from '../socket/mt4.socket.service';
import { MTBroker } from './mt.broker';

export class MT4Broker extends MTBroker {

    public get instanceType(): EBrokerInstance {
        return EBrokerInstance.MT4;
    }
  
    constructor(@Inject(MT4SocketService) private _ws: MTSocketService, protected _algoService: AlgoService, protected _instrumentMappingService: InstrumentMappingService, protected _injector: Injector) {
      super(_ws, _algoService, _instrumentMappingService, _injector);
    }
    
    saveState(): Observable<IBrokerState<any>> {
        return of({
            brokerType: EBrokerInstance.MT4,
            state: this._initData,
            account: this._initData.Login.toString(),
            server: this._initData.ServerName
        });
    }

    loadSate(state: IBrokerState<any>): Observable<ActionResult> {
        if (state.brokerType === EBrokerInstance.MT4 && state.state) {
            return this.init(state.state as MTConnectionData);
        }
        return of({
            result: false
        });
    }
}