import {Injectable} from "@angular/core";
import {NotificationService} from "@app/services/notification.service";
import {
    EditMessagePayload,
    IThreadCreatedNotificationPayload,
    IThreadRemovedNotificationPayload,
    IThreadUpdatedNotificationPayload,
    IThreadBanCreatedNotificationPayload,
    IThreadBanDeletedNotificationPayload,
    IThreadInviteAcceptedNotificationPayload,
    IUserRemovedFromThreadNotificationPayload,
    MessageFileDetails,
    MessagesCountPayload,
    NotificationAction,
    NotificationTopics,
    PublishMessagePayload,
    RemoveMessagePayload, IThreadRestoredNotificationPayload
} from "@app/models/notifications/notification";
import {Store} from "@ngrx/store";
import {forkJoin, of} from "rxjs";
import {IMessageDTO} from "../../models/api.models";
import {distinctUntilChanged, flatMap, map, tap} from "rxjs/operators";
import {IFileInfo} from "../../models/thread";
import {
    RemoteMessageEdited,
    RemoteMessageReceived,
    RemoteMessageRemoved,
    SelectThread,
    ThreadCreated, ThreadLastMessageChanged,
    ThreadRemoved, ThreadRestored,
    ThreadUpdated,
    UserBannedInThread,
    UserRemovedFromThread,
    UserUnbannedInThread
} from "../actions";
import {AppState} from "@app/store/reducer";
import {UsersProfileService} from "@app/services/users-profile.service";
import {ChatApiService} from "../../services/chat.api.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {ChatHelperService} from "../../services/chat-helper.service";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {IMessage} from "../../models/models";

@Injectable()
export class ChatNotificationsEffects {
    constructor(private _chatApiService: ChatApiService,
                private _identityService: IdentityService,
                private _notificationService: NotificationService,
                private actions$: Actions,
                private _store: Store<AppState>,
                private _helper: ChatHelperService) {

        this._notificationService.ensureConnectionEstablished()
            .subscribe((hasConnection: boolean) => {
                if (hasConnection) {
                    this._notificationService.subscribeToPublicRoomsUpdates()
                        .subscribe({
                            error: (e) => {
                                console.error(e);
                            }
                        });


                    this._notificationService.subscribeForUpdates(NotificationTopics.MessageCount)
                        .subscribe({
                            error: (e) => {
                                console.error(e);
                            }
                        });
                }
            });


        this._subscribeToNotifications();
    }

    @Effect({dispatch: false})
    selectThread = this.actions$.pipe(
        ofType(SelectThread),
        distinctUntilChanged((prev, curr) => prev.threadId === curr.threadId),
        tap(({threadId, prevThreadId}) => {
            if (threadId != null) {
                this._notificationService.subscribeForUpdates(NotificationTopics.Chat, threadId)
                    .subscribe({
                        error: (e) => {
                            console.error('Failed to subscribe on thread updates', e);
                        }
                    });
            }

            if (prevThreadId != null) {
                this._notificationService.unSubscribeForUpdates(NotificationTopics.Chat, prevThreadId)
                    .subscribe({
                        error: (e) => {
                            console.error('Failed to unsubscribe from thread updates', e);
                        }
                    });
            }
        })
    );

    private _subscribeToNotifications() {
        this._notificationService.onMessage$
            .subscribe(notification => {
                if (notification.notificationTopicName === NotificationTopics.Chat) {
                    try {
                        const parsedPayload = JSON.parse(notification.payload);

                        switch (notification.action) {
                            case NotificationAction.Thread_MessagePublishedEvent:
                                this._handleMessagePublish(JSON.parse(notification.payload));
                                break;

                            case NotificationAction.Thread_MessageEditEvent:
                                this._handleMessageEdited(JSON.parse(notification.payload));
                                break;
                            //
                            case NotificationAction.Thread_MessageDeletedEvent:
                                this._handleMessageDelete(JSON.parse(notification.payload));
                                break;

                            case NotificationAction.Thread_ParticipantsDeleteEvent:
                                this._handleUseRemovedFromThread(parsedPayload);
                                break;
                            //
                            // case NotificationAction.Thread_ParticipantsLeftEvent:
                            //     this._handleSubjectRemoved(JSON.parse(notification.payload));
                            //     break;

                            default:
                                break;
                        }
                    } catch (e) {
                        console.log('Notification error');
                        console.log(e);
                    }
                }

                if (notification.notificationTopicName === NotificationTopics.MessageCount) {
                    if (notification.action === NotificationAction.Thread_MessagesCountEvent) {
                        this._handleMessagesCountChangeEvent(JSON.parse(notification.payload));
                    }
                }

                if (notification.notificationTopicName === NotificationTopics.Invites) {
                    const parsedPayload = JSON.parse(notification.payload);

                    switch (notification.action) {
                        case NotificationAction.Thread_InviteAcceptedEvent: {
                            this._handleThreadInviteAccepted(parsedPayload);
                            break;
                        }
                        default:
                            break;
                    }
                }


                if (notification.notificationTopicName === NotificationTopics.PublicRooms) {
                    const parsedPayload = JSON.parse(notification.payload);

                    switch (notification.action) {
                        case NotificationAction.Thread_CreatedEvent:
                            this._handlePublicThreadCreated(parsedPayload);
                            break;
                        case NotificationAction.Thread_RemovedEvent:
                            this._handleThreadRemoved(parsedPayload);
                            break;
                        case NotificationAction.Thread_UpdatedEvent:
                            this._handleThreadUpdated(parsedPayload);
                            break;
                        case NotificationAction.Thread_RestoreEvent:
                            this._handleThreadRestored(parsedPayload);
                            break;
                    }
                }

                if (notification.notificationTopicName === NotificationTopics.UserBans) {
                    const parsedPayload = JSON.parse(notification.payload);

                    switch (notification.action) {
                        case NotificationAction.Thread_BanCreatedEvent:
                            this._handleThreadBanCreated(parsedPayload);
                            break;
                        case NotificationAction.Thread_BanDeletedEvent:
                            this._handleThreadBanDeleted(parsedPayload);
                            break;
                        default:
                            break;
                    }
                }
            });
    }

    private _handleMessagePublish(newMessagePayload: PublishMessagePayload) {
        const publishedMessage = newMessagePayload.threadMessage;
        const loadedThreads = this._helper.getAllLoadedThreadsEntitiesFromChats();

        let files: IFileInfo[];

        if (newMessagePayload.files) {
            files = [];
            newMessagePayload.files.forEach((value: MessageFileDetails) => {
                files.push({
                    id: value.id,
                    name: value.name
                } as IFileInfo);
            });
        }

        forkJoin({
            thread: loadedThreads[publishedMessage.threadId]
                ? of(loadedThreads[publishedMessage.threadId])
                : this._chatApiService.getThreadById(publishedMessage.threadId),
            message: this._chatApiService.getMessageById(publishedMessage.id)
                .pipe(
                    flatMap((message: IMessageDTO) => {
                        return this._helper.convertToIMessage(message);
                    })
                )
        }).subscribe({
            next: (result) => {
                this._store.dispatch(RemoteMessageReceived({
                    message: result.message,
                    thread: result.thread,
                    isMessageSentByCurrentUser: result.message.fromId === this._identityService.id,
                    localMessageId: publishedMessage.clientId
                }));
            }
        });
    }

    private _handleMessageDelete(deleteMessagePayload: RemoveMessagePayload) {
        this._chatApiService.getThreadLastMessage(deleteMessagePayload.threadId)
            .pipe(
                flatMap((lastMessage: IMessageDTO) => {
                    if (!lastMessage) {
                        return of(null);
                    }

                    return this._helper.convertToIMessage(lastMessage);
                })
            )
            .subscribe({
                next: (lastMessage) => {
                    this._store.dispatch(RemoteMessageRemoved({
                        messageId: deleteMessagePayload.messageId,
                        threadId: deleteMessagePayload.threadId,
                        lastThreadMessage: lastMessage
                    }));
                },
                error: (e) => {
                    console.log('failed to handle message removed', e);
                }
            });
    }

    private _handleMessageEdited(editMessagePayload: EditMessagePayload) {
        this._store.dispatch(RemoteMessageEdited({
            messageId: editMessagePayload.messageId,
            threadId: editMessagePayload.threadId,
            content: editMessagePayload.messageContent,
            files: editMessagePayload.files.map((v) => {
                return {
                    id: v.id,
                    name: v.name
                } as IFileInfo;
            })
        }));
    }

    private _handleMessagesCountChangeEvent(payload: MessagesCountPayload) {
        const threadId = payload.threadId;

        forkJoin({
            thread: this._chatApiService.getThreadById(threadId),
            lastMessage: this._chatApiService.getThreadLastMessage(threadId)
                .pipe(flatMap((lastMessage) => {
                    if (lastMessage) {
                        return this._helper.convertToIMessage(lastMessage);
                    }

                    return of(null);
                }))
        })
            .subscribe({
                next: ({thread, lastMessage}) => {
                    this._store.dispatch(ThreadLastMessageChanged({
                        thread: thread,
                        message: lastMessage
                    }));
                },
                error: (e) => {
                    console.error(e);
                }
            });
    }

    private _handlePublicThreadCreated(payload: IThreadCreatedNotificationPayload) {
        forkJoin({
            message: payload.thread.lastMessage ? this._helper.convertToIMessage(payload.thread.lastMessage) : of(null),
            thread: of(payload.thread)
        }).subscribe({
            next: ({message, thread}) => {
                this._store.dispatch(ThreadCreated({thread, lastMessage: message}));
            },
            error: (e) => {
                console.log(e);
            }
        });
    }

    private _handleThreadRemoved(payload: IThreadRemovedNotificationPayload) {
        this._store.dispatch(ThreadRemoved({threadId: payload.threadId}));
    }

    private _handleThreadUpdated(payload: IThreadUpdatedNotificationPayload) {
        this._store.dispatch(ThreadUpdated({thread: payload.thread}));
    }

    private _handleThreadRestored(payload: IThreadRestoredNotificationPayload) {
        const thread = payload.thread;

        this._chatApiService.getThreadLastMessage(thread.id)
            .pipe(
                flatMap((dto) => {
                    return this._helper.convertToIMessage(dto);
                })
            )
            .subscribe({
                next: (message: IMessage) => {
                    this._store.dispatch(ThreadRestored({
                        thread: thread,
                        lastMessage: message
                    }));
                },
                error: (e) => {
                    console.error(e);
                }
            });
    }

    private _handleThreadInviteAccepted(payload: IThreadInviteAcceptedNotificationPayload) {
        const inviteCreatorId = payload.threadInvite.inviteCreatorId;
        const threadId = payload.threadInvite.threadId;

        if (inviteCreatorId === this._identityService.id) {
            return;
        }

        forkJoin({
            thread: this._chatApiService.getThreadById(threadId),
            message: this._chatApiService.getThreadLastMessage(threadId)
                .pipe(flatMap((message) => {
                    if (!message) {
                        return of(null);
                    }

                    return this._helper.convertToIMessage(message);
                }))
        })
            .subscribe({
                next: ({message, thread}) => {
                    this._store.dispatch(ThreadCreated({thread, lastMessage: message}));
                },
                error: (e) => {
                    console.log(e);
                }
            });
    }

    private _handleThreadBanCreated(payload: IThreadBanCreatedNotificationPayload) {
        if (payload.threadBan.subjectId !== this._identityService.id) {
            return;
        }

        this._store.dispatch(UserBannedInThread({threadId: payload.threadBan.threadId}));
    }

    private _handleThreadBanDeleted(payload: IThreadBanDeletedNotificationPayload) {
        if (payload.threadBan.subjectId !== this._identityService.id) {
            return;
        }

        this._store.dispatch(UserUnbannedInThread({threadId: payload.threadBan.threadId}));
    }

    private _handleUseRemovedFromThread(payload: IUserRemovedFromThreadNotificationPayload) {
        this._store.dispatch(UserRemovedFromThread({threadId: payload.threadId}));
    }
}
