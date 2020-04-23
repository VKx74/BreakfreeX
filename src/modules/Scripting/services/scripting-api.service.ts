import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpUrlEncodingCodec} from "@angular/common/http";
import {IdentityService} from "@app/services/auth/identity.service";
import {Observable, throwError} from "rxjs";
import {
    CompilationResponse,
    CreateScriptResponse, CreateScriptResponseDTO,
    RunningMetadata,
    ScriptDTO
} from "@scripting/models/IScriptCloudRepositoryService";
import {AppConfigService} from "@app/services/app.config.service";
import {catchError, map} from "rxjs/operators";
import {IScriptCategory, Script, ScriptKind, ScriptOrigin} from "@scripting/models/Script";
import {ScriptStartParametersDTO} from "@scripting/models/IScriptCloudExecutorService";
import {ResponseError} from "@app/models/common/response-error";

export enum ScriptRepositoryErrorCodes {
    UnknownError = -1,
    ScriptWithNameAlreadyExists,
    CompilationFailed
}

@Injectable()
export class ScriptingApiService {
    get _userID(): string {
        return this._identity.id;
    }

    constructor(private _http: HttpClient,
                private _identity: IdentityService) {
    }

    loadScripts(): Observable<Script[]> {
        const query = `userId=${this._userID}&origin=custom&kind=strategy`;
        return this._http.get(`${AppConfigService.config.apiUrls.scriptEngineREST}scripts?${query}`).pipe(map((data: any) => {
            const result: Script[] = [];

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                result.push({
                    name: row.name,
                    code: row.code,
                    description: row.description,
                    scriptKind: row.scriptKind as ScriptKind,
                    scriptOrigin: row.scriptOrigin as ScriptOrigin,
                    properties: row.properties
                });
            }

            return result;
        }));
    }

    loadRunningScripts(): Observable<RunningMetadata[]> {
        return this._http.get(`${AppConfigService.config.apiUrls.scriptEngineREST}running?kind=strategy&userId=${this._userID}`).pipe(map((data: any) => {
            const result: RunningMetadata[] = [];

            if (!data) {
                return result;
            }

            for (let i = 0; i < data.length; i++) {
                result.push(data[i] as RunningMetadata);
            }

            return result;
        }));
    }

    loadAllUsersRunningScripts(): Observable<RunningMetadata[]> {
        return this._http.get(`${AppConfigService.config.apiUrls.scriptEngineREST}manage/scripts/running?kind=strategy`).pipe(map((data: any) => {
            const result: RunningMetadata[] = [];

            if (!data) {
                return result;
            }

            return data as RunningMetadata[];
        }));
    }

    startScript(params: ScriptStartParametersDTO): Observable<RunningMetadata> {
        return this._http.post<RunningMetadata>(`${AppConfigService.config.apiUrls.scriptEngineREST}run`, params);
    }

    stopScript(runningId: string, userId?: string): Observable<any> {
        const dto = {
            runningId: runningId,
            userId: userId || this._identity.id
        };

        return this._http.post(`${AppConfigService.config.apiUrls.scriptEngineREST}stop`, dto);
    }

    deleteScript(scriptName: string): Observable<any> {
        let userId = this._identity.id;
        let name = new HttpUrlEncodingCodec().encodeValue(scriptName);

        return this._http.delete(`${AppConfigService.config.apiUrls.scriptEngineREST}scripts/${name}/${userId}`);
    }

    createScript(script: ScriptDTO): Observable<CreateScriptResponse> {
        let userId = this._identity.id;

        let dto = {
            userId: userId,
            scriptKind: ScriptKind.strategy,
            name: script.name,
            description: script.description,
            code: script.code && script.code.length ? script.code : Script.defaultCodeTemplate()
        };

        return this._http.post<CreateScriptResponseDTO>(`${AppConfigService.config.apiUrls.scriptEngineREST}scripts`, dto).pipe(map((data: CreateScriptResponseDTO) => {
            if (data.success) {
                return {
                    script: data.scriptInfo,
                    output: data.output as string[],
                    success: data.success
                };
            } else {
                return {
                    output: data.output as string[],
                    success: data.success
                };
            }
        }))
            .pipe(
                catchError((e: HttpErrorResponse) => {
                    return throwError({
                        errorCode: ScriptRepositoryErrorCodes.UnknownError,
                        errorDescription: e.error
                    } as ResponseError);
                })
            );
    }

    compileScript(script: string, name: string): Observable<CompilationResponse> {
        let userId = this._identity.id;

        let dto = {
            userId: userId,
            name: name,
            code: script
        };

        return this._http.post(`${AppConfigService.config.apiUrls.scriptEngineREST}scripts/compile`, dto).pipe(map((data: any) => {
            return {
                output: data.output as string[],
                success: data.success
            };
        }));
    }

    loadBuiltInScriptCode(name: string): Observable<string> {
        return this._http.get(`${AppConfigService.config.apiUrls.scriptEngineREST}scripts/built-in/${name}`).pipe(map((data: any) => {
            return data;
        }));
    }
    loadBuiltInScripts(): Observable<IScriptCategory[]> {
        return this._http.get(`${AppConfigService.config.apiUrls.scriptEngineREST}scripts/built-in`).pipe(map((data: any) => {
            const result: IScriptCategory[] = [];

            if (data && data.length) {
                for (let i = 0; i < data.length; i++) {
                    const script = data[i];
                    const basedOn = script.basedOn;

                    if (!basedOn) {
                        continue;
                    }

                    let category: IScriptCategory = null;
                    for (let j = 0; j < result.length; j++) {
                        if (result[j].name === basedOn) {
                            category = result[j];
                            break;
                        }
                    }

                    if (!category) {
                        category = {
                            name: basedOn,
                            scripts: []
                        };

                        result.push(category);
                    }
                    category.scripts.push({
                        description: script.description,
                        name: script.name,
                        properties: script.properties,
                        scriptOrigin: ScriptOrigin.builtIn
                    });
                }
            }

            return result;
        }));
    }

    updateScript(oldScriptName: string, newScript: ScriptDTO): Observable<CreateScriptResponse> {
        return new Observable<CreateScriptResponse>(subscriber => {
            this.compileScript(newScript.code, newScript.name).subscribe(compilationResponse => {
                if (!compilationResponse.success) {
                    subscriber.error(compilationResponse);
                    subscriber.complete();
                    return;
                }

                this.deleteScript(oldScriptName).subscribe(value => {
                    this.createScript(newScript).subscribe(createResult => {
                        subscriber.next(createResult);
                        subscriber.complete();
                    }, createError => {
                        subscriber.error(createError);
                        subscriber.complete();
                    });
                }, error => {
                    subscriber.error(error);
                    subscriber.complete();
                });
            }, compilationError => {
                subscriber.error(compilationError);
                subscriber.complete();
            });
        });
    }
}
