import {Injectable, Injector} from "@angular/core";
import {Observable, of} from "rxjs";
import {EExchangeInstance} from "../interfaces/exchange/exchange";
import {ActionResult} from "../../modules/Trading/models/models";
import {InstrumentServiceBase} from "../interfaces/exchange/instrument.service";
import {BitmexInstrumentService} from "../services/bitmex.exchange/bitmex.instrument.service";
import {HistoryServiceBase} from "../interfaces/exchange/history.service";
import {BitmexHistoryService} from "../services/bitmex.exchange/bitmex.history.service";
import {RealtimeServiceBase} from "../interfaces/exchange/realtime.service";
import {BitmexRealtimeService} from "../services/bitmex.exchange/bitmex.realtime.service";
import {OandaInstrumentService} from "@app/services/oanda.exchange/oanda.instrument.service";
import {OandaHistoryService} from "@app/services/oanda.exchange/oanda.history.service";
import {OandaRealtimeService} from "@app/services/oanda.exchange/oanda.realtime.service";

export interface CreateInstrumentServiceActionResult extends ActionResult {
    serviceInstance?: InstrumentServiceBase;
}

export interface CreateHistoryServiceActionResult extends ActionResult {
    serviceInstance?: HistoryServiceBase;
}
export interface CreateRealtimeServiceActionResult extends ActionResult {
    serviceInstance?: RealtimeServiceBase;
}

@Injectable()
export class ExchangeFactory {
    constructor(private _injector: Injector) {
    }

    tryCreateInstrumentServiceInstance(exchangeType: EExchangeInstance, initData?: object): Observable<CreateInstrumentServiceActionResult> {
        let service: InstrumentServiceBase = null;

        switch (exchangeType) {
            case EExchangeInstance.BitmexExchange:
                service = this._injector.get(BitmexInstrumentService);
                break;
            case EExchangeInstance.OandaExchange:
                service = this._injector.get(OandaInstrumentService);
                break;
        }

        if (service) {
            return of({
                result: true,
                serviceInstance: service
            });
        } else {
            return of({
                result: false,
                msg: 'Failed to instrument service for ' + exchangeType
            });
        }
    }

    tryCreateHistoryServiceInstance(exchangeType: EExchangeInstance, initData?: object): Observable<CreateHistoryServiceActionResult> {
        let service: HistoryServiceBase = null;

        switch (exchangeType) {
            case EExchangeInstance.BitmexExchange:
                service = this._injector.get(BitmexHistoryService);
                break;
            case EExchangeInstance.OandaExchange:
                service = this._injector.get(OandaHistoryService);
                break;
        }

        if (service) {
            return of({
                result: true,
                serviceInstance: service
            });
        } else {
            return of({
                result: false,
                msg: 'Failed to history service for ' + exchangeType
            });
        }
    }

    tryCreateRealtimeServiceInstance(exchangeType: EExchangeInstance, initData?: object): Observable<CreateRealtimeServiceActionResult> {
        let service: RealtimeServiceBase = null;

        switch (exchangeType) {
            case EExchangeInstance.BitmexExchange:
                service = this._injector.get(BitmexRealtimeService);
                break;
            case EExchangeInstance.OandaExchange:
                service = this._injector.get(OandaRealtimeService);
                break;
        }

        if (service) {
            return of({
                result: true,
                serviceInstance: service
            });
        } else {
            return of({
                result: false,
                msg: 'Failed to realtime service for ' + exchangeType
            });
        }
    }
}
