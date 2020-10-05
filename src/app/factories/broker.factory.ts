import {Injectable, Injector} from "@angular/core";
import {Observable, of} from "rxjs";
import {EBrokerInstance, IBroker, IBrokerState} from "../interfaces/broker/broker";
import {ActionResult} from "../../modules/Trading/models/models";
import {map} from "rxjs/operators";
import {BitmexBrokerService} from "../services/bitmex.exchange/bitmex.broker.service";
import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import { MTBroker } from '@app/services/mt/mt.broker';
import { MT5Broker } from '@app/services/mt/mt5.broker';
import { MT4Broker } from '@app/services/mt/mt4.broker';

export interface CreateBrokerActionResult extends ActionResult {
    brokerInstance?: IBroker;
}

@Injectable()
export class BrokerFactory {
    constructor(private _injector: Injector) {
    }

    tryCreateInstance(brokerType: EBrokerInstance, initData?: object): Observable<CreateBrokerActionResult> {
        let broker: IBroker = this._getInstance(brokerType);
        if (broker) {
            return broker.init(initData).pipe(map(value => {
                if (value.result) {
                    return {
                        result: true,
                        brokerInstance: broker
                    };
                }
                return value;
            }));
        } else {
            return of({
                result: false,
                msg: 'Failed to create broker'
            });
        }
    }

    tryRestoreInstance(brokerType: EBrokerInstance, state: IBrokerState): Observable<CreateBrokerActionResult> {
        let broker: IBroker = this._getInstance(brokerType);
        if (broker) {
            return broker.loadSate(state).pipe(map(value => {
                if (value.result) {
                    return {
                        result: true,
                        brokerInstance: broker
                    };
                }
                return value;
            }));
        } else {
            return of({
                result: false,
                msg: 'Failed to restore broker state'
            });
        }
    }

    private _getInstance(brokerType: EBrokerInstance): IBroker {
        switch (brokerType) {
            case EBrokerInstance.BitmexBroker:
                return this._injector.get(BitmexBrokerService);
            case EBrokerInstance.OandaBroker:
                return this._injector.get(OandaBrokerService);
            case EBrokerInstance.MT5:
                return this._injector.get(MT5Broker);
            case EBrokerInstance.MT4:
                return this._injector.get(MT4Broker);
            default:
                return null;
        }
    }
}
