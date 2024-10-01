import {Injectable, Injector} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {EMPTY, forkJoin, interval, merge, Observable, of, throwError} from "rxjs";
import {AppConfigService} from "@app/services/app.config.service";
import {catchError, filter, flatMap, map, mapTo, mergeAll, switchMap, toArray} from "rxjs/operators";
import {IdentityService} from "@app/services/auth/identity.service";
import {
    EThreadSubjectRole,
    EThreadType,
    IThread,
    IThreadBan,
    IThreadBanContainer,
    IThreadBanCreate,
    IThreadBanUpdate,
    IThreadCreate,
    IThreadInvite,
    IThreadInviteCreate,
    IThreadMessagePublish,
    IThreadParticipant,
    IThreadUpdate,
    ThreadParticipant
} from "../models/thread";
import {Roles, UserProfileModel} from "@app/models/auth/auth.models";
import {UsersProfileService} from "@app/services/users-profile.service";
import {QueryParamsConstructor} from "../../Admin/data/models";
import {UsersService} from "@app/services/users.service";
import {
    CollectionResponseType,
    IDataPagingResponse,
    IPaginationResponse,
    PaginationParams,
    PaginationResponse,
    toBasePaginationResponse
} from "@app/models/pagination.model";
import {IThreadInvitePayload} from "@app/models/notifications/notification";
import {IMessageDTO, IThreadDTO} from "../models/api.models";
import {FileStorageService} from "@app/services/file-storage.service";
import {FileInfo} from "@app/models/storage/models";

export const DEFAULT_TAKE_COUNT = 25;

type WithUsers<T> = {
    [P in keyof T]: T[P]
} & {
    users:
        {
            items: { id: string, userName: string, avatarId?: string }[]
        }
};


@Injectable({
    providedIn: 'root'
})
export class ChatApiService {

    constructor(private _http: HttpClient,
                private _injector: Injector,
                private _identity: IdentityService,
                private _userService: UsersService,
                private _usersProfileService: UsersProfileService,
                private _fileStorage: FileStorageService) {
    }

    public deleteUserFromThread(threadId: string, userId: string): Observable<any> {
        return this._http.delete<Observable<any>>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/participation/user:${userId}`);
    }

    public getThreadsForPlatform(skip: number = 0, take: number = DEFAULT_TAKE_COUNT, search: string = '', type?: EThreadType): Observable<IDataPagingResponse<IThreadDTO>> {
        let params = new HttpParams()
            .append('Offset', skip.toString())
            .append('Limit', take.toString());

        if (search && search.trim()) {
            params = params.append('Search', search.trim());
        }
        if (type) {
            params = params.append('ThreadType', type.toString());
        }

        return this._http.get<WithUsers<IDataPagingResponse<IThreadDTO>>>(`${AppConfigService.config.apiUrls.socialChatREST}threads`, {params: params})
            .pipe(
                map((r) => {
                    return {
                        ...r,
                        data: r.data.map((thread) => {
                            if (!thread.lastMessage) {
                                return thread;
                            } else {
                                return {
                                    ...thread,
                                    lastMessage: {
                                        ...thread.lastMessage,
                                        creator: r.users.items.find(user => user.id === thread.lastMessage.fromId)
                                    }
                                };
                            }
                        })
                    } as IDataPagingResponse<IThreadDTO>;
                }),
                catchError(error => {
                    console.log('Failed to load thread list');
                    console.log(error);
                    return throwError(error);
                })
            );
    }

    public searchPublicThreads(query: string, take: number = DEFAULT_TAKE_COUNT): Observable<IThreadDTO[]> {
        return this.getThreadsForPlatform(0, take, query, EThreadType.Public)
            .pipe(
                map((resp) => {
                    return resp.data;
                })
            );
    }

    public searchGroupOrPrivateThreads(query: string, take: number = DEFAULT_TAKE_COUNT): Observable<IThreadDTO[]> {
        return this.getThreadsForPlatform(0, take, query, EThreadType.PrivateOrGroup)
            .pipe(
                map((resp) => {
                    return resp.data;
                })
            );
    }

    public getThreadById(id: string): Observable<IThreadDTO> {
        return this._http.get<IThreadDTO>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${id}`)
            .pipe(catchError(error => {
                console.log('Failed to load thread list');
                return throwError(error);
            }));
    }

    public getThreadsByIds(ids: string[]): Observable<IThreadDTO[]> {
        merge([interval(1000), interval(2000), interval(1000), interval(2000)]);
        return merge(ids.map(id => this.getThreadById(id)
            .pipe(
                catchError(() => of(null)),
            )))
            .pipe(
                mergeAll(),
                filter(d => !!d),
                toArray(),
            );
    }

    public getThreadLastMessage(threadId: string): Observable<IMessageDTO> {
        const params = new HttpParams()
            .append('Limit', '1');

        return this._http.get<WithUsers<IDataPagingResponse<IMessageDTO>>>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/messages`, {params})
            .pipe(
                map((resp) => {
                    return resp.data && resp.data.length
                        ? {...resp.data[0], creator: resp.users.items[0]} as IMessageDTO
                        : null;
                })
            );
    }

    public getThreadMessagesFromLastMessage(threadId: string, messageId: string, take: number = DEFAULT_TAKE_COUNT): Observable<IDataPagingResponse<IMessageDTO>> {
        const params = new HttpParams()
            .append('Limit', take.toString())
            .append('Id', messageId);

        return this._http.get<WithUsers<IDataPagingResponse<IMessageDTO>>>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/messages`, {params})
            .pipe(
                map((r) => {
                    return {
                        ...r,
                        data: r.data.map((item) => {
                            return {...item, creator: r.users.items.find(u => u.id === item.fromId)};
                        })
                    } as IDataPagingResponse<IMessageDTO>;
                })
            );
    }


    getAdminPanelPublicThreads(paginationParams = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IThread>> {
        return this._http.get<WithUsers<IDataPagingResponse<IThreadDTO>>>(`${AppConfigService.config.apiUrls.socialChatREST}threads/all`, {
            params: QueryParamsConstructor.fromObjects(paginationParams.toOffsetLimit(), filtrationParams)
        }).pipe(
            map((r) => {
                let threads: IThread[] = r.data.map((thread) => {
                    return {
                        ...thread,
                        creator: r.users.items.find(user => user.id === thread.creatorId)
                    } as IThread;
                });

                return new PaginationResponse(threads, r.paging.total);
            })
        );
    }

    getThreadMessagesList(threadId, params = new PaginationParams()): Observable<PaginationResponse<IMessageDTO>> {
        return this._http.get<WithUsers<IDataPagingResponse<IMessageDTO>>>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/messages`,
            {
                params: QueryParamsConstructor.fromObject(params.toOffsetLimit())
            }).pipe(
            map(r => {
                return new PaginationResponse(
                    r.data.map((item) => {
                        return {...item, creator: r.users.items.find(u => u.id === item.fromId)} as IMessageDTO;
                    }),
                    r.paging.total
                );
            })
        );
    }

    public createPublicThread(newThread: IThreadCreate): Observable<IThreadDTO> {
        return this._http.post<IThreadDTO>(`${AppConfigService.config.apiUrls.socialChatREST}threads/public`, newThread)
            .pipe(catchError(error => {
                console.log('Failed to create new public thread');
                return throwError(error);
            }));
    }

    public createGroupThread(newThread: IThreadCreate): Observable<IThreadDTO> {
        return this._http.post<IThreadDTO>(`${AppConfigService.config.apiUrls.socialChatREST}threads/group`, newThread)
            .pipe(catchError(error => {
                console.log('Failed to create new group thread');
                return throwError(error);
            }));
    }

    createThread(payload: IThreadCreate): Observable<IThreadDTO> {
        const photoFileInfo$ = payload.photo ?
            this._fileStorage.uploadImage(FileStorageService.fileToFormData(payload.photo))
                .pipe(
                    catchError((e) => {
                        console.error('failed to upload thread photo', e);
                        return throwError(e);
                    })
                )
            : of(null);

        const url = payload.threadType === EThreadType.Group
            ? `${AppConfigService.config.apiUrls.socialChatREST}threads/group`
            : `${AppConfigService.config.apiUrls.socialChatREST}threads/public`;


        return photoFileInfo$.pipe(
            switchMap((fileInfo?: FileInfo) => {
                return this._http.post<IThreadDTO>(url, {
                    name: payload.name,
                    description: payload.description,
                    pictureId: fileInfo ? fileInfo.id : null
                });
            })
        );
    }

    updateThread(threadId: string, payload: IThreadUpdate): Observable<IThreadDTO> {
        return forkJoin({
            fileInfo: payload.photo
                ? this._fileStorage.uploadImage(FileStorageService.fileToFormData(payload.photo))
                    .pipe(
                        switchMap((fileInfo: FileInfo) => {
                            return this.updateThreadPhoto(threadId, fileInfo.id)
                                .pipe(mapTo(fileInfo));
                        }),

                        catchError((e) => {
                            console.error('failed to upload thread photo', e);

                            return throwError(e);
                        })
                    )
                : of(null),

            thread: this._http.put<{ success: boolean }>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}`, {
                name: payload.name,
                description: payload.description
            })
                .pipe(catchError(error => {
                    console.log('Failed to edit public thread');
                    return throwError(error);
                }))
        })
            .pipe(
                switchMap(() => {
                    return this.getThreadById(threadId);
                })
            );
    }

    public publishThreadMessage(threadId: string, message: IThreadMessagePublish): Observable<IMessageDTO> {
        return this._http.post<WithUsers<IMessageDTO>>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/messages`, message)
            .pipe(
                map((r) => {
                    return {...r, creator: r.users.items[0]} as IMessageDTO;
                }),
                catchError(error => {
                    console.log('Failed to publish message');
                    return throwError(error);
                })
            );
    }

    public editThreadMessage(messageId: string, message: IThreadMessagePublish): Observable<IMessageDTO> {
        return this._http.put<WithUsers<IMessageDTO>>(`${AppConfigService.config.apiUrls.socialChatREST}message/${messageId}`, message)
            .pipe(
                map((r) => {
                    return {...r, creator: r.users.items[0]} as IMessageDTO;
                }),
                catchError(error => {
                    console.log('Failed to edit message ' + messageId);
                    return throwError(error);
                })
            );
    }

    public getThreadParticipants(threadId: string, params = new PaginationParams()): Observable<IPaginationResponse<IThreadParticipant>> {
        return this._http.get<WithUsers<IDataPagingResponse<IThreadParticipant>>>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/participants`, {
            params: QueryParamsConstructor.fromObject(params.toOffsetLimit())
        }).pipe(
            map((res) => {
                let participants = res.data.map((item) => {
                    return {
                        ...item,
                        userModel: res.users.items.find(u => u.id === item.subjectId)
                    };
                });

                return new PaginationResponse(participants, res.paging.total);
            })
        );
    }

    getPublicThreadParticipants(threadId: string, params?: PaginationParams, userName?: string): Observable<IPaginationResponse<IThreadParticipant>> {
        return this._usersProfileService.searchUsersProfileByUserName(userName ? userName : "", params)
            .pipe(
                flatMap(res => forkJoin(
                    of(res),
                    this.getThreadBansByThreadId(threadId, PaginationParams.ALL()))
                    .pipe(
                        catchError(() => EMPTY)
                    )
                ),
                map((res: [IPaginationResponse<UserProfileModel>, IPaginationResponse<IThreadBan>]) => {
                    const participants = res[0];
                    const bans = res[1];

                    return this._getMappedUserProfiles(threadId, participants, bans);
                }),
            );
    }

    public getMessageById(messageId: string): Observable<IMessageDTO> {
        return this._http.get<WithUsers<IMessageDTO>>(`${AppConfigService.config.apiUrls.socialChatREST}message/${messageId}`)
            .pipe(
                map((r) => {
                    return {...r, creator: r.users.items[0]} as IMessageDTO;
                }),
                catchError(error => {
                    console.log('Failed to load message ' + messageId);
                    return throwError(error);
                })
            );
    }

    public deleteMessageById(messageId: string): Observable<{ success: boolean }> {
        return this._http.delete<{ success: boolean }>(`${AppConfigService.config.apiUrls.socialChatREST}message/${messageId}`)
            .pipe(catchError(error => {
                console.log('Failed to delete message ' + messageId);
                return throwError(error);
            }));
    }

    public enableThreadById(threadId: string): Observable<{ success: boolean }> {
        return this._http.put<{ success: boolean }>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/enable`, null)
            .pipe(catchError(error => {
                console.log('Failed to enable thread ' + threadId);
                return throwError(error);
            }));
    }

    public disableThreadById(threadId: string): Observable<{ success: boolean }> {
        return this._http.put<{ success: boolean }>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/disable`, null)
            .pipe(catchError(error => {
                console.log('Failed to disable thread ' + threadId);
                return throwError(error);
            }));
    }

    public blockThreadById(threadId: string): Observable<{ success: boolean }> {
        return this._http.put<{ success: boolean }>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/block`, null)
            .pipe(catchError(error => {
                console.log('Failed to block thread ' + threadId);
                return throwError(error);
            }));
    }

    public unblockThreadById(threadId: string): Observable<{ success: boolean }> {
        return this._http.put<{ success: boolean }>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/unblock`, null)
            .pipe(catchError(error => {
                console.log('Failed to unblock thread ' + threadId);
                return throwError(error);
            }));
    }

    public restoreThreadById(threadId: string): Observable<{ success: boolean }> {
        return this._http.put<{ success: boolean }>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/restore`, null)
            .pipe(catchError(error => {
                console.log('Failed to restore thread ' + threadId);
                return throwError(error);
            }));
    }

    public deleteThreadById(threadId: string): Observable<IThreadDTO> {
        return this._http.delete<IThreadDTO>(`${AppConfigService.config.apiUrls.socialChatREST}threads/${threadId}`)
            .pipe(catchError(error => {
                console.log('Failed to delete thread ' + threadId);
                return throwError(error);
            }));
    }

    public getUserBanByThread(threadId: string, userId: string): Observable<IThreadBan> {
        return this._http.get<IThreadBan>(`${AppConfigService.config.apiUrls.socialChatREST}thread-bans/${threadId}/${userId}`);
    }

    getAdminOrCreatorBansByThreads(threadsIds: string[]): Observable<IThreadBanContainer[]> {
        return this._http.get<IThreadBanContainer[]>(`${AppConfigService.config.apiUrls.socialChatREST}thread-bans`, {
            params: QueryParamsConstructor.fromArray('threadIds', threadsIds)
        });
    }

    public createThreadBan(ban: IThreadBanCreate): Observable<IThreadBan> {
        return this._http.post<IThreadBan>(`${AppConfigService.config.apiUrls.socialChatREST}thread-bans`, ban)
            .pipe(catchError(error => {
                console.log('Failed to create thread ban ', ban);
                return throwError(error);
            }));
    }

    public getThreadBansByThreadId(threadId: string, paginationParams = new PaginationParams()): Observable<IPaginationResponse<IThreadBan>> {
        return this._http.get<IPaginationResponse<IThreadBan>>(`${AppConfigService.config.apiUrls.socialChatREST}thread-bans/${threadId}`,
            {
                params: QueryParamsConstructor.fromObject(paginationParams.toSkipTake())
            }).pipe(
            catchError(error => {
                console.log('Failed to get thread bans ' + threadId);
                return throwError(error);
            }),
            toBasePaginationResponse(CollectionResponseType.DataPaging)
        );
    }

    getThreadBanByUserId(threadId: string, userId: string): Observable<IThreadBan> {
        return this._http.get<IThreadBan>(`${AppConfigService.config.apiUrls.socialChatREST}thread-bans/${threadId}/${userId}`);
    }

    public getThreadAllBans(threadId: string, params?: object): Observable<IThreadBan[]> {
        return this._http.get<IDataPagingResponse<IThreadBan>>(`${AppConfigService.config.apiUrls.socialChatREST}thread-bans/${threadId}`, {
            params: QueryParamsConstructor.fromObject(params)
        })
            .pipe(catchError(error => {
                console.log('Failed to get thread bans ' + threadId);
                return throwError(error);
            }), map(res => res.data));
    }

    public updateThreadBanById(threadBanId: string, update: IThreadBanUpdate): Observable<IThreadBan> {
        return this._http.put<IThreadBan>(`${AppConfigService.config.apiUrls.socialChatREST}thread-bans/${threadBanId}`, update)
            .pipe(catchError(error => {
                console.log('Failed to update thread ban ' + threadBanId, update);
                return throwError(error);
            }));
    }

    public deleteThreadBanById(threadBanId: string): Observable<IThreadBan> {
        return this._http.delete<IThreadBan>(`${AppConfigService.config.apiUrls.socialChatREST}thread-bans/${threadBanId}`)
            .pipe(catchError(error => {
                console.log('Failed to delete thread ban ' + threadBanId);
                return throwError(error);
            }));
    }

    // public getBansViewModel(threadId: string): Observable<ThreadUsersViewModel[]> {
    //     // TODO need pagination for users
    //     return this._usersProfileService.getAllUsersProfiles()
    //         .pipe(toBasePaginationResponse(CollectionResponseType.ItemsTotal),
    //             switchMap(usersProfileModel => this._mapThreadBans(threadId, usersProfileModel.items)));
    // }
    //
    // public searchBansViewModel(threadId: string, query: string): Observable<ThreadUsersViewModel[]> {
    //     // TODO need pagination for users
    //     return this._usersProfileService.searchUsersProfileByUserName(query)
    //         .pipe(
    //             toBasePaginationResponse(CollectionResponseType.ItemsTotal),
    //             switchMap(usersProfileModel => this._mapThreadBans(threadId, usersProfileModel.items))
    //         );
    // }
    //
    // public getBansViewModelForGroups(threadId: string, userIds: string[]): Observable<ThreadUsersViewModel[]> {
    //     // TODO need pagination for users
    //     return this._usersProfileService.getUsersProfilesByIds(userIds)
    //         .pipe(switchMap(usersProfileModel => this._mapThreadBans(threadId, usersProfileModel ? usersProfileModel.items : [])));
    // }
    //
    // public searchBansViewModelForGroups(threadId: string, query: string, userIds: string[]): Observable<ThreadUsersViewModel[]> {
    //     // TODO need pagination for users
    //     return this._usersProfileService.getUsersProfilesByIds(userIds)
    //         .pipe(map(users => {
    //             return users;
    //         }), switchMap(usersProfileModel => this._mapThreadBans(threadId, usersProfileModel.items)));
    // }

    public getThreadInvites(threadId: string): Observable<IThreadInvitePayload[]> {
        return this._http.get<IDataPagingResponse<IThreadInvitePayload>>(`${AppConfigService.config.apiUrls.socialChatREST}thread-invites/${threadId}`)
            .pipe(
                toBasePaginationResponse(CollectionResponseType.DataPaging),
                map((resp) => {
                    return resp.items;
                })
            );
    }

    public getThreadInvitesForCurrentUser(skip: number = 0, take: number = DEFAULT_TAKE_COUNT): Observable<PaginationResponse<IThreadInvitePayload>> {
        const params = new HttpParams()
            .append('Limit', take.toString())
            .append('Offset', skip.toString());

        return this._http.get<WithUsers<IDataPagingResponse<IThreadInvitePayload>>>(`${AppConfigService.config.apiUrls.socialChatREST}thread-invites`, {params: params})
            .pipe(
                map((r) => {
                    return new PaginationResponse(
                        r.data.map((item) => {
                            return {
                                ...item,
                                creator: r.users.items.find(u => u.id === item.threadInvite.inviteCreatorId)
                            };
                        }),
                        r.paging.total
                    );
                }),
                catchError(error => {
                    console.log('Failed to get invites for current user ' + this._identity.id);
                    return throwError(error);
                }));
    }

    public createThreadInvite(inviteModel: IThreadInviteCreate): Observable<IThreadInvite> {
        return this._http.post<IThreadInvite>(`${AppConfigService.config.apiUrls.socialChatREST}thread-invites`, inviteModel)
            .pipe(catchError(error => {
                console.log('Failed to crate thread invite', inviteModel);
                return throwError(error);
            }));
    }

    public inviteMembersByIds(threadId: string, ids: string[]): Observable<IThreadInvite[]> {
        return forkJoin(
            ids.map(id => this.createThreadInvite({
                threadId,
                subjectId: id
            }))
        );
    }

    public deleteThreadInviteById(inviteId: string): Observable<IThreadInvite> {
        return this._http.delete<IThreadInvite>(`${AppConfigService.config.apiUrls.socialChatREST}thread-invites/${inviteId}`)
            .pipe(catchError(error => {
                console.log('Failed to delete thread invite' + inviteId);
                return throwError(error);
            }));
    }

    public acceptThreadInvite(inviteId: string): Observable<IThreadInvite> {
        return this._http.put<IThreadInvite>(`${AppConfigService.config.apiUrls.socialChatREST}thread-invites/${inviteId}/accept`, null)
            .pipe(catchError(error => {
                console.log('Failed to accept thread invite' + inviteId);
                return throwError(error);
            }));
    }

    public rejectThreadInvite(inviteId: string): Observable<IThreadInvite> {
        return this._http.put<IThreadInvite>(`${AppConfigService.config.apiUrls.socialChatREST}thread-invites/${inviteId}/reject`, null)
            .pipe(catchError(error => {
                console.log('Failed to reject thread invite' + inviteId);
                return throwError(error);
            }));
    }

    // private _mapThreadBans(threadId: string, users: UserProfileModel[]) {
    //     return this.getThreadBansByThreadId(threadId, new PaginationParams(0, users.length))
    //         .pipe(
    //             map(bans => {
    //                 let banVm: ThreadUsersViewModel[] = [];
    //                 for (let user of users) {
    //                     banVm.push({
    //                         user: user,
    //                         ban: bans.items.find(ban => ban.subjectId === user.id)
    //                     });
    //                 }
    //                 return banVm;
    //             })
    //         );
    // }

    private _getMappedUserProfiles(threadId: string, participants: IPaginationResponse<UserProfileModel>, bans: IPaginationResponse<IThreadBan>) {
        const mappedUserProfiles = participants.items.map(participant => {
            const threadParticipant = new ThreadParticipant(participant.id, threadId,
                participant.role === Roles.Admin ? EThreadSubjectRole.Admin : EThreadSubjectRole.User);

            threadParticipant.userModel = participant;
            threadParticipant.ban = bans.items.find(ban => ban.subjectId === participant.id);

            return threadParticipant;
        });
        return new PaginationResponse(mappedUserProfiles, participants.total);
    }

    updateThreadPhoto(threadId: string, photoId: string): Observable<any> {
        return this._http.put<IThreadInvite>(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/picture/${photoId}`, null)
            .pipe(catchError(error => {
                console.error(error);
                return throwError(error);
            }));
    }

    removeUserFromThread(threadId: string, userId: string): Observable<any> {
        return this._http.delete(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/participation/user:${userId}`, null);
    }

    leaveThread(threadId: string): Observable<any> {
        return this._http.delete(`${AppConfigService.config.apiUrls.socialChatREST}thread/${threadId}/participation`);
    }
}
