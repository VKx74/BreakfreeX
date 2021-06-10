import { Injectable, Injector } from "@angular/core";
import { Observable, of } from "rxjs";
import { EBrokerInstance, IBroker, IBrokerState } from "../interfaces/broker/broker";
import { ActionResult } from "../../modules/Trading/models/models";
import { map } from "rxjs/operators";
import { BFTDemoBroker, BFTFundingDemoBroker, BFTFundingLiveBroker, MT5Broker } from '@app/services/mt/mt5.broker';
import { MT4Broker } from '@app/services/mt/mt4.broker';
import { BinanceBroker } from "@app/services/binance/binance.broker";
import { BinanceFuturesUsdBroker } from "@app/services/binance-futures/binance-futures-usd.broker";
import { BinanceFuturesCoinBroker } from "@app/services/binance-futures/binance-futures-coin.broker";

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
            case EBrokerInstance.BFTDemo:
                return this._injector.get(BFTDemoBroker);
            case EBrokerInstance.BFTFundingDemo:
                return this._injector.get(BFTFundingDemoBroker);
            case EBrokerInstance.BFTFundingLive:
                return this._injector.get(BFTFundingLiveBroker);
            case EBrokerInstance.MT5:
                return this._injector.get(MT5Broker);
            case EBrokerInstance.MT4:
                return this._injector.get(MT4Broker);
            case EBrokerInstance.Binance:
                return this._injector.get(BinanceBroker);
            case EBrokerInstance.BinanceFuturesUSD:
                return this._injector.get(BinanceFuturesUsdBroker);
            case EBrokerInstance.BinanceFuturesCOIN:
                return this._injector.get(BinanceFuturesCoinBroker);
            default:
                return null;
        }
    }
}
