import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {BaseResolver} from "./base-resolver";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {ScriptCloudRepositoryService} from "@scripting/services/script-cloud-repository.service";
import {RunningMetadata} from "@scripting/models/IScriptCloudRepositoryService";

@Injectable()
export class RunningScriptsResolver extends BaseResolver<RunningMetadata[]> {
    constructor(private _scriptsRepository: ScriptCloudRepositoryService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RunningMetadata[]> {
        return this._scriptsRepository.loadUsersRunningScripts();
    }
}
