import {Inject, Injectable} from "@angular/core";
import {ChatInstanceAction, State} from "../store/reducers";
import {Action, Store} from "@ngrx/store";
import {Actions, ofType} from "@ngrx/effects";
import {merge, Observable, Subject, throwError} from "rxjs";
import {filter, first, flatMap, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {EThreadType, IFileInfo, IThreadBan} from "../models/thread";
import {
    CancelThreadsSearch,
    CreateChatInstance,
    CreateThreadRequest,
    CreateThreadRequestFailed,
    CreateThreadRequestSuccess,
    DestroyChatInstance,
    LoadMoreMessagesRequest,
    LoadMoreMessagesRequestFailed,
    LoadMoreMessagesRequestSuccess,
    LoadChatInitialData,
    LoadChatInitialDataFailed,
    LoadChatInitialDataSuccess,
    LoadThreadMessages,
    LoadThreadMessagesFailed,
    LoadThreadMessagesSuccess,
    MarkMessagesAsRead,
    RemoveMessageRequest,
    RemoveMessageRequestSuccess,
    RemoveMessages,
    ResendMessageRequest,
    ResendMessageRequestFailed,
    ResendMessageRequestSuccess,
    SearchThreadsRequest,
    SearchThreadsRequestFailed,
    SearchThreadsRequestSuccess,
    SelectThread,
    SendMessageRequest,
    UpdateMessageRequest,
    UpdateMessageRequestFailed,
    UpdateMessageRequestSuccess,
    UpdateThreadRequest,
    UpdateThreadRequestFailed,
    UpdateThreadRequestSuccess,
    LoadMoreThreadsRequest,
    LoadMoreThreadsRequestFailed,
    LoadMoreThreadsRequestSuccess,
    CurrentUserLeavedThread, ThreadRemoved
} from "../store/actions";
import {ObservableUtils} from "../../../utils/observable.utils";
import {IMessage} from "../models/models";
import {MessageSendingStatus} from "../enums/message-sending-status";
import {IThreadDTO} from "../models/api.models";
import {ChatInstanceKeyToken} from "../chat-instance-key.token";
import {ChatHelperService} from "./chat-helper.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {ChatMode} from "../enums/chat-mode";
import {ChatModeToken} from "../mode.token";
import {JsUtil} from "../../../utils/jsUtil";
import {ChatApiService} from "./chat.api.service";

@Injectable()
export class FacadeService {
    selectedThread$: Observable<IThreadDTO>;
    selectedThreadId$: Observable<string>;
    threads$: Observable<IThreadDTO[]>;
    searchedThreads$: Observable<IThreadDTO[]>;
    selectedThreadMessages$: Observable<IMessage[]>;

    actions$: Observable<Action>;

    constructor(private _store: Store<State>,
                private _actions: Actions,
                @Inject(ChatInstanceKeyToken) private _instanceKey: string,
                private _helper: ChatHelperService,
                private _identityService: IdentityService,
                private _chatApiService: ChatApiService,
                @Inject(ChatModeToken) private _chatMode: ChatMode) {

        this.createChatInstanceState();

        this.selectedThread$ = this._helper.selectedThreadSelector(this._instanceKey);
        this.selectedThreadId$ = this.selectedThread$.pipe(map(thread => thread ? thread.id : null));
        this.threads$ = this._helper.threadsSelector(this._instanceKey);
        this.searchedThreads$ = this._helper.searchedThreadsSelector(this._instanceKey);
        this.selectedThreadMessages$ = this._helper.selectedThreadMessagesSelector(this._instanceKey);

        this.actions$ = this._actions
            .pipe(
                filter((action: Action) => {
                    const chatInstanceKey = (action as ChatInstanceAction).chatInstanceKey;

                    if (chatInstanceKey != null) {
                        return this._instanceKey === chatInstanceKey;
                    }

                    return true;
                })
            );
    }

    loadInitialData(): Observable<any> {
        return new Observable((observer) => {
            this._store.dispatch(LoadChatInitialData({chatInstanceKey: this._instanceKey, chatMode: this._chatMode}));

            merge(
                this.actions$.pipe(ofType(LoadChatInitialDataSuccess)),
                this.actions$.pipe(ofType(LoadChatInitialDataFailed))
                    .pipe(
                        switchMap(() => throwError(null))
                    )
            ).pipe(
                first()
            )
                .subscribe(observer);
        });
    }

    loadThreadMessages(threadId: string): Observable<any> {
        return new Observable((observer) => {
            this._store.dispatch(LoadThreadMessages({threadId: threadId, chatInstanceKey: this._instanceKey}));

            merge(
                this.actions$.pipe(ofType(LoadThreadMessagesSuccess)),
                this.actions$.pipe(ofType(LoadThreadMessagesFailed))
                    .pipe(
                        switchMap(() => throwError(null))
                    )
            ).pipe(
                first()
            )
                .subscribe(observer);
        });
    }

    loadBans(threadId: string): Observable<IThreadBan[]> {
        return this._chatApiService.getThreadBansByThreadId(threadId)
            .pipe(
                map((_) => {
                    return _.items;
                })
            );
    }

    sendMessage(content: string, files: IFileInfo[] = [], threadId: string): Observable<any> {
        return new Observable((observer) => {
            const message = this._helper.createCurrentUserMessage(content, files);

            message.threadId = threadId;
            message.fromId = this._identityService.id;
            message.sendingState = MessageSendingStatus.Pending;

            this._store.dispatch(SendMessageRequest({message: message, chatInstanceKey: this._instanceKey}));

            observer.next();
            observer.complete();
        });
    }

    resendMessage(message: IMessage): Observable<any> {
        return new Observable<any>((observer) => {
            this._store.dispatch(ResendMessageRequest({
                messageId: message.id,
                threadId: message.threadId,
                content: message.content,
                files: message.files,
                chatInstanceKey: this._instanceKey
            }));

            merge(
                this._actions.pipe(
                    ofType(ResendMessageRequestSuccess),
                    filter(({localMessageId}) => localMessageId === message.id)
                ),
                this._actions.pipe(
                    ofType(ResendMessageRequestFailed),
                    filter(({messageId}) => messageId === message.id),
                    flatMap(({error}) => {
                        return throwError(error);
                    })
                )
            )
                .pipe(first())
                .subscribe(observer);
        });
    }

    updateMessage(content: string, files: IFileInfo[], messageId: string, threadId: string): Observable<any> {
        return new Observable((observer) => {
            this._store.dispatch(UpdateMessageRequest({
                content: content,
                files: files,
                messageId: messageId,
                threadId: threadId,
                chatInstanceKey: this._instanceKey
            }));

            merge(
                this.actions$.pipe(
                    ofType(UpdateMessageRequestSuccess),
                    filter(({messageId: m}) => {
                        return m === messageId;
                    })
                ),
                this.actions$.pipe(
                    ofType(UpdateMessageRequestFailed),
                    filter(({messageId: m}) => {
                        return m === messageId;
                    }),
                    flatMap(({error}) => {
                        return throwError(error);
                    })
                )
            )
                .pipe(first())
                .subscribe(observer);
        });
    }

    removeMessage(messageId: string, threadId: string): Observable<any> {
        return new Observable((observer) => {
            const message = this._getMessageFromStore(messageId);

            if (message.sendingState === MessageSendingStatus.Failed) {
                this._removeMessageLocally(messageId, threadId);
                observer.next();
                observer.complete();

                return;
            }

            this._store.dispatch(RemoveMessageRequest({
                messageId,
                threadId,
                chatInstanceKey: this._instanceKey
            }));

            merge(
                this.actions$.pipe(
                    ofType(RemoveMessageRequestSuccess),
                    filter(({messageId: m}) => {
                        return m === messageId;
                    })
                ),
                this.actions$.pipe(
                    ofType(UpdateMessageRequestFailed),
                    filter(({messageId: m}) => {
                        return m === messageId;
                    }),
                    flatMap(({error}) => {
                        return throwError(error);
                    })
                )
            )
                .pipe(first())
                .subscribe(observer);
        });
    }

    private _removeMessageLocally(messageId: string, threadId: string) {
        this._store.dispatch(RemoveMessages({
            data: [{
                messageId: messageId,
                threadId: threadId
            }],
            chatInstanceKey: this._instanceKey
        }));
    }

    createThread(threadName: string, description?: string, photo?: File): Observable<any> {
        return new Observable<any>((observer) => {
            this._store.dispatch(CreateThreadRequest({
                threadName,
                description,
                photo,
                chatMode: this._chatMode,
                chatInstanceKey: this._instanceKey
            }));

            merge(
                this.actions$.pipe(
                    ofType(CreateThreadRequestSuccess),
                    filter(({thread}) => thread.name === threadName) // temp
                ),
                this.actions$.pipe(
                    ofType(CreateThreadRequestFailed),
                    flatMap(({error}) => throwError(error))
                )
            )
                .pipe(first())
                .subscribe(observer);
        });
    }

    updateThread(threadId: string, threadName: string, description?: string, photo?: File): Observable<any> {
        return new Observable<any>((observer) => {
            this._store.dispatch(UpdateThreadRequest({
                threadId,
                threadName,
                description,
                photo,
                threadType: this._chatMode === ChatMode.PublicThreads ? EThreadType.Public : EThreadType.Group,
                chatInstanceKey: this._instanceKey
            }));

            merge(
                this.actions$.pipe(
                    ofType(UpdateThreadRequestSuccess),
                    filter(({threadId: t}) => threadId === t)
                ),
                this.actions$.pipe(
                    ofType(UpdateThreadRequestFailed),
                    flatMap(({error}) => throwError(error))
                )
            )
                .pipe(first())
                .subscribe(observer);
        });
    }

    searchPublicThreads(query: string): Observable<any> {
        return new Observable<any>((observer) => {
            const unsubscribe$ = new Subject();

            this._store.dispatch(SearchThreadsRequest({
                query,
                chatMode: this._chatMode,
                chatInstanceKey: this._instanceKey
            }));

            merge(
                this.actions$.pipe(
                    ofType(SearchThreadsRequestSuccess)
                ),
                this.actions$.pipe(
                    ofType(SearchThreadsRequestFailed),
                    flatMap(({error}) => throwError(error))
                )
            )
                .pipe(
                    first(),
                    takeUntil(unsubscribe$)
                )
                .subscribe(observer);

            return () => {
                unsubscribe$.next();
                unsubscribe$.complete();
            };
        });
    }

    markThreadMessagesAsRead(threadId: string, ids: string[]) {
        this._store.dispatch(MarkMessagesAsRead({threadId, messagesIds: ids}));
    }

    loadMoreThreadMessages(threadId: string): Observable<boolean> {
        return new Observable<any>((observer) => {
            const messagesState = this._helper.getMessagesState(this._instanceKey);
            const fromMessageId = messagesState.messagesToThread[threadId]
                ? (messagesState.messagesToThread[threadId].ids as string[])[0]
                : '';

            this._store.dispatch(LoadMoreMessagesRequest({
                threadId,
                messageId: fromMessageId,
                count: 30,
                chatInstanceKey: this._instanceKey
            }));

            merge(
                this.actions$.pipe(
                    ofType(LoadMoreMessagesRequestSuccess),
                    map(({moreMessagesEnabled}) => {
                        return moreMessagesEnabled;
                    })
                ),
                this.actions$.pipe(
                    ofType(LoadMoreMessagesRequestFailed),
                    flatMap(({error}) => throwError(error))
                )
            )
                .pipe(first())
                .subscribe(observer);
        });
    }

    loadMoreThreads(): Observable<any> {
        return new Observable<any>((observer) => {
            this._store.dispatch(LoadMoreThreadsRequest({
                lastThreadId: this._getLastThreadId(),
                skip: this._getThreadsCount(),
                chatMode: this._chatMode,
                chatInstanceKey: this._instanceKey
            }));

            merge(
                this.actions$.pipe(
                    ofType(LoadMoreThreadsRequestSuccess),
                    map(({moreThreadsEnabled}) => {
                        return moreThreadsEnabled;
                    })
                ),
                this.actions$.pipe(
                    ofType(LoadMoreThreadsRequestFailed),
                    flatMap(({error}) => throwError(error))
                )
            )
                .pipe(first())
                .subscribe(observer);
        });
    }

    getSelectedThreadId(): string {
        return ObservableUtils.instant(this.selectedThreadId$);
    }

    cancelThreadSearch() {
        this._store.dispatch(CancelThreadsSearch({chatInstanceKey: this._instanceKey}));
    }

    createChatInstanceState() {
        this._store.dispatch(CreateChatInstance({id: this._instanceKey, chatMode: this._chatMode}));
    }

    destroyChartInstanceState() {
        this._store.dispatch(DestroyChatInstance({id: this._instanceKey}));
    }

    selectThread(threadId: string) {
        this._store.dispatch(SelectThread({
            threadId: threadId,
            prevThreadId: this.getSelectedThreadId(),
            chatInstanceKey: this._instanceKey
        }));
    }

    leaveThread(threadId: string): Observable<any> {
        return this._chatApiService.leaveThread(threadId)
            .pipe(
                tap(() => {
                    this._store.dispatch(CurrentUserLeavedThread({threadId}));
                })
            );
    }

    removeThread(threadId: string): Observable<any> {
        return this._chatApiService.deleteThreadById(threadId)
            .pipe(
                tap(() => {
                    this._store.dispatch(ThreadRemoved({threadId}));
                })
            );
    }

    private _getThreadsCount(): number {
        return this._helper.getThreadsState(this._instanceKey).threads.length;
    }

    private _getMessageFromStore(messageId: string): IMessage {
        const allMessages = this._helper.getMessagesEntities(this._instanceKey);
        return allMessages[messageId];
    }

    private _getLastThreadId(): string {
        return JsUtil.getArrayLastValue(this._helper.getThreadsState(this._instanceKey).threads);
    }

    ngOnDestroy() {
        this.destroyChartInstanceState();
    }
}
