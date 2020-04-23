import {Injectable} from "@angular/core";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {catchError, filter, flatMap, map, mapTo, switchMap, takeUntil, tap} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {AppState} from "@app/store/reducer";
import {ChatApiService, DEFAULT_TAKE_COUNT} from "../../services/chat.api.service";
import {EMPTY, forkJoin, of, throwError} from "rxjs";
import {EThreadType} from "../../models/thread";
import {IDataPagingResponse, IPaginationResponse} from "@app/models/pagination.model";
import {IMessageDTO, IThreadDTO} from "../../models/api.models";
import {UserProfileModel} from "@app/models/auth/auth.models";
import {UsersService} from "@app/services/users.service";
import {UsersProfileService} from "@app/services/users-profile.service";
import {IMessage} from "../../models/models";
import {IdentityService} from "@app/services/auth/identity.service";
import {NotificationService} from "@app/services/notification.service";
import {
    CancelThreadsSearch,
    CancelThreadsSearchCleanup,
    CreateThreadRequest,
    CreateThreadRequestFailed,
    CreateThreadRequestSuccess,
    LoadChatInitialData,
    LoadChatInitialDataFailed,
    LoadChatInitialDataSuccess,
    LoadMoreMessagesRequest,
    LoadMoreMessagesRequestSuccess,
    LoadMoreThreadsRequest,
    LoadMoreThreadsRequestFailed,
    LoadMoreThreadsRequestSuccess,
    LoadThreadMessages,
    LoadThreadMessagesFailed,
    LoadThreadMessagesSuccess,
    RemoteMessageReceived,
    RemoteMessageRemoved,
    RemoveMessageRequest,
    RemoveMessageRequestFailed,
    RemoveMessageRequestSuccess,
    RemoveMessages,
    ResendMessageRequest,
    ResendMessageRequestFailed,
    ResendMessageRequestSuccess,
    SearchThreadsRequest,
    SearchThreadsRequestSuccess,
    SendMessageRequest,
    SendMessageRequestFailed,
    SendMessageRequestSuccess,
    SortThreads,
    ThreadCreated,
    ThreadLastMessageChanged,
    ThreadRemoved,
    ThreadRestored,
    ThreadUpdated,
    UpdateMessageRequest,
    UpdateMessageRequestFailed,
    UpdateMessageRequestSuccess,
    UpdateThreadRequest,
    UpdateThreadRequestFailed,
    UpdateThreadRequestSuccess
} from "../actions";
import {FileStorageService} from "@app/services/file-storage.service";
import {FileInfo} from "@app/models/storage/models";
import {ChatHelperService} from "../../services/chat-helper.service";
import {ChatInstanceAction} from "../reducers";
import {ChatMode} from "../../enums/chat-mode";

@Injectable()
export class ChatEffects {
    constructor(private actions$: Actions,
                private _usersService: UsersService,
                private _userProfileService: UsersProfileService,
                private _chatApiService: ChatApiService,
                private _store: Store<AppState>,
                private _identityService: IdentityService,
                private _notificationService: NotificationService,
                private _fileStorage: FileStorageService,
                private _helper: ChatHelperService) {
    }

    @Effect({dispatch: false})
    loadChatInitialData = this.actions$.pipe(
        ofType(LoadChatInitialData),
        flatMap(({chatInstanceKey, chatMode}) => {
            return this._loadChatInitialData(chatMode === ChatMode.PublicThreads ? EThreadType.Public : EThreadType.PrivateOrGroup)
                .pipe(
                    tap(({threads, messages}) => {
                        this._store.dispatch(LoadChatInitialDataSuccess({
                            threads: threads,
                            messages: messages,
                            chatInstanceKey
                        }));
                    }),
                    catchError((e) => {
                        console.error(e);

                        this._store.dispatch(LoadChatInitialDataFailed({
                            error: e,
                            chatInstanceKey: chatInstanceKey
                        }));

                        return of(null);
                    })
                );
        })
    );


    @Effect({dispatch: false})
    loadThreadMessages = this.actions$.pipe(
        ofType(LoadThreadMessages),
        flatMap(({threadId, chatInstanceKey}) => {
            return this._chatApiService.getThreadMessagesList(threadId)
                .pipe(
                    catchError((e) => {
                        console.error(e);
                        this._store.dispatch(LoadThreadMessagesFailed({
                            error: e,
                            chatInstanceKey
                        }));

                        return EMPTY;
                    }),
                    map((resp: IPaginationResponse<IMessageDTO>) => {
                        return resp.items;
                    }),
                    flatMap((messages: IMessageDTO[]) => {
                        return forkJoin({
                            messages: this._helper.convertToIMessages(messages),
                            threadId: threadId
                        });
                    }),
                    tap((result: { messages: IMessage[], threadId: string }) => {
                        this._store.dispatch(LoadThreadMessagesSuccess({
                            messages: result.messages,
                            threadId: result.threadId,
                            chatInstanceKey
                        }));
                    }),
                    takeUntil(
                        this.actions$.pipe(
                            ofType(LoadThreadMessages),
                            filter(({threadId: t, chatInstanceKey: key}) => {
                                return t === threadId && chatInstanceKey === key;
                            })
                        )
                    )
                );
        })
    );

    @Effect({dispatch: false})
    sendMessage = this.actions$.pipe(
        ofType(SendMessageRequest),
        flatMap(({message, chatInstanceKey}) => {
            return this._chatApiService.publishThreadMessage(
                message.threadId,
                {
                    content: message.content,
                    files: message.files,
                    clientId: message.id
                }
            ).pipe(
                flatMap((messageDto: IMessage) => {
                    const threadFromStore = this._helper.getThreadEnitity(messageDto.threadId);

                    return forkJoin({
                        localMessageId: of(message.id),
                        message: this._helper.convertToIMessage(messageDto),
                        thread: threadFromStore
                            ? of(threadFromStore)
                            : this._chatApiService.getThreadById(messageDto.threadId)
                    });
                }),
                catchError((e) => {
                    console.error(e);

                    this._store.dispatch(SendMessageRequestFailed({
                        threadId: message.threadId,
                        messageId: message.id,
                        error: e,
                        chatInstanceKey
                    }));

                    return EMPTY;
                })
            );
        }),
        tap((result) => {
            this._store.dispatch(SendMessageRequestSuccess({
                message: result.message,
                thread: result.thread,
                localMessageId: result.localMessageId
            }));
        })
    );

    @Effect({dispatch: false})
    resendMessage = this.actions$.pipe(
        ofType(ResendMessageRequest),
        flatMap(({messageId, threadId, content, files, chatInstanceKey}) => {
            const storedThread = this._helper.getThreadEnitity(threadId);

            return forkJoin({
                message: this._chatApiService.publishThreadMessage(threadId, {
                    content: content,
                    files: files,
                    clientId: messageId
                }).pipe(flatMap((dto) => this._helper.convertToIMessage(dto))),
                thread: storedThread ? of(storedThread) : this._chatApiService.getThreadById(threadId)
            })
                .pipe(
                    tap(({message, thread}) => {
                        this._store.dispatch(ResendMessageRequestSuccess({
                            thread: thread,
                            message: message,
                            localMessageId: messageId
                        }));
                    }),
                    catchError((e) => {
                        console.error(e);

                        this._store.dispatch(ResendMessageRequestFailed({
                            threadId: threadId,
                            messageId: messageId,
                            error: e,
                            chatInstanceKey
                        }));

                        return of(null);
                    })
                );
        })
    );


    @Effect({dispatch: false})
    updateMessage = this.actions$.pipe(
        ofType(UpdateMessageRequest),
        flatMap(({messageId, content, files, chatInstanceKey}) => {
            return this._chatApiService.editThreadMessage(messageId, {
                content: content,
                files: files
            })
                .pipe(
                    flatMap((message: IMessageDTO) => {
                        return this._helper.convertToIMessage(message);
                    }),
                    catchError((e) => {
                        console.error(e);

                        this._store.dispatch(UpdateMessageRequestFailed({
                            messageId: messageId,
                            error: e,
                            chatInstanceKey
                        }));

                        return EMPTY;
                    })
                );
        }),
        tap((message: IMessage) => {
            this._store.dispatch(UpdateMessageRequestSuccess({
                messageId: message.id,
                message: message
            }));
        })
    );

    @Effect({dispatch: false})
    removeMessage = this.actions$.pipe(
        ofType(RemoveMessageRequest),
        flatMap(({threadId, messageId, chatInstanceKey}) => {
            return this._chatApiService.deleteMessageById(messageId)
                .pipe(
                    catchError((e) => {
                        console.error(e);

                        this._store.dispatch(RemoveMessageRequestFailed({
                            messageId: messageId,
                            error: e,
                            chatInstanceKey
                        }));

                        return EMPTY;
                    }),
                    flatMap(() => {
                        return this._chatApiService.getThreadLastMessage(threadId)
                            .pipe(
                                flatMap((dto) => dto ? this._helper.convertToIMessage(dto) : of(null)),
                                catchError((e) => {
                                    console.log('failed to load last thread message', e);
                                    return of(null);
                                })
                            );
                    }),
                    tap((lastMessage: IMessage) => {
                        this._store.dispatch(RemoveMessageRequestSuccess({
                            messageId,
                            threadId,
                            lastThreadMessage: lastMessage
                        }));
                    })
                );
        })
    );

    @Effect({dispatch: false})
    createThread = this.actions$.pipe(
        ofType(CreateThreadRequest),
        flatMap(({threadName, description, photo, chatInstanceKey, chatMode}) => {
            return this._chatApiService.createThread({
                name: threadName,
                description: description,
                photo: photo,
                threadType: chatMode === ChatMode.PublicThreads ? EThreadType.Public : EThreadType.Group
            }).pipe(
                catchError((e) => {
                    console.error(e);
                    this._store.dispatch(CreateThreadRequestFailed({error: e, chatInstanceKey}));

                    return EMPTY;
                }),
                tap((thread: IThreadDTO) => {
                    this._store.dispatch(CreateThreadRequestSuccess({thread}));
                })
            );
        })
    );

    @Effect({dispatch: false})
    updateThread = this.actions$.pipe(
        ofType(UpdateThreadRequest),
        flatMap(({threadId, threadName, description, photo, chatInstanceKey, threadType}) => {
            return this._chatApiService.updateThread(threadId, {
                name: threadName,
                description: description,
                photo: photo
            })
                .pipe(
                    catchError((e) => {
                        console.error(e);
                        this._store.dispatch(UpdateThreadRequestFailed({
                            error: e,
                            threadId: threadId,
                            chatInstanceKey
                        }));

                        return EMPTY;
                    }),
                    tap((thread: IThreadDTO) => {
                        this._store.dispatch(UpdateThreadRequestSuccess({
                            threadId: threadId,
                            name: threadName,
                            description: description,
                            photoId: thread.pictureId,
                            threadType: threadType
                        }));
                    })
                );
        })
    );

    @Effect({dispatch: false})
    sortThreads = this.actions$.pipe(
        ofType(
            SendMessageRequest,
            RemoteMessageReceived,
            RemoteMessageRemoved,
            CreateThreadRequestSuccess,
            ThreadCreated,
            ThreadRemoved,
            RemoveMessages,
            ThreadRestored,
            ThreadLastMessageChanged,
            ThreadUpdated
        ),
        tap((action) => {
            const chatInstanceKey = (action as ChatInstanceAction).chatInstanceKey;

            if (chatInstanceKey != null) {
                const messagesState = this._helper.getMessagesState(chatInstanceKey);
                this._store.dispatch(SortThreads({messagesState: messagesState, chatInstanceKey}));
            } else {
                this._helper.getAllChatsKeys()
                    .forEach((chatKey: string) => {
                        this._store.dispatch(SortThreads({
                            messagesState: this._helper.getMessagesState(chatKey),
                            chatInstanceKey: chatKey
                        }));
                    });
            }
        })
    );

    @Effect({dispatch: false})
    cancelSearchCleanup = this.actions$.pipe(
        ofType(CancelThreadsSearch),
        tap(({chatInstanceKey}) => {
            const threadsState = this._helper.getThreadsState(chatInstanceKey);
            const commonState = this._helper.getCommonState(chatInstanceKey);
            const messagesState = this._helper.getMessagesState(chatInstanceKey);

            if (!threadsState.searchedThreads) {
                return;
            }

            const threadsToRemove = threadsState.searchedThreads.filter((id) => {
                if (commonState.selectedThreadId != null && commonState.selectedThreadId === id) {
                    return false;
                }

                return !threadsState.threads.includes(id);
            });

            this._store.dispatch(CancelThreadsSearchCleanup({
                threadsToRemove: threadsToRemove,
                chatInstanceKey
            }));
        })
    );


    @Effect({dispatch: false})
    loadMoreMessages = this.actions$.pipe(
        ofType(
            LoadMoreMessagesRequest
        ),
        flatMap(({threadId, messageId, chatInstanceKey}) => {
            return this._chatApiService.getThreadMessagesFromLastMessage(threadId, messageId, DEFAULT_TAKE_COUNT + 1)
                .pipe(
                    flatMap((resp: IDataPagingResponse<IMessageDTO>) => {
                        return forkJoin({
                            messages: resp.data.length ? this._helper.convertToIMessages(resp.data) : of([]),
                            moreMessagesEnabled: of(resp.data.length > DEFAULT_TAKE_COUNT)
                        });
                    }),
                    tap((result: { users: UserProfileModel[], messages: IMessage[], moreMessagesEnabled: boolean }) => {
                        this._store.dispatch(LoadMoreMessagesRequestSuccess({
                            threadId: threadId,
                            messages: result.messages,
                            moreMessagesEnabled: result.moreMessagesEnabled,
                            chatInstanceKey
                        }));
                    })
                );
        })
    );

    @Effect({dispatch: false})
    loadMoreThreads = this.actions$.pipe(
        ofType(
            LoadMoreThreadsRequest
        ),
        flatMap(({lastThreadId, skip, chatMode, chatInstanceKey}) => {
            const threadType = chatMode === ChatMode.PublicThreads
                ? EThreadType.Public
                : EThreadType.PrivateOrGroup;

            return this._chatApiService.getThreadsForPlatform(skip, DEFAULT_TAKE_COUNT + 1, '', threadType)
                .pipe(
                    flatMap((resp: IDataPagingResponse<IThreadDTO>) => {
                        return forkJoin({
                            threads: resp.data ? of(resp.data) : of([]),
                            messages: resp.data
                                ? this._helper.convertToIMessages(resp.data.filter(t => t.lastMessage != null).map(i => i.lastMessage))
                                : of([]),
                            moreThreadsEnabled: of(resp.data && resp.data.length > DEFAULT_TAKE_COUNT)
                        });
                    }),
                    tap(({threads, messages, moreThreadsEnabled}) => {
                        this._store.dispatch(LoadMoreThreadsRequestSuccess({
                            threads: threads,
                            messages: messages,
                            moreThreadsEnabled: moreThreadsEnabled,
                            chatInstanceKey
                        }));
                    }),
                    catchError((e) => {
                        this._store.dispatch(LoadMoreThreadsRequestFailed({
                            error: e,
                            chatInstanceKey
                        }));

                        return EMPTY;
                    })
                );
        })
    );

    @Effect({dispatch: false})
    searchThreads = this.actions$.pipe(
        ofType(
            SearchThreadsRequest
        ),
        flatMap(({query, chatInstanceKey, chatMode}) => {
            const apiCall = chatMode === ChatMode.PublicThreads
                ? this._chatApiService.searchPublicThreads.bind(this._chatApiService)
                : this._chatApiService.searchGroupOrPrivateThreads.bind(this._chatApiService);

            return apiCall(query, 100)
                .pipe(
                    flatMap((threads: IThreadDTO[]) => {
                        if (threads.length === 0) {
                            return forkJoin({
                                messages: of([]),
                                threads: of([]),
                                query: of(query)
                            });
                        }

                        const messages = threads.filter(t => t.lastMessage != null).map(t => t.lastMessage);

                        return forkJoin({
                            messages: messages.length ? this._helper.convertToIMessages(messages) : of([]),
                            threads: of(threads),
                            query: of(query)
                        });
                    }),
                    tap(({messages, threads, query: q}) => {
                        this._store.dispatch(SearchThreadsRequestSuccess({
                            messages,
                            threads,
                            query: q,
                            chatInstanceKey: chatInstanceKey
                        }));
                    }),
                    takeUntil(
                        this.actions$.pipe(ofType(CancelThreadsSearch), filter(({chatInstanceKey: key}) => {
                            return key === chatInstanceKey;
                        }))
                    )
                );
        })
    );

    private _loadChatInitialData(threadType: EThreadType) {
        return this._chatApiService.getThreadsForPlatform(0, 30, '', threadType)
            .pipe(
                switchMap((resp: IDataPagingResponse<IThreadDTO>) => {
                    const threads = resp.data;
                    const messages = threads.filter(t => t.lastMessage != null).map(t => t.lastMessage);

                    return forkJoin({
                        threads: of(resp.data),
                        messages: messages.length ? this._helper.convertToIMessages(messages) : of([])
                    });
                })
            );
    }
}
