import {Injectable} from "@angular/core";
import {forkJoin, Observable} from "rxjs";
import {BaseResolver} from "./base-resolver";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {ChatApiService} from "../../Chat/services/chat.api.service";
import {PaginationResponse} from "@app/models/pagination.model";
import {IMessageDTO} from "../../Chat/models/api.models";

interface IThreadRouteParams {
    id: string;
}

@Injectable()
export class ThreadMessagesResolver extends BaseResolver<PaginationResponse<IMessageDTO>> {
    constructor(private _threadService: ChatApiService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
        Observable<PaginationResponse<IMessageDTO>> {
        const id = (route.params as IThreadRouteParams).id;

        return this._threadService.getThreadMessagesList(id)
            .pipe();
        // return forkJoin(
        //     this._threadService.getThreadById(id),
        //     this._threadService.getThreadMessagesList(id, params)
        // ).pipe(
        //         map((res: [IThread, IPaginationResponse<IThreadMessage>]) => {
        //             return {
        //                 thread: res[0],
        //                 data: res[1]
        //             };
        //         })
        //     );
    }
}
