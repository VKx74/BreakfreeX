import {Injectable} from "@angular/core";
import {IInstrument} from "../models/common/instrument";
import {Observable, of} from "rxjs";
import {catchError} from "rxjs/operators";
import {HttpClient} from '@angular/common/http';
import {AppConfigService} from './app.config.service';

export enum TrendDetectorType {
    hma = "hma",
    mesa = "mesa"
}

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

export interface IBFTBacktestAlgoParameters extends IBFTAlgoParameters {
    hma_period: number;
    breakeven_candles: number;
    mesa_fast?: number;
    mesa_slow?: number;
    mesa_diff?: number;
    trend_detector: TrendDetectorType;
}

export interface IBFTBacktestV2AlgoParameters extends IBFTAlgoParameters {
    breakeven_candles: number;
    risk_reward: number;
    mesa_fast: number;
    mesa_slow: number;
    mesa_diff: number;
    hourly_mesa_fast: number;
    hourly_mesa_slow: number;
    hourly_mesa_diff: number;
    stoploss_rr: number;
    use_hourly_trend: boolean;
    use_daily_trend: boolean;
    place_on_ex1: boolean;
    place_on_sr: boolean;
    trend_detector: TrendDetectorType;
}

export interface IBFTAHitTestAlgoParameters extends IBFTBacktestAlgoParameters {
    entry_target_box: number;
    stoploss_rr: number;
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

export interface IBFTAStrategyV2Entry { 
    entry: number;
    stop: number;
    limit: number;
    is_buy: boolean;
}

export interface IBFTAStrategyV2Response { 
    trade_sr: IBFTAStrategyV2Entry;
    trade_ex1: IBFTAStrategyV2Entry;
    hourly_trend: IBFTATrend;
    daily_trend: IBFTATrend;
    top_ex2: number;
    top_ex1: number;
    r: number;
    n: number;
    s: number;
    bottom_ex1: number;
    bottom_ex2: number;
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
    end_timestamp: number;
    data: IBFTAAlgoData;
}

export interface IBFTASignalV2 {
    timestamp: number;
    end_timestamp: number;
    data: IBFTAStrategyV2Response;
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
    comment?: string;
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

export interface IBFTABacktestV2Response {
    signals: IBFTASignalV2[];
    orders: IBFTAOrder[];
}

export enum IBFTATrend {
    Up = "Up",
    Down = "Down",
    Undefined = "Undefined"
}

export interface IBFTAExtHitTestSignal {
    timestamp: number;
    end_timestamp: number;
    data: IBFTAAlgoData;
    topext1hit: boolean;
    topext2hit: boolean;
    bottomext1hit: boolean;
    bottomext2hit: boolean;
    backhit: boolean;
    wentout: boolean;
    breakeven: boolean;
    trend: IBFTATrend;
    top_sl: number;
    bottom_sl: number;
    top_entry: number;
    bottom_entry: number;
}

export interface IBFTAExtHitTestResult {
    signals: IBFTAExtHitTestSignal[];
}

export interface IRTDPayload {
    dates: number[];
    fast: number[];
    fast_2: number[];
    slow: number[];
    slow_2: number[];
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
    
    backtest(data: IBFTBacktestAlgoParameters): Observable<IBFTABacktestResponse> {
        return this._http.post<IBFTABacktestResponse>(`${this.url}backtest`, data);
    } 
    
    backtestV2(data: IBFTBacktestV2AlgoParameters): Observable<IBFTABacktestV2Response> {
        return this._http.post<IBFTABacktestV2Response>(`${this.url}strategy_v2_backtest`, data);
    }

    extHitTest(data: IBFTAHitTestAlgoParameters): Observable<IBFTAExtHitTestResult> {
        return this._http.post<IBFTAExtHitTestResult>(`${this.url}hittest_ext`, data);
    } 
    
    calculateRTD(data: any): Observable<IRTDPayload> {
        return this._http.post<IRTDPayload>(`${this.url}rtd`, data);
    }
}
