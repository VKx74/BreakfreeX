import {Injectable} from "@angular/core";
import {IInstrument} from "../models/common/instrument";
import {EExchange} from "../models/common/exchange";
import {IHealthable} from "../interfaces/healthcheck/healthable";
import {BehaviorSubject, Observable, of, Subject, Subscription} from "rxjs";
import {ApplicationType} from "../enums/ApplicationType";
import {EBrokerInstance, IBroker, IBrokerState} from "../interfaces/broker/broker";
import {ActionResult, IBrokerUserInfo, OrderTypes} from "../../modules/Trading/models/models";
import {map, catchError} from "rxjs/operators";
import {BrokerFactory, CreateBrokerActionResult} from "../factories/broker.factory";
import {ApplicationTypeService} from "@app/services/application-type.service";
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from './app.config.service';


export interface ITimeFrame {
    interval: number;
    periodicity: string;
}

export interface IBFTAlgoParameters {
    input_accountsize: number;
    input_risk: number;
    input_splitpositions: number;
    input_stoplossratio: number;
    instrument: IInstrument;
    time: number;
    timenow: number;
    replay_back?: number;
    timeframe: ITimeFrame;
}

export interface IBFTAlgoParameters {
    input_accountsize: number;
    input_risk: number;
    input_splitpositions: number;
    input_stoplossratio: number;
    instrument: IInstrument;
    time: number;
    timenow: number;
    replay_back?: number;
    timeframe: ITimeFrame;
}

export interface IBFTAAlgoInfo {
    objective: string;
    status: string;
    suggestedrisk: string;
    positionsize: string;
    pas: string;
    macrotrend: string;
    n_currencySymbol: string;
}

export interface IBFTAAlgoData {
    clean: boolean;
    ee: number;
    ee1: number;
    ee2: number;
    ee3: number;
    fe: number;
    fe1: number;
    fe2: number;
    fe3: number;
    ze: number;
    ze1: number;
    ze2: number;
    ze3: number;
    vr100: boolean;
    vr75a: boolean;
    vr75b: boolean;
    vn100: boolean;
    vn75a: boolean;
    vn75b: boolean;
    vs100: boolean;
    vs75a: boolean;
    vs75b: boolean;
    vscs: boolean;
    vscs2: boolean;
    vexttp: boolean;
    vexttp2: boolean;
    m18: number;
    m28: number;
    p18: number;
    p28: number;
    algo_TP2: number;
    algo_TP1_high: number;
    algo_TP1_low: number;
    algo_Entry_high: number;
    algo_Entry_low: number;
    algo_Entry: number;
    algo_Stop: number;
    algo_Risk: number;
    algo_Info: IBFTAAlgoInfo;
}

export interface IBFTASignal {
    timestamp: number;
    data: IBFTAAlgoData;
}

export interface IBFTAOrder {
    id: string;
    open_timestamp: number;
    fill_timestamp?: number;
    cancel_timestamp?: number;
    close_timestamp?: number;
    update_timestamp?: any;
    type: string;
    side: string;
    status: string;
    qty: number;
    current_price: number;
    price: number;
    tp_price: number;
    sl_price: number;
    pl?: number;
}

export interface IBFTABacktestResponse {
    signals: IBFTASignal[];
    orders: IBFTAOrder[];
}

export interface IBFTAExtHitTestSignal {
    timestamp: number;
    data: IBFTAAlgoData;
    topext1hit: boolean;
    topext2hit: boolean;
    bottomext1hit: boolean;
    bottomext2hit: boolean;
    backhit: boolean;
    wentout: boolean;
}

export interface IBFTAExtHitTestResult {
    signals: IBFTAExtHitTestSignal[];
}

@Injectable()
export class AlgoService {
    private url: string;

    constructor(private _http: HttpClient) {
        this.url = AppConfigService.config.apiUrls.bftAlgoREST;
    }

    calculate(data: IBFTAlgoParameters): Observable<object> {
        return this._http.post(`${this.url}calculate`, data).pipe(
            catchError(error => {
                return of({
                    errorCode: error.status,
                    description: error.error
                });
            }));
    }
    
    backtest(data: IBFTAlgoParameters): Observable<IBFTABacktestResponse> {
        return this._http.post<IBFTABacktestResponse>(`${this.url}backtest`, data);
    }

    extHitTest(data: IBFTAlgoParameters): Observable<IBFTAExtHitTestResult> {
        return this._http.post<IBFTAExtHitTestResult>(`${this.url}hittest_ext`, data);
    }
}
