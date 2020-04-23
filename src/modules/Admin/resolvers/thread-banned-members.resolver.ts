import {Injectable} from "@angular/core";
import {EMPTY, Observable} from "rxjs";
import {BaseResolver} from "./base-resolver";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {ChatApiService} from "../../Chat/services/chat.api.service";
import {IThreadBan} from "../../Chat/models/thread";
import {catchError} from "rxjs/operators";

@Injectable()
export class ThreadBannedMembersResolver extends BaseResolver<IThreadBan[]> {
    constructor(private _threadService: ChatApiService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IThreadBan[]> {
        return this._threadService.getThreadAllBans(route.params['id']).pipe(
            catchError(err => {
                console.warn('Failed to fetch banned users', err);
                return EMPTY;
            })
        );
    }
}
