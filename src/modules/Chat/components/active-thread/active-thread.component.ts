import {
    Component,
    ElementRef,
    EventEmitter, Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { EThreadType, IFileInfo, IThreadMessagePublish } from "../../models/thread";
import { ChatApiService } from "../../services/chat.api.service";
import { NotificationService } from "@app/services/notification.service";
import { UsersService } from "@app/services/users.service";
import { merge, Observable, of, Subject, Subscription } from "rxjs";
import {
    catchError, distinct,
    distinctUntilChanged,
    filter,
    map,
    mapTo, skip,
    startWith,
    switchMap,
    takeUntil,
    tap
} from "rxjs/operators";
import { IdentityService } from "@app/services/auth/identity.service";
import { AlertService } from "@alert/services/alert.service";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import {
    IInviteMembersModalConfig,
    InviteMembersModalComponent
} from "../invite-members-modal/invite-members-modal.component";
import {
    IThreadMembersModalComponentConfig,
    ThreadMembersModalComponent
} from "../thread-members-modal/thread-members-modal.component";
import { ChatFileUploaderComponent } from 'modules/Chat/components/chat-file-uploader/chat-file-uploader.component';
import { FileInfo } from '@app/models/storage/models';
import { Roles } from "@app/models/auth/auth.models";
import bind from "bind-decorator";
import { IUploadFileInputConfig } from "../../../file-uploader/components/upload-file-input/upload-file-input.component";
import { UploadFile } from "../../../file-uploader/data/UploadFIle";
import { State } from "../../store/reducers";
import { Store } from "@ngrx/store";
import { IMessage } from "../../models/models";
import {
    LoadThreadMessagesSuccess,
    RemoteMessageReceived,
    RemoteMessageRemoved,
    RemoveMessageRequestSuccess,
    SendMessageRequest,
    ThreadUpdated,
    UserBannedInThread,
    UserUnbannedInThread
} from "../../store/actions";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";
import { IThreadDTO } from "../../models/api.models";
import { FacadeService } from "../../services/facade.service";
import { ObservableUtils } from "../../../../utils/observable.utils";
import { ChatMode } from "../../enums/chat-mode";
import {
    ThreadConfiguratorComponent,
    ThreadConfiguratorComponentConfig,
    ThreadConfiguratorComponentResult
} from "../thread-configurator/thread-configurator.component";
import { FileStorageService } from "@app/services/file-storage.service";
import { Actions, ofType } from "@ngrx/effects";
import {
    InfinityLoaderComponent,
    InfinityLoaderHandler,
    ScrollDirection
} from "../../../infinity-loader/components/infinity-loader/infinity-loader.component";
import { ProcessState, ProcessStateType } from "@app/helpers/ProcessState";
import { ConfirmModalComponent, IConfirmModalConfig } from "UI";
import { ChatModeToken } from "../../mode.token";
import { ChatTranslateService } from "../../localization/token";

@Component({
    selector: 'active-thread',
    templateUrl: './active-thread.component.html',
    styleUrls: ['./active-thread.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ChatTranslateService
        }
    ]
})
export class ActiveThreadComponent implements OnInit, OnDestroy {
    @Output() public onMaximise = new EventEmitter();
    @ViewChild('messageInput', { static: false }) public input: ElementRef;
    @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
    @ViewChild('messagesWrapper', { static: false }) messagesPanel: ElementRef;
    @ViewChild(InfinityLoaderComponent, { static: false }) infinityLoader: InfinityLoaderComponent;

    bans: { [id: string]: string[]; } = {};
    activeThread$: Observable<IThreadDTO>;
    messages$: Observable<IMessage[]>;
    uploadFileInputConfig: IUploadFileInputConfig = {
        allowMultipleFiles: false
    };


    userMessage: string = '';
    messageForEdit: IMessage = null;
    loadThreadMessagesStatus = new ProcessState(ProcessStateType.None);
    private _needsScrollingToBottom: boolean = false;

    get showMoreBtn(): boolean {
        return this.activeThread && (this.canEditThread
            || this.canInviteMembers
            || this.canManageMembers
            || this.canLeaveThread
            || this.canRemoveThread);
    }

    get isGroupThread(): boolean {
        return this.activeThread.type === EThreadType.Group;
    }

    get isPublicThread(): boolean {
        return this.activeThread && this.activeThread.type === EThreadType.Public;
    }

    get isPrivateThread(): boolean {
        return this.activeThread && this.activeThread.type === EThreadType.Private;
    }

    get isCurrentUserCreator(): boolean {
        return this.activeThread && this.activeThread.creatorId === this._identityService.id;
    }

    get isEditingMessage(): boolean {
        return this.messageForEdit != null;
    }

    get activeThread(): IThreadDTO {
        return ObservableUtils.instant(this.activeThread$);
    }

    get canEditThread(): boolean {
        return this.activeThread
            && ((this.isGroupThread && this.isCurrentUserCreator)
                || (this.isPublicThread && this._identityService.isAdmin && !this.isUserBannedInThread));
    }

    get canInviteMembers(): boolean {
        return this.isGroupThread && this.isCurrentUserCreator;
    }

    get canManageMembers(): boolean {
        return this.isGroupThread && this.isCurrentUserCreator;
    }

    get canLeaveThread(): boolean {
        return (this.isGroupThread)
            && !this.isCurrentUserCreator;
    }

    get canRemoveThread(): boolean {
        return (this.isGroupThread || this.isPublicThread)
            && (this.isCurrentUserCreator || this._identityService.isAdmin && !this.isUserBannedInThread);
    }

    get isUserBannedInThread(): boolean {
        return this.activeThread.isBanned;
    }

    get showCreateThreadBtn(): boolean {
        return this.chatMode === ChatMode.PublicThreads ? this._identityService.role === Roles.Admin : true;
    }

    infinityLoaderHandler: InfinityLoaderHandler;
    ScrollDirection = ScrollDirection;

    constructor(private _identityService: IdentityService,
        private _alertService: AlertService,
        private _translateService: TranslateService,
        private _dialog: MatDialog,
        private _facadeService: FacadeService,
        private _fileStorage: FileStorageService,
        @Inject(ChatModeToken) public chatMode: ChatMode) {
    }

    public ngOnInit() {
        this.activeThread$ = this._facadeService.selectedThread$.pipe(
            takeUntil(componentDestroyed(this))
        );

        this.messages$ = this._facadeService.selectedThreadMessages$.pipe(
            map((messages) => {
                return messages.slice().reverse();
            })
        );

        const selectedThreadChanged$ = this.activeThread$
            .pipe(
                distinctUntilChanged((prev, curr) => {
                    if (prev && curr) {
                        return prev.id === curr.id;
                    }

                    return false;
                }),
                skip(1)
            );

        const userBannedInThread$ = this._facadeService.actions$.pipe(
            ofType(UserBannedInThread),
            filter(({ threadId }) => this.activeThread && threadId === this.activeThread.id)
        );
        const userUnbannedInThread$ = this._facadeService.actions$.pipe(
            ofType(UserUnbannedInThread),
            filter(({ threadId }) => this.activeThread && threadId === this.activeThread.id)
        );
        const threadBlockedStatusChange$ = this._facadeService.actions$.pipe(
            ofType(ThreadUpdated),
            filter(({ thread }) => this.activeThread && thread.id === this.activeThread.id),
            map(({ thread }) => thread.isBlocked),
            distinct()
        );

        // userBannedInThread$.pipe(
        //     takeUntil(componentDestroyed(this)),
        //     tap(() => {
        //         if (this.activeThread) {
        //             this._loadBans(this.activeThread).subscribe();
        //         }
        //     })
        // ); 
        
        // userUnbannedInThread$.pipe(
        //     takeUntil(componentDestroyed(this)),
        //     tap(() => {
        //         if (this.activeThread) {
        //             this._loadBans(this.activeThread).subscribe();
        //         }
        //     })
        // );

        const loadThreadMessages$ = merge(
            selectedThreadChanged$,
            threadBlockedStatusChange$,
            userUnbannedInThread$
        )
            .pipe(
                map(() => this.activeThread),
                startWith(this.activeThread),
                filter(thread => {
                    return thread != null && !thread.isBlocked && !thread.isBanned;
                })
            );

        const cancelThreadMessagesLoading$ = merge(
            selectedThreadChanged$.pipe(filter((thread) => {
                return thread == null || thread.isBlocked || thread.isBanned;
            })),
            userBannedInThread$,
            threadBlockedStatusChange$.pipe(filter((isBlocked) => isBlocked))
        );

        loadThreadMessages$
            .pipe(
                tap(() => {
                    this.loadThreadMessagesStatus.setPending();
                }),
                switchMap((thread) => {
                    return this._loadBans(thread).pipe(
                        map(() => thread)
                    );
                }),
                switchMap((thread) => {
                    return this._facadeService.loadThreadMessages(thread.id)
                        .pipe(
                            catchError(() => {
                                return of(null);
                            }),
                            takeUntil(cancelThreadMessagesLoading$)
                        );
                }),
                tap((result) => {
                    if (result == null) {
                        this.loadThreadMessagesStatus.setFailed();
                    } else {
                        this.loadThreadMessagesStatus.setSucceeded();
                        this._needsScrollingToBottom = true;
                    }
                })
            )
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe();

        cancelThreadMessagesLoading$
            .pipe(
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                this.loadThreadMessagesStatus.setSucceeded();
            });

        selectedThreadChanged$
            .pipe(
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                if (this.infinityLoader) {
                    this.infinityLoader.resetIsFulfilled();
                }

                this.cancelEditing();
                this._scrollMessagesToBottom();
            });


        merge(
            this._facadeService.actions$.pipe(ofType(RemoteMessageReceived), map(({ message }) => message.threadId)),
            this._facadeService.actions$.pipe(ofType(LoadThreadMessagesSuccess), map(({ threadId }) => threadId))
        )
            .pipe(
                filter((threadId) => this.activeThread && threadId === this.activeThread.id),
                switchMap(() => this._facadeService.selectedThreadMessages$),
                takeUntil(componentDestroyed(this))
            )
            .subscribe((messages: IMessage[]) => {
                if (this.activeThread) {
                    // this._facadeService.markThreadMessagesAsRead(this.activeThread.id, messages.filter(m => m.unread).map(m => m.id));
                }
            });

        merge(
            this._facadeService.actions$
                .pipe(
                    ofType(SendMessageRequest),
                    filter(({ message }) => {
                        return this.activeThread && message.threadId === this.activeThread.id;
                    })
                ),

            this._facadeService.actions$.pipe(
                ofType(RemoteMessageReceived),
                filter(({ message }) => {
                    return this.activeThread && message.threadId === this.activeThread.id;
                })
            )
        )
            .pipe(
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                if (this._isMessagesScrolledToBottom()) {
                    this._needsScrollingToBottom = true;
                }
            });

        this._facadeService.actions$
            .pipe(
                ofType(RemoveMessageRequestSuccess, RemoteMessageRemoved),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(({ messageId }) => {
                if (this.messageForEdit && this.messageForEdit.id === messageId) {
                    this.cancelEditing();
                }
            });

        this.infinityLoaderHandler = {
            handleScroll: () => {
                return this._facadeService.loadMoreThreadMessages(this.activeThread.id)
                    .pipe(
                        catchError((e) => {
                            console.error(e);
                            return of(true);
                        })
                    );
            }
        };
    }

    ngAfterViewChecked() {
        if (this._needsScrollingToBottom) {
            this._scrollMessagesToBottom();
            this._needsScrollingToBottom = false;
        }
    }

    isNotBanned(msg: IMessage): boolean {
        let threadId = !!this.activeThread ? this.activeThread.id : null;
        if (!threadId || !this.bans[threadId]) {
            return true;
        }

        return this.bans[threadId].indexOf(msg.creator.id) === -1;
    }

    private _loadBans(thread: IThreadDTO): Observable<any> {
        // if (!!this.bans[thread.id] && !force) {
        //     return of(null);
        // }

        return this._facadeService.loadBans(thread.id).pipe(map((_) => {
            // this.bans = {};
            this.bans[thread.id] = _.map((b) => b.subjectId);
        }));
    }

    private _sendMessage(message: string, files: IFileInfo[] = []) {
        const thread = ObservableUtils.instant(this.activeThread$);
        this._facadeService.sendMessage(message, files, thread.id)
            .subscribe();
    }

    private _editMessage(message: string, files: IFileInfo[] = [], messageId: string): Observable<any> {
        const thread = ObservableUtils.instant(this.activeThread$);
        return this._facadeService.updateMessage(message, files, messageId, thread.id);
    }

    private _editTextMessage(message: string, files: IFileInfo[] = [], messageId: string) {
        this._editMessage(message, files, messageId)
            .subscribe({
                next: () => {
                    this.cancelEditing();
                    this.clearInput();
                },
                error: () => {
                    this._alertService.error(this._translateService.get('failedToEditMessage'));
                }
            });
    }

    private _editFileMessage(content: string, files: IFileInfo[], messageId: string) {
        this._editMessage(content, files, messageId)
            .subscribe({
                next: () => {
                    console.log('updated');
                }
            });
    }

    clearInput() {
        this.userMessage = '';
    }

    public handleRemoveMessage(id: string) {
        if (this.activeThread.isDisabled) {
            this._alertService.error(this._translateService.get('activeThread.disabledError'));
            return;
        }

        const thread = ObservableUtils.instant(this.activeThread$);

        this._facadeService.removeMessage(id, thread.id)
            .subscribe({
                next: () => {
                    console.log('removed');
                },
                error: (e) => {
                    console.error(e);
                    this._alertService.error(this._translateService.get('failedToDeleteMessage'));
                }
            });
    }

    public handleEditMessage(message: IMessage) {
        if (this.activeThread.isDisabled) {
            this._alertService.error(this._translateService.get('activeThread.disabledError'));
            return;
        }

        if (this._isFileMessage(message)) {
            this._handleEditFileMessage(message);
        } else {
            this.messageForEdit = message;
            this.userMessage = message.content;
            this.input.nativeElement.focus();
        }
    }

    handleResendMessage(message: IMessage) {
        this._facadeService.resendMessage(message)
            .subscribe({
                error: (e) => {
                    console.error(e);
                    this._alertService.error(this._translateService.get('failedToResendMessage'));
                }
            });
    }

    private _handleEditFileMessage(message: IMessage) {
        this._dialog.open(
            ChatFileUploaderComponent, {
            data: {
                file: null,
                fileInfo: message.files[0],
                caption: message.content,
                onFileUploaded: ((fileInfo: FileInfo, caption: string) => {
                    this._editFileMessage(caption, [{
                        id: fileInfo.id,
                        name: fileInfo.fileName
                    }], message.id);
                })
            }
        });
    }

    public cancelEditing() {
        this.messageForEdit = null;
        this.userMessage = '';
    }

    public addEmoji(emoji: string) {
        if (this.activeThread.isDisabled) {
            return;
        }

        const element = this.input.nativeElement;
        element.focus();
        this.userMessage =
            this.userMessage.substring(0, element.selectionStart) +
            emoji +
            this.userMessage.substring(element.selectionStart, this.userMessage.length);
    }

    handleMessageInputSubmit() {
        if (this._isValidMessageText(this.userMessage)) {
            if (this.messageForEdit) {
                this._editTextMessage(this.userMessage, [], this.messageForEdit.id);
            } else {
                this._sendMessage(this.userMessage);
                this.clearInput();
            }
        }
    }

    public onInputKeyUp(event: KeyboardEvent) {
        if (this.activeThread.isDisabled) {
            return;
        }

        switch (event.code) {
            case 'Enter':
            case 'NumpadEnter':
                this.handleMessageInputSubmit();
                break;
            case 'ArrowUp':
                if (!this.messageForEdit) {
                    const messageForEdit = ObservableUtils.instant(this.messages$).find(message => message.fromId === this._identityService.id);

                    if (messageForEdit) {
                        this.handleEditMessage(messageForEdit);
                    }
                }
                break;
            case 'Escape':
                if (this.messageForEdit) {
                    this.cancelEditing();
                }
                break;
            default:
                break;
        }
    }

    public onInputClick(event) {
        if (this.activeThread.isDisabled) {
            this._alertService.error(this._translateService.get('activeThread.disabledError'));
        }
    }

    // Edge and Firefox doesn`t support flex-direction: column-reverse;
    public isChromeBrowser(): boolean {
        let win: any = window;
        return !!win.chrome && (!!win.chrome.webstore || !!win.chrome.runtime);
    }

    public openSettings() {
        this._dialog.open(ThreadConfiguratorComponent, {
            data: {
                name: this.activeThread.name,
                description: this.activeThread.description,
                photoUrl: this.activeThread.pictureId !== FileStorageService.ChatThreadDefaultPhotoId
                    ? this._fileStorage.getImageUrl(this.activeThread.pictureId)
                    : undefined,
                submitHandler: (result: ThreadConfiguratorComponentResult) => {
                    return this._facadeService.updateThread(
                        this.activeThread.id,
                        result.name,
                        result.description,
                        result.photo
                    ).pipe(
                        catchError((e) => {
                            console.error(e);
                            return of(false);
                        })
                    );
                }
            } as ThreadConfiguratorComponentConfig
        });
    }

    public openInvites() {
        this._dialog.open(InviteMembersModalComponent, {
            data: {
                threadId: this.activeThread.id
            } as IInviteMembersModalConfig
        });
    }

    public openMembers() {
        this._dialog.open(ThreadMembersModalComponent, {
            data: {
                threadId: this.activeThread.id
            } as IThreadMembersModalComponentConfig
        }).afterClosed()
            .subscribe((value) => {
            });
    }

    leaveThread() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                onConfirm: () => {
                    this._facadeService.leaveThread(this.activeThread.id)
                        .subscribe({
                            error: (e) => {
                                console.error(e);
                                this._alertService.error(this._translateService.get('failedToLeaveThread'));
                            }
                        });
                }
            } as IConfirmModalConfig
        });
    }

    removeThread() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                onConfirm: () => {
                    this._facadeService.removeThread(this.activeThread.id)
                        .subscribe({
                            error: (e) => {
                                console.error(e);
                                this._alertService.error(this._translateService.get('failedToRemoveThread'));
                            }
                        });
                }
            } as IConfirmModalConfig
        });
    }


    @bind
    public handleFileInput(files: UploadFile[]) {
        this._dialog.open(
            ChatFileUploaderComponent, {
            data: {
                file: files[0],
                onFileUploaded: ((fileInfo: FileInfo, caption: string) => {
                    const filesInfo = [{
                        id: fileInfo.id,
                        name: fileInfo.fileName
                    }];

                    if (!this.isEditingMessage) {
                        this._sendMessage(caption, filesInfo);

                        return;
                    }

                    if (this._isFileMessage(this.messageForEdit)) {
                        this._editFileMessage(caption, filesInfo, this.messageForEdit.id);
                    } else {
                        this._editTextMessage(caption, filesInfo, this.messageForEdit.id);
                    }
                })
            }
        });
    }

    public createThread() {
        this._dialog.open(ThreadConfiguratorComponent, {
            data: {
                submitHandler: (result: ThreadConfiguratorComponentResult) => {
                    return this._facadeService.createThread(result.name, result.description, result.photo)
                        .pipe(
                            mapTo(true),
                            catchError((e) => {
                                this._handleCreateThreadError(e);

                                return of(false);
                            })
                        );
                }
            } as ThreadConfiguratorComponentConfig
        }).afterClosed();
    }

    private _handleCreateThreadError(e) {
        console.error(e);
        this._alertService.error(this._translateService.get('failedToCreateThread'));
    }

    private _isValidMessageText(text: string): boolean {
        return text && !!text.length && !!text.trim().length;
    }

    private _isFileMessage(message: IMessage): boolean {
        return message.files && message.files.length !== 0;
    }

    private _scrollMessagesToBottom() {
        const native = this.messagesPanel.nativeElement;
        native.scrollTop = native.scrollHeight;
    }

    private _isMessagesScrolledToBottom(): boolean {
        const element = this.messagesPanel.nativeElement;
        return element.scrollHeight - element.scrollTop === element.clientHeight;
    }

    trackByFn(index, item: IMessage) {
        return item.id; // or item.id
    }

    public ngOnDestroy(): void {
    }
}
