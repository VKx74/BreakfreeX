import {Injectable} from "@angular/core";
import {forkJoin, Observable} from "rxjs";
import {BaseResolver} from "./base-resolver";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {ChatApiService} from "../../Chat/services/chat.api.service";
import {EThreadType, IThread, IThreadBan, IThreadParticipant} from "../../Chat/models/thread";
import {flatMap, map, tap} from "rxjs/operators";
import {ThreadResolverData} from "../data/models";
import {PaginationResponse, PaginationParams, IPaginationResponse} from "@app/models/pagination.model";
import {UsersProfileService} from "@app/services/users-profile.service";

export interface IThreadRouteParams {
    id: string;
}

@Injectable()
export class ThreadMembersResolver extends BaseResolver<ThreadResolverData<IPaginationResponse<IThreadParticipant>>> {
    constructor(private _threadService: ChatApiService, private _usersProfileService: UsersProfileService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ThreadResolverData<IPaginationResponse<IThreadParticipant>>> {
        const id = (route.params as IThreadRouteParams).id;

        return (this._threadService.getThreadById(id) as Observable<IThread>)
            .pipe(
                flatMap(thread => {
                    let obs = thread.type === EThreadType.Public ? this._getPublicThreadData(thread.id) : this._getPrivateThreadData(thread.id);

                    return forkJoin(this._threadService.getThreadAllBans(thread.id, PaginationParams.ALL()), obs)
                        .pipe(
                            map((res: [IThreadBan[], IPaginationResponse<IThreadParticipant>]) => {
                                const bans = res[0];
                                const data = new PaginationResponse<IThreadParticipant>(this.getMembersWithBanInfo(res[1].items, bans), res[1].total);
                                return {thread, bans, data};
                            }),
                        );
                }),
            );
    }

    getMembersWithBanInfo(members: { id?: string; subjectId?: string, [key: string]: any }[], bans: IThreadBan[]): IThreadParticipant[] {
        return members.map(member => {
            const memberId = member.subjectId || member.id;
            return {
                ...member,
                ban: bans.find(ban => ban.subjectId === memberId)
            } as IThreadParticipant;
        });
    }

    private _getPrivateThreadData(threadId: string): Observable<IPaginationResponse<IThreadParticipant>> {
        return this._threadService.getThreadParticipants(threadId);
    }

    private _getPublicThreadData(threadId: string): Observable<IPaginationResponse<IThreadParticipant>> {
        return this._threadService.getPublicThreadParticipants(threadId);
    }
}
