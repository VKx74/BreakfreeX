import { Inject } from '@angular/core';
import { EBrokerInstance, IBrokerState } from '@app/interfaces/broker/broker';
import { MTConnectionData } from 'modules/Trading/models/forex/mt/mt.models';
import { ActionResult } from 'modules/Trading/models/models';
import { Observable, of } from 'rxjs';
import { AlgoService } from '../algo.service';
import { InstrumentService } from '../instrument.service';
import { MTSocketService } from '../socket/mt.socket.service';
import { MT5SocketService } from '../socket/mt5.socket.service';
import { MTBroker } from './mt.broker';

export class MT5Broker extends MTBroker {

    public get instanceType(): EBrokerInstance {
        return EBrokerInstance.MT5;
    }
  
    constructor(@Inject(MT5SocketService) private _ws: MTSocketService, protected _algoService: AlgoService) {
      super(_ws, _algoService);
    }
    
    saveState(): Observable<IBrokerState<any>> {
        return of({
            brokerType: EBrokerInstance.MT5,
            state: this._initData,
            account: this._initData.Login.toString(),
            server: this._initData.ServerName
        });
    }

    loadSate(state: IBrokerState<any>): Observable<ActionResult> {
        if (state.brokerType === EBrokerInstance.MT5 && state.state) {
            return this.init(state.state as MTConnectionData);
        }
        return of({
            result: false
        });
    }
}