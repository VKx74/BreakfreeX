import { Injectable } from "@angular/core";
import { IInstrument } from "../models/common/instrument";
import { Observable, Observer, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from './app.config.service';

import * as CryptoJS from 'crypto-js';
import { InstrumentService } from "./instrument.service";


export enum InstrumentTypeId {
    Bonds = "Bonds",
    Commodities = "Commodities",
    Crypto = "Crypto",
    Equities = "Equities",
    ForexExotics = "ForexExotics",
    Indices = "Indices",
    MajorForex = "MajorForex",
    Metals = "Metals",
    ForexMinors = "ForexMinors",
    Other = "Other"
}

export enum InstrumentTypeName {
    Bonds = "Bonds",
    Commodities = "Commodities",
    Crypto = "Crypto",
    Equities = "Equities",
    ForexExotics = "Forex Exotics",
    Indices = "Indices",
    MajorForex = "Major Forex",
    Metals = "Metals",
    ForexMinors = "Forex Minors",
    Other = "Other"
}

export enum TrendDetectorType {
    hma = "hma",
    mesa = "mesa"
}

export interface ITimeFrame {
    interval: number;
    periodicity: string;
}


export interface IBFTScanInstrumentsResponseItem {
    id?: string;
    symbol: string;
    exchange: string;
    marketType: string;
    timeframe: number;
    trend: IBFTATrend;
    type: IBFTATradeType;
    tte: number;
    tp: IBFTATradeProbability;
    isMocked?: boolean;
    entry: number;
    stop: number;
}

export interface IBFTScannerResponseHistoryItem {
    responseItem: IBFTScanInstrumentsResponseItem;
    time: number;
    avgEntry: number;
}

export interface IBFTScannerCacheItem {
    responseItem: IBFTScanInstrumentsResponseItem;
    time: number;
    avgEntry: number;
    trade: IBFTATradeV2;
    trend: IBFTAAlgoTrendResponse;
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
    account_currency: string;
    input_risk: number;
    input_splitpositions: number;
    input_stoplossratio: number;
    instrument: IInstrument;
    time: number;
    timenow: number;
    replay_back?: number;
    timeframe: ITimeFrame;
    id?: string;
}

export interface IBFTAPositionSizeParameters {
    contract_size?: number;
    input_accountsize: number;
    account_currency: string;
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

export interface IBFTScannerBacktestAlgoParameters extends IBFTAlgoParameters {
    breakeven_candles: number;
    cancellation_candles: number;
    global_fast: number;
    global_slow: number;
    local_fast: number;
    local_slow: number;
    min_threshold: number;
    single_position: boolean;
    type: string;
    rtd_timeframe: string;
    validation_url: string;
    rtd_tf: number;
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
    cvar: number;
}


export interface IBFTAMarketInfoData {
    data: IBFTAMarketInfo;
    instrument: IInstrument;
}

export interface IBFTAAlgoResponseV2 {
    levels: IBFTALevels;
    trade: IBFTATradeV2;
    size: number;
    id: any;
}

export interface SaRResponse {
    r_p28: number;
    r_p18: number;
    r: number;
    n: number;
    s_m28: number;
    s_m18: number;
    s: number;
    date: number;
}

export interface IBFTAAlgoResponseV3 {
    levels: IBFTALevels;
    trade: IBFTATradeV2;
    lower_1_prob: string;
    lower_3_prob: string;
    lower_2_prob: string;
    upper_1_prob: string;
    upper_3_prob: string;
    upper_2_prob: string;
    support_prob: number;
    resistance_prob: number;
    support_ext_prob: number;
    resistance_ext_prob: number;
    sl_price: number;
    id: any;
    sar: SaRResponse[];
    sar_prediction: SaRResponse[];
    rtd: IRTDPayload;
    mema_prediction: number[];
    fama_prediction: number[];
}

export interface IBFTAAlgoTrendResponse {
    globalTrend: IBFTATrend;
    localTrend: IBFTATrend;
    localTrendSpread: number;
    globalTrendSpread: number;
    localTrendSpreadValue: number;
    globalTrendSpreadValue: number;
    globalFastValue: number;
    globalSlowValue: number;
    localFastValue: number;
    localSlowValue: number;
    globalAvg: number;
    localAvg: number;
}

export interface IBFTAAlgoCacheItemResponse {
    setup: IBFTAAlgoResponseV2;
    trend: IBFTAAlgoTrendResponse;
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

export interface IBFTACVarInfo {
    cvar?: number;
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

export interface IBFTAValidationData {
    timestamp: number;
    good_trade: number;
    bad_trade: number;
}

export interface IBFTAScannerSignal {
    timestamp: number;
    end_timestamp: number;
    data: IBFTAAlgoResponseV2;
    local_trend: IBFTATrend;
    global_trend: IBFTATrend;
    local_trend_spread: number;
    global_trend_spread: number;
    local_trend_spread_value: number;
    global_trend_spread_value: number;
    global_fast_value: number;
    global_slow_value: number;
    local_fast_value: number;
    local_slow_value: number;
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

export interface IBFTAScannerBacktestResponse {
    signals: IBFTAScannerSignal[];
    validation_data: IBFTAValidationData[];
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
    global_avg: number;
    local_avg: number;
}

export interface ICFlexPayload {
    dates: number[];
    values: number[];
    id?: string;
}

export interface IMesaTrendStrength {
    f: number;
    s: number;
    v: number;
    t: number;
}

export interface IBarData {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    t: number;
}

export interface ITrendPeriodDescriptionResponse {
    strength: number;
    volatility: number;
    duration: number;
    phase: number;
}

export interface IMesaTrendIndex {
    symbol: string;
    group: string;
    datafeed: string;
    strength: { [id: string]: IMesaTrendStrength; };
    avg_strength: { [id: string]: number; };
    trend_period_descriptions: { [key: number]: ITrendPeriodDescriptionResponse };
    timeframe_strengths: { [key: number]: number };
    volatility: { [key: number]: number };
    durations: { [key: number]: number };
    timeframe_state: { [key: number]: number };
    timeframe_phase: { [key: number]: number };
    total_strength: number;
    last_price: number;
    price60: number;
    price300: number;
    price900: number;
    price3600: number;
    price14400: number;
    price86400: number;
    current_phase: number;
    next_phase: number;
    trading_state_n: number;
    trading_state_sr: number;
}

export interface IMesaTrendDetails {
    // bars: IBarData[];
    mesa: { [id: string]: IMesaTrendStrength[]; };
}


export interface IEvent {
    Name: string;
    Description: any;
    HTMLDescription: string;
    InternationalCountryCode: string;
    CountryName: string;
    EventTypeDescription: string;
    Potency?: number;
    PotencySymbol?: string;
    CurrencyId: string;
    Symbol: string;
    IsSpeech?: boolean;
    IsReport?: boolean;
    RiseType: string;
}

export interface IEconomicEvent {
    Event: IEvent;
    Id: string;
    DateUtc: string;
    ForPeriod?: string;
    Volatility?: number;
    Actual?: number;
    Consensus?: number;
    Previous?: number;
    Revised?: number;
    IsBetterThanExpected?: boolean;
}

export enum TradingDirection {
    Auto = 0,
    Short = 1,
    Long = 2
}

export interface IUserAutoTradingDefinedMarketData {
    symbol: string;
    tradingDirection: TradingDirection;
    minStrength: number;
    minStrength1H: number;
    minStrength4H: number;
    minStrength1D: number;
}

export interface IUserAutoTradingInfoData {
    markets: IUserAutoTradingDefinedMarketData[];
    useManualTrading: boolean;
    botShutDown: boolean;
    accountRisk: number;
    defaultMarketRisk: number;
    defaultGroupRisk: number;
    maxInstrumentCount: number;
    strategy: number;
    disabledMarkets: string[];
    risksPerMarket: { [key: string]: number };
    risksPerGroup: { [key: string]: number };
}


export interface IUserMarketConfigData {
    isDisabled: boolean;
    isTradable: boolean;
    maxRisks: number;
    risks: number;
    symbol: string;
}

export interface INALog {
    data: string;
    type: number;
    date: number;
}

export interface INALogResponse {
    logs: INALog[];
    lastOnlineDate: number;
    naVersion: string;
}

export interface IAutoTradingSymbolInfoResponse {
    TotalStrength: number;
    SL: number;
    HalfBand1M: number;
    HalfBand5M: number;
    HalfBand15M: number;
    HalfBand1H: number;
    HalfBand4H: number;
    HalfBand1D: number;
    Entry1M: number;
    Entry5M: number;
    Entry15M: number;
    Entry1H: number;
    Entry4H: number;
    Entry1D: number;
    TP1M: number;
    TP5M: number;
    TP15M: number;
    TP1H: number;
    TP4H: number;
    TP1D: number;
    Strength1M: number;
    Strength5M: number;
    Strength15M: number;
    Strength1H: number;
    Strength4H: number;
    Strength1D: number;
    Strength1Month: number;
    Strength1Y: number;
    Strength10Y: number;
    Phase1M: number;
    Phase5M: number;
    Phase15M: number;
    Phase1H: number;
    Phase4H: number;
    Phase1D: number;
    Phase1Month: number;
    Phase1Y: number;
    Phase10Y: number;
    State1M: number;
    State5M: number;
    State15M: number;
    State1H: number;
    State4H: number;
    State1D: number;
    State1Month: number;
    State1Y: number;
    State10Y: number;
    Volatility1M: number;
    Volatility15M: number;
    Volatility1H: number;
    Volatility1D: number;
    TrendDirection: number;
    ShortGroupPhase: number;
    MidGroupPhase: number;
    LongGroupPhase: number;
    ShortGroupStrength: number;
    MidGroupStrength: number;
    LongGroupStrength: number;
    CurrentPhase: number;
    NextPhase: number;
    CurrentPrice: number;
    Time: number;
    TradingStateSR: number;
    TradingStateN: number;
    OppositeSL: number;
    OppositeEntry1M: number;
    OppositeEntry5M: number;
    OppositeEntry15M: number;
    OppositeEntry1H: number;
    OppositeEntry4H: number;
    OppositeEntry1D: number;
    OppositeTrendDirection: number;
    SL1M_N: number;
    SL5M_N: number;
    SL15M_N: number;
    SL1H_N: number;
    SL4H_N: number;
    OppositeSL1M_N: number;
    OppositeSL5M_N: number;
    OppositeSL15M_N: number;
    OppositeSL1H_N: number;
    OppositeSL4H_N: number;
    Skip1MinTrades_N: boolean;
    Skip5MinTrades_N: boolean;
    Skip15MinTrades_N: boolean;
    Skip1HourTrades_N: boolean;
    Skip4HourTrades_N: boolean;
    MinStrength1M_N: number;
    MinStrength5M_N: number;
    MinStrength15M_N: number;
    MinStrength1H_N: number;
    MinStrength4H_N: number;
    DDClosePositions_N: boolean;
    DDCloseInitialInterval_N: number;
    DDCloseIncreasePeriod_N: number;
    DDCloseIncreaseThreshold_N: number;

    SL1M_SR: number;
    SL5M_SR: number;
    SL15M_SR: number;
    SL1H_SR: number;
    SL4H_SR: number;
    OppositeSL1M_SR: number;
    OppositeSL5M_SR: number;
    OppositeSL15M_SR: number;
    OppositeSL1H_SR: number;
    OppositeSL4H_SR: number;
    Skip1MinTrades_SR: boolean;
    Skip5MinTrades_SR: boolean;
    Skip15MinTrades_SR: boolean;
    Skip1HourTrades_SR: boolean;
    Skip4HourTrades_SR: boolean;
    MinStrength1M_SR: number;
    MinStrength5M_SR: number;
    MinStrength15M_SR: number;
    MinStrength1H_SR: number;
    MinStrength4H_SR: number;
    DDClosePositions_SR: boolean;
    DDCloseInitialInterval_SR: number;
    DDCloseIncreasePeriod_SR: number;
    DDCloseIncreaseThreshold_SR: number;
    Logs_SR: string;
    Logs_N: string;
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
    private _cvarCache: { [symbol: string]: number; } = {};

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

    calculateV3(data: IBFTAlgoParameters): Observable<IBFTAAlgoResponseV3> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}calculate_v3`, data).pipe(map(this._decrypt)).pipe(map((_) => {
            let support_prob = _['support_prob'];
            let resistance_prob = _['resistance_prob'];
            let support_ext_prob = _['support_ext_prob'];
            let resistance_ext_prob = _['resistance_ext_prob'];

            if (Number.isFinite(support_prob)) {
                _['lower_1_prob'] = ".[AI.Neuron(" + (support_prob * 100).toFixed() + "%)]";
            }
            if (Number.isFinite(resistance_prob)) {
                _['upper_1_prob'] = ".[AI.Neuron(" + (resistance_prob * 100).toFixed() + "%)]";
            }
            if (Number.isFinite(support_ext_prob)) {
                _['lower_2_prob'] = ".[AI.Neuron(Val)]";
                _['lower_3_prob'] = ".[AI.Neuron(" + (support_ext_prob * 100).toFixed() + "%)]";
            }
            if (Number.isFinite(resistance_ext_prob)) {
                _['upper_2_prob'] = ".[AI.Neuron(Val)]";
                _['upper_3_prob'] = ".[AI.Neuron(" + (resistance_ext_prob * 100).toFixed() + "%)]";
            }

            // hide general SL printing on chart
            _.sl_price = undefined;

            return _;
        }));
    }

    calculateV2Guest(data: IBFTAlgoParameters): Observable<IBFTAAlgoResponseV2> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}calculate_v2_guest`, data).pipe(map(this._decrypt));
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

    backtestScanner(data: IBFTScannerBacktestAlgoParameters): Observable<IBFTAScannerBacktestResponse> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}backtest_scanner`, data).pipe(map(this._decrypt));
    }

    extHitTest(data: IBFTAHitTestAlgoParameters): Observable<IBFTAExtHitTestResult> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}hittest_ext`, data).pipe(map(this._decrypt));
    }

    calculateRTD(data: any): Observable<IRTDPayload> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}rtd`, data).pipe(map(this._decrypt));
    }

    calculateCFlex(data: any): Observable<ICFlexPayload> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}cflex`, data).pipe(map(this._decrypt));
    }

    calculateRTDGuest(data: any): Observable<IRTDPayload> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}rtd_guest`, data).pipe(map(this._decrypt));
    }

    getMarketInfo(instrument: IInstrument | string, granularity: number): Observable<IBFTAMarketInfoData> {
        if (typeof (instrument) === 'string') {
            return new Observable<IBFTAMarketInfoData>((observer: Observer<IBFTAMarketInfoData>) => {
                this._instrumentService.instrumentToDatafeedFormat(instrument).subscribe((mappedInstrument: IInstrument) => {
                    if (!mappedInstrument) {
                        observer.next(null);
                        return;
                    }
                    this._http.post<IBFTAEncryptedResponse>(`${this.url}calculate_market_info_v2`, {
                        instrument: mappedInstrument,
                        granularity: granularity
                    }).pipe(map(this._decrypt)).subscribe((res) => {
                        observer.next({
                            data: res,
                            instrument: mappedInstrument
                        });
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

    getMarketCVarInfo(instrument: string): Observable<number> {
        if (this._cvarCache[instrument]) {
            return of(this._cvarCache[instrument]);
        }

        return new Observable<number>((observer: Observer<number>) => {
            this._instrumentService.instrumentToDatafeedFormat(instrument).subscribe((mappedInstrument: IInstrument) => {
                if (!mappedInstrument) {
                    observer.next(null);
                    return;
                }
                this._http.post<IBFTAEncryptedResponse>(`${this.url}calculate_cvar`, mappedInstrument).pipe(map(this._decrypt)).subscribe((res: IBFTACVarInfo) => {
                    this._cvarCache[instrument] = res.cvar;
                    observer.next(res.cvar);
                });
            }, (error) => {
                observer.next(null);
            });
        });
    }

    scanInstruments(): Observable<IBFTScanInstrumentsResponse> {
        return this._http.get<IBFTAEncryptedResponse>(`${this.url}scanner_results`).pipe(map(this._decrypt));
    }

    scannerHistory(): Observable<IBFTScannerHistoryResponse> {
        return this._http.get<IBFTAEncryptedResponse>(`${this.url}scanner_history_results`).pipe(map(this._decrypt));
    }

    getSonarHistoryCache(symbol: string, exchange: string, timeframe: number, time: number): Observable<IBFTScannerCacheItem> {
        return this._http.post<IBFTAEncryptedResponse>(`${this.url}sonar_history_cache`, {
            symbol, exchange, timeframe, time
        }).pipe(map(this._decrypt));
    }

    getMesaTrendIndexes(): Observable<IMesaTrendIndex[]> {
        return this._http.get<IBFTAEncryptedResponse>(`${this.url}trends-summary`).pipe(map(this._decrypt));
    }

    getTrendsAdminOverview(): Observable<{ [key: string]: IAutoTradingSymbolInfoResponse }> {
        return this._http.get<{ [key: string]: IAutoTradingSymbolInfoResponse }>(`${this.url}trends-admin-overview`);
    }

    getMesaTrendDetails(symbol: string, datafeed: string): Observable<IMesaTrendDetails> {
        return this._http.get<IBFTAEncryptedResponse>(`${this.url}trends?symbol=${symbol}&datafeed=${datafeed}`).pipe(map(this._decrypt));
    }

    getEconomicalEvents(): Observable<IEconomicEvent[]> {
        return this._http.get<IBFTAEncryptedResponse>(`${this.url}economic-calendar`).pipe(map(this._decrypt));
    }

    getTrendIndexTradableInstrumentForAccount(account: string): Observable<string[]> {
        return this._http.post<string>(`${this.url}apex/markets`, {
            account: account, version: "2.0"
        }, { responseType: 'text' as any }).pipe(map((data: string) => {
            let result: string[] = [];
            let symbolArray = data.split("\n");
            for (let item of symbolArray) {
                if (!item) {
                    continue;
                }
                let symbol = item.split("=")[0];
                let dataInfo = item.split("=")[1];
                if (!symbol || !dataInfo) {
                    continue;
                }
                let dataArray = dataInfo.split(";");
                if (dataArray.length !== 2) {
                    continue;
                }
                let percentage = Number(dataArray[0]);
                let maxAllocation = dataArray[1];

                if (percentage && percentage > 0) {
                    result.push(symbol.replace("_", ""));
                }
            }
            return result;
        }));
    }

    getTrendIndexMarketsConfigForAccount(account: string, strategyType: number): Observable<IUserMarketConfigData[]> {
        return this._http.post<IUserMarketConfigData[]>(`${this.url}apex/markets-config`, {
            account: account, version: "2.0", strategy: strategyType
        });
    }

    addTradableInstrumentForAccount(account: string, userId: string, symbols: [{ symbol: string, tradingDirection: TradingDirection }]): Observable<IUserAutoTradingInfoData> {
        let markets = [];
        for (let s of symbols) {
            markets.push({
                symbol: s.symbol,
                tradingDirection: s.tradingDirection
            });
        }
        return this._http.post<IUserAutoTradingInfoData>(`${this.url}apex/config/add-markets`, {
            account: account, userId: userId, version: "2.0", markets: markets
        });
    }

    removeTradableInstrumentForAccount(account: string, userId: string, symbols: string[]): Observable<IUserAutoTradingInfoData> {
        return this._http.post<IUserAutoTradingInfoData>(`${this.url}apex/config/remove-markets`, {
            account: account, userId: userId, version: "2.0", markets: symbols
        });
    }

    enableTradableInstrumentForAccount(account: string, userId: string, symbols: string[]): Observable<IUserAutoTradingInfoData> {
        return this._http.post<IUserAutoTradingInfoData>(`${this.url}apex/config/remove-disabled-markets`, {
            account: account, userId: userId, version: "2.0", markets: symbols
        });
    }

    disableTradableInstrumentForAccount(account: string, userId: string, symbols: string[]): Observable<IUserAutoTradingInfoData> {
        return this._http.post<IUserAutoTradingInfoData>(`${this.url}apex/config/add-disabled-markets`, {
            account: account, userId: userId, version: "2.0", markets: symbols
        });
    }

    resetBotSettingsToDefault(account: string, userId: string): Observable<IUserAutoTradingInfoData> {
        return this._http.post<IUserAutoTradingInfoData>(`${this.url}apex/config/reset-bot-settings`, {
            account: account, userId: userId, version: "2.0"
        });
    }

    changeMarketRiskForAccount(account: string, userId: string, symbol: string, risk: number): Observable<IUserAutoTradingInfoData> {
        return this._http.post<IUserAutoTradingInfoData>(`${this.url}apex/config/change-market-risk`, {
            account: account, userId: userId, version: "2.0", market: symbol, risk: risk
        });
    }

    changeRiskForAccount(account: string, userId: string, risk: number): Observable<IUserAutoTradingInfoData> {
        return this._http.post<IUserAutoTradingInfoData>(`${this.url}apex/config/change-account-risk`, {
            account: account, userId: userId, version: "2.0", risk: risk
        });
    }

    changeDefaultMarketRisk(account: string, userId: string, risk: number): Observable<IUserAutoTradingInfoData> {
        return this._http.post<IUserAutoTradingInfoData>(`${this.url}apex/config/change-default-market-risk`, {
            account: account, userId: userId, version: "2.0", risk: risk
        });
    }

    changeGroupRiskForAccount(account: string, userId: string, group: string, risk: number): Observable<IUserAutoTradingInfoData> {
        return this._http.post<IUserAutoTradingInfoData>(`${this.url}apex/config/change-group-risk`, {
            account: account, userId: userId, version: "2.0", group: group, risk: risk
        });
    }

    changeDefaultGroupRisk(account: string, userId: string, risk: number): Observable<IUserAutoTradingInfoData> {
        return this._http.post<IUserAutoTradingInfoData>(`${this.url}apex/config/change-default-group-risk`, {
            account: account, userId: userId, version: "2.0", risk: risk
        });
    }

    changeUseManualTradingForAccount(account: string, userId: string, useManualTrading: boolean): Observable<IUserAutoTradingInfoData> {
        return this._http.post<IUserAutoTradingInfoData>(`${this.url}apex/config/change-use-manual-trading`, {
            account: account, userId: userId, version: "2.0", useManualTrading: useManualTrading
        });
    }

    changeBotEnabledForAccount(account: string, userId: string, switchedOff: boolean): Observable<IUserAutoTradingInfoData> {
        return this._http.post<IUserAutoTradingInfoData>(`${this.url}apex/config/change-bot-state`, {
            account: account, userId: userId, version: "2.0", switchedOff: switchedOff
        });
    }

    changeBotStrategyForAccount(account: string, userId: string, strategy: number): Observable<IUserAutoTradingInfoData> {
        return this._http.post<IUserAutoTradingInfoData>(`${this.url}apex/config/change-bot-strategy`, {
            account: account, userId: userId, version: "2.0", strategy: strategy
        });
    }

    getUserAutoTradingInfoForAccount(account: string): Observable<IUserAutoTradingInfoData> {
        return this._http.get<IUserAutoTradingInfoData>(`${this.url}apex/config/${account}`);
    }

    getUserAutoTradingRuntimeLogs(account: string): Observable<INALogResponse> {
        return this._http.get<INALogResponse>(`${this.url}apex/runtime/logs?account=${account}`);
    }

    private _decrypt(encrypted: IBFTAEncryptedResponse): any {
        const decrypted = AlgoServiceEncryptionHelper.decrypt(encrypted.data);
        return JSON.parse(decrypted);
    }
}
