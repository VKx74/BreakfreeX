import {Observable, Subject} from "rxjs";
import {RunningMetadata} from "@scripting/models/IScriptCloudRepositoryService";
import {ScriptProperty} from "@scripting/models/Script";
import {IScriptProperty} from "@scripting/components/script-params/script-params.component";

export class ScriptStateEvtData {
    scriptName: string;
    runningId: string;
}

export interface HistoryParameters {
    kind: string;
    granularity: number;
    barsCount?: number;
    from?: number;
    to?: number;
}

export interface TradingParameters {
    accessToken: string;
    broker: string;
}

export interface ScriptStartParameters {
    scriptName: string;
    symbol: string;
    exchange: string;
    datafeed: string;
    historyParameters: HistoryParameters;
    properties: IScriptProperty;
}

export interface ScriptStartParametersDTO extends ScriptStartParameters {
    userId: string;
    email?: string;
    phone?: string;
    tradingParamters: TradingParameters;
}

export interface IScriptCloudExecutorService {
    onScriptStarted: Subject<ScriptStateEvtData>;
    onScriptStopped: Subject<ScriptStateEvtData>;
    onScriptFailed: Subject<ScriptStateEvtData>;
    onScriptShowPopup: Subject<string>;
    onScriptPlaySound: Subject<string>;

    startScript(scriptName: string, params: ScriptStartParameters): Observable<RunningMetadata>;

    stopScript(scriptName: string): Observable<string>;
}
