import { Injectable } from "@angular/core";
import { IInstrument } from "../models/common/instrument";
import { Observable, Observer, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from './app.config.service';

import * as CryptoJS from 'crypto-js';
import { InstrumentService } from "./instrument.service";

export enum TrendDetectorType {
    hma = "hma",
    mesa = "mesa"
}

export interface ITimeFrame {
    interval: number;
    periodicity: string;
}


export interface IBFTScanInstrumentsResponseItem {
    symbol: string;
    exchange: string;
    timeframe: number;
    trend: IBFTATrend;
    type: IBFTATradeType;
    tte: number;
    tp: IBFTATradeProbability;
    entry: number;
    stop: number;
}

export interface IBFTScannerResponseHistoryItem {
    responseItem: IBFTScanInstrumentsResponseItem;
    time: number;
    avgEntry: number;
}

export interface IBFTScanInstrumentsResponse {
    items: IBFTScanInstrumentsResponseItem[];
    scanning_time: number;
}

export interface IBFTScannerHistoryResponse {
    items: IBFTScannerResponseHistoryItem[];
}

export interface IBFTAlgoParameters {
    contract_size?: number;
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

export interface IBFTAPositionSizeParameters {
    contract_size?: number;
    input_accountsize: number;
    input_risk: number;
    price_diff: number;
    instrument: IInstrument;
}

export interface IBFTACalculatePriceRatioParameters {
    account_currency: string;
    instrument: IInstrument;
}

export interface IBFTBacktestAlgoParameters extends IBFTAlgoParameters {
    hma_period: number;
    breakeven_candles: number;
    global_fast?: number;
    global_slow?: number;
    local_fast?: number;
    local_slow?: number;
    mesa_diff?: number;
    trend_detector: TrendDetectorType;
}

export interface IBFTBacktestV2AlgoParameters extends IBFTAlgoParameters {
    breakeven_candles: number;
    risk_reward: number;
    global_fast: number;
    global_slow: number;
    local_fast?: number;
    local_slow?: number;
    mesa_diff: number;
    stoploss_rr: number;
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
    trend: IBFTATrend;
    top_ex2: number;
    top_ex1: number;
    r: number;
    n: number;
    s: number;
    bottom_ex1: number;
    bottom_ex2: number;
}

export interface IBFTALevels {
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

export interface IBFTATrade {
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

export interface IBFTATradeV2 {
    trend: IBFTATrend;
    type: IBFTATradeType;
    tte: number;
    tp: IBFTATradeProbability;
    entry: number;
    entry_h: number;
    entry_l: number;
    take_profit: number;
    take_profit_h: number;
    take_profit_l: number;
    stop: number;
    risk: number;
    sl_ratio: number;
}

export interface IBFTAAlgoResponse {
    levels: IBFTALevels;
    trade: IBFTATrade;
}

export interface IBFTAMarketInfo {
    support: number;
    resistance: number;
    natural: number;
    daily_support: number;
    daily_resistance: number;
    daily_natural: number;
    last_price: number;
    local_trend: IBFTATrend;
    global_trend: IBFTATrend;
    is_overhit: boolean;
    global_trend_spread: number;
    local_trend_spread: number;
}

export interface IBFTAAlgoResponseV2 {
    levels: IBFTALevels;
    trade: IBFTATradeV2;
    size: number;
}

export interface IBFTAPositionSize {
    size: number;
}

export interface IBFTAPriceRatio {
    ratio: number;
}

export interface IBFTAEncryptedResponse {
    data: string;
}

export interface IBFTASignal {
    timestamp: number;
    end_timestamp: number;
    data: IBFTAAlgoResponse;
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

export enum IBFTATradeType {
    EXT = "EXT",
    SwingN = "SwingN",
    SwingExt = "SwingExt",
    BRC = "BRC"
}

export enum IBFTATradeProbability {
    Low = "Low",
    Mid = "Mid",
    High = "High",
}

export interface IBFTAExtHitTestSignal {
    timestamp: number;
    end_timestamp: number;
    data: IBFTAAlgoResponse;
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
    global_trend_spread: number;
    local_trend_spread: number;
    global_trend_strength: string;
    local_trend_strength: string;
    general_trend: string[];
}

class AlgoServiceEncryptionHelper {
    private static keySize = 256;
    private static ivSize = 128;
    private static saltSize = 256;
    private static iterations = 1000;
    private static password = "Adfwe2fsdf";

    static encrypt(msg) {
        let salt = CryptoJS.lib.WordArray.random(this.saltSize / 8);

        let key = CryptoJS.PBKDF2(this.password, salt, {
            keySize: this.keySize / 32,
            iterations: this.iterations
        });

        let iv = CryptoJS.lib.WordArray.random(this.ivSize / 8);

        let encrypted = CryptoJS.AES.encrypt(msg, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC

        });

        let encryptedHex = this.base64ToHex(encrypted.toString());
        let base64result = this.hexToBase64(salt + iv + encryptedHex);


        return base64result;
    }

    static decrypt(transitmessage) {

        let hexResult = this.base64ToHex(transitmessage);

        let salt = CryptoJS.enc.Hex.parse(hexResult.substr(0, 64));
        let iv = CryptoJS.enc.Hex.parse(hexResult.substr(64, 32));
        let encrypted = this.hexToBase64(hexResult.substring(96));

        let key = CryptoJS.PBKDF2(this.password, salt, {
            keySize: this.keySize / 32,
            iterations: this.iterations
        });

        let decrypted = CryptoJS.AES.decrypt(encrypted, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC

        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    static hexToBase64(str) {
        const d = str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ");
        let s = "";
        for (const i of d) {
            s += String.fromCharCode(i);
        }
        return btoa(s);
    }

    static base64ToHex(str) {
        let hex = [];
        let bin = atob(str.replace(/[ \r\n]+$/, ""));
        for (let i = 0; i < bin.length; ++i) {
            let tmp = bin.charCodeAt(i).toString(16);
            if (tmp.length === 1) tmp = "0" + tmp;
            hex[hex.length] = tmp;
        }
        return hex.join("");
    }
}

@Injectable()
export class AlgoService {
    private url: string;

    constructor(private _http: HttpClient, private _instrumentService: InstrumentService) {
        this.url = AppConfigService.config.apiUrls.bftAlgoREST;
    }

    calculate(data: IBFTAlgoParameters): Observable<IBFTAAlgoResponse> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}calculate`, data).pipe(map(this._decrypt));
    }

    calculateV2(data: IBFTAlgoParameters): Observable<IBFTAAlgoResponseV2> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}calculate_v2`, data).pipe(map(this._decrypt));
    }

    calculatePositionSize(data: IBFTAPositionSizeParameters): Observable<IBFTAPositionSize> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}calculate_pos_size`, data).pipe(map(this._decrypt));
    }

    calculatePriceRatio(data: IBFTACalculatePriceRatioParameters): Observable<IBFTAPriceRatio> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}calculate_price_ratio`, data).pipe(map(this._decrypt));
    }

    backtest(data: IBFTBacktestAlgoParameters): Observable<IBFTABacktestResponse> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}backtest`, data).pipe(map(this._decrypt));
    }

    backtestV2(data: IBFTBacktestV2AlgoParameters): Observable<IBFTABacktestV2Response> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}strategy_v2_backtest`, data).pipe(map(this._decrypt));
    }

    extHitTest(data: IBFTAHitTestAlgoParameters): Observable<IBFTAExtHitTestResult> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}hittest_ext`, data).pipe(map(this._decrypt));
    }

    calculateRTD(data: any): Observable<IRTDPayload> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}rtd`, data).pipe(map(this._decrypt));
    }

    getMarketInfo(instrument: IInstrument | string, granularity: number): Observable<IBFTAMarketInfo> {
        if (typeof (instrument) === 'string') {
            return new Observable<IBFTAMarketInfo>((observer: Observer<IBFTAMarketInfo>) => {
                this._instrumentService.instrumentToDatafeedFormat(instrument).subscribe((mappedInstrument: IInstrument) => {
                    if (!mappedInstrument) {
                        observer.next(null);
                        return;
                    }
                    this._http.post<IBFTAEncryptedResponse>(`${this.url}calculate_market_info_v2`, {
                        instrument: mappedInstrument,
                        granularity: granularity
                    }).pipe(map(this._decrypt)).subscribe((res) => {
                        observer.next(res);
                    });
                }, (error) => {
                    observer.next(null);
                });
            });
        }

        return this._http.post<IBFTAEncryptedResponse>(`${this.url}calculate_market_info`, instrument).pipe(map((encryptedData) => {
            const decryptedData = this._decrypt(encryptedData);
            return decryptedData;
        }));
    }

    scanInstruments(): Observable<IBFTScanInstrumentsResponse> {
        return this._http.get<IBFTAEncryptedResponse>(`${this.url}scanner_results`).pipe(map(this._decrypt));
    }

    scannerHistory(): Observable<IBFTScannerHistoryResponse> {
        return this._http.get<IBFTAEncryptedResponse>(`${this.url}scanner_history_results`).pipe(map(this._decrypt));
    }

    private _decrypt(encrypted: IBFTAEncryptedResponse): any {
        const decrypted = AlgoServiceEncryptionHelper.decrypt(encrypted.data);
        return JSON.parse(decrypted);
    }
}
