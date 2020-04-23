import {Injectable} from "@angular/core";
import {Observable, Observer} from "rxjs";
import {BaseResolver} from "./base-resolver";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {ChatApiService} from "../../Chat/services/chat.api.service";
import {IThread} from "../../Chat/models/thread";
import {map} from "rxjs/operators";

export interface IThreadDetails {
    thread: IThread;
}

@Injectable()
export class ThreadDetailsResolver extends BaseResolver<IThreadDetails> {
    constructor(private _threadService: ChatApiService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IThreadDetails> {
        return this._threadService.getThreadById(route.params['id'])
            .pipe(
                map((thread) => {
                    return {
                        thread
                    } as IThreadDetails;
                })
            );
    }
}
