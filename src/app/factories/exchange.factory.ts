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

import { PolygonInstrumentService } from '@app/services/polygon.exchange/polygon.instrument.service';
import { PolygonHistoryService } from '@app/services/polygon.exchange/polygon.history.service';
import { PolygonRealtimeService } from '@app/services/polygon.exchange/polygon.realtime.service';

import { TwelvedataInstrumentService } from '@app/services/twelvedata.exchange/twelvedata.instrument.service';
import { TwelvedataHistoryService } from '@app/services/twelvedata.exchange/twelvedata.history.service';
import { TwelvedataRealtimeService } from '@app/services/twelvedata.exchange/twelvedata.realtime.service';

import { KaikoInstrumentService } from '@app/services/kaiko.exchange/kaiko.instrument.service';
import { KaikoHistoryService } from '@app/services/kaiko.exchange/kaiko.history.service';
import { KaikoRealtimeService } from '@app/services/kaiko.exchange/kaiko.realtime.service';

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
            case EExchangeInstance.PolygonExchange:
                service = this._injector.get(PolygonInstrumentService);
                break;
            case EExchangeInstance.TwelvedataExchange:
                service = this._injector.get(TwelvedataInstrumentService);
                break;
            case EExchangeInstance.KaikoExchange:
                service = this._injector.get(KaikoInstrumentService);
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
            case EExchangeInstance.PolygonExchange:
                service = this._injector.get(PolygonHistoryService);
                break;
            case EExchangeInstance.TwelvedataExchange:
                service = this._injector.get(TwelvedataHistoryService);
                break;
            case EExchangeInstance.KaikoExchange:
                service = this._injector.get(KaikoHistoryService);
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
            case EExchangeInstance.PolygonExchange:
                service = this._injector.get(PolygonRealtimeService);
                break;
            case EExchangeInstance.TwelvedataExchange:
                service = this._injector.get(TwelvedataRealtimeService);
                break;
            case EExchangeInstance.KaikoExchange:
                service = this._injector.get(KaikoRealtimeService);
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
