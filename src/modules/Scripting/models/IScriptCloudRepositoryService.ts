import {Observable} from "rxjs";
import {Script, ScriptKind} from "./Script";

export interface ScriptDTO {
    name: string;
    code: string;
    description: string;
}

export interface RunningMetadata {
    scriptName: string;
    runningId: string;
    startTimestamp: number;
    userId: string;
    scriptKind: ScriptKind;
}

export interface CreateScriptResponse {
    script?: Script;
    output: string[];
    success: boolean;
}

export interface CreateScriptResponseDTO {
    scriptInfo: Script;
    output: string[];
    success: boolean;
}

export interface CompilationResponse {
    output: string[];
    success: boolean;
}

export interface IScriptCloudRepositoryService {
    createScript(script: ScriptDTO): Observable<CreateScriptResponse>;
    loadScripts(): Observable<Script[]>;
    loadRunningScripts(): Observable<RunningMetadata[]>;
    updateScript(oldScriptName: string, newScript: ScriptDTO): Observable<CreateScriptResponse>;
    deleteScript(scriptName: string): Observable<any>;
    compileScript(script: string, name: string): Observable<CompilationResponse>;
}
