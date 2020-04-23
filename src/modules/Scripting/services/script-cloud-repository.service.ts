import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {IdentityService} from "@app/services/auth/identity.service";
import {
    CompilationResponse,
    CreateScriptResponse,
    IScriptCloudRepositoryService,
    RunningMetadata,
    ScriptDTO
} from "../models/IScriptCloudRepositoryService";
import {Script, IScriptCategory} from "../models/Script";
import {ScriptingApiService} from "@scripting/services/scripting-api.service";

@Injectable()
export class ScriptCloudRepositoryService implements IScriptCloudRepositoryService {
    constructor(private _http: HttpClient,
                private _identity: IdentityService,
                private _scriptingApiService: ScriptingApiService) {
    }

    createScript(script: ScriptDTO): Observable<CreateScriptResponse> {
        return this._scriptingApiService.createScript(script);
    }

    deleteScript(scriptName: string): Observable<any> {
        return this._scriptingApiService.deleteScript(scriptName);
    }

    loadRunningScripts(): Observable<RunningMetadata[]> {
        return this._scriptingApiService.loadRunningScripts();
    }

    loadUsersRunningScripts(): Observable<RunningMetadata[]> {
        return this._scriptingApiService.loadAllUsersRunningScripts();
    }

    loadScripts(): Observable<Script[]> {
        return this._scriptingApiService.loadScripts();
    }

    loadBuiltInScripts(): Observable<IScriptCategory[]> {
        return this._scriptingApiService.loadBuiltInScripts();
    }

    loadBuiltInScriptCode(name: string): Observable<string> {
        return this._scriptingApiService.loadBuiltInScriptCode(name);
    }

    updateScript(oldScriptName: string, newScript: ScriptDTO): Observable<CreateScriptResponse> {
        return this._scriptingApiService.updateScript(oldScriptName, newScript);
    }

    compileScript(script: string, name: string): Observable<CompilationResponse> {
        return this._scriptingApiService.compileScript(script, name);
    }
}


