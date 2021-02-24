import { EBrokerInstance, IBroker, IBrokerState } from "@app/interfaces/broker/broker";
import { EExchange } from "@app/models/common/exchange";
import { IInstrument } from "@app/models/common/instrument";
import { BinanceConnectionData } from "modules/Trading/models/crypto/binance/binance.models";
import { ActionResult } from "modules/Trading/models/models";
import { Subject, Observable, of } from "rxjs";

export class BinanceBroker implements IBroker {
    instanceType: EBrokerInstance;
    onSaveStateRequired: Subject<void> = new Subject;
    getInstruments(exchange?: EExchange, search?: string): Observable<IInstrument[]> {
        return of([]);
    }
    instrumentDecimals(symbol: string): number {
        return 3;
    }
    init(initData: any): Observable<ActionResult> {
        return of({
            result: true
        });
    }
    dispose(): Observable<ActionResult> {
        return of({
            result: true
        });
    }
    saveState(): Observable<IBrokerState<BinanceConnectionData>> {
        return of({
            account: "binance_account_id",
            brokerType: EBrokerInstance.Binance,
            server: "Binance",
            state: {
                APIKey: "api_key"
            }
        });
    }
    loadSate(state: IBrokerState<any>): Observable<ActionResult> {
        return of({
            result: true
        });
    }
    instrumentToBrokerFormat(symbol: string): IInstrument {
        return null;
    }

}