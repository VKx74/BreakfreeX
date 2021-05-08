import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {Modal} from "Shared";
import {TranslateService} from "@ngx-translate/core";
import {
    TagsInputAutocompleteHandler,
    TagsInputComponent,
    TagsInputMode,
    TagsInputTagNameSelector
} from "@tagsInput/components/tags-input/tags-input.component";
import {catchError, flatMap, map, skip, takeUntil, tap} from "rxjs/operators";
import {BehaviorSubject, combineLatest, forkJoin, Observable, of} from "rxjs";
import {UserProfileModel} from "@app/models/auth/auth.models";
import {
    IInviteEject,
    IThread, IThreadInvite,
    IThreadInviteSubject
} from "../../models/thread";
import {IdentityService} from "@app/services/auth/identity.service";
import {ChatTranslateService} from "../../localization/token";
import {UsersProfileService} from "@app/services/users-profile.service";
import {MatDialog} from "@angular/material/dialog";
import {NotificationAction, NotificationTopics} from "@app/models/notifications/notification";
import {NotificationService} from "@app/services/notification.service";
import {ChatApiService} from "../../services/chat.api.service";
import {IPaginationResponse, PaginationParams} from "@app/models/pagination.model";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {AlertService} from "@alert/services/alert.service";
import {concat} from "@decorators/concat";
import {ConfirmModalComponent} from "UI";

export interface IInviteMembersModalConfig {
    threadId: string;
}

@Component({
    selector: 'invite-members-modal',
    templateUrl: './invite-members-modal.component.html',
    styleUrls: ['./invite-members-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ChatTranslateService
        }
    ]
})
export class InviteMembersModalComponent extends Modal<IInviteMembersModalConfig> implements OnInit {
    $initObs: Observable<any>;

    suggestedUsers$: Observable<UserProfileModel[]>;
    defaultSuggestedUsers$: BehaviorSubject<UserProfileModel[]> = new BehaviorSubject<UserProfileModel[]>([]);
    filteredSuggestedUsers$: BehaviorSubject<UserProfileModel[]> = new BehaviorSubject<UserProfileModel[]>(null);
    selectedMembers: UserProfileModel[] = [];

    threadInvites: IThreadInvite[];
    threadMembers: { [userId: string]: any } = {};

    TagsInputMode = TagsInputMode;
    loading: boolean = false;
    processInvite: boolean = false;

    @ViewChild('selectedMembersInput', {static: false}) selectedMembersInput: TagsInputComponent;

    get threadId() {
        return this.data.threadId;
    }

    constructor(private _translateService: TranslateService,
                private _usersProfileService: UsersProfileService,
                private _chatApiService: ChatApiService,
                private _identityService: IdentityService,
                private _alertService: AlertService,
                private _notificationService: NotificationService,
                private _dialog: MatDialog,
                injector: Injector) {
        super(injector);
    }

    public ngOnInit() {
        this.suggestedUsers$ = combineLatest(
            this.filteredSuggestedUsers$,
            this.defaultSuggestedUsers$
        )
            .pipe(
                map(([searchedUsers, defaultUsers]) => {
                    if (searchedUsers) {
                        return searchedUsers;
                    }

                    return defaultUsers;
                })
            );

        this.$initObs = forkJoin([
            this._getDefaultUserList().pipe(
                tap((resp) => {
                    this.defaultSuggestedUsers$.next(resp ? resp.items : []);
                })
            ),

            this._chatApiService.getThreadInvites(this.threadId)
                .pipe(
                    tap((items) => {
                        this.threadInvites = items.map(i => i.threadInvite);
                    })
                ),

            this._chatApiService.getThreadParticipants(this.threadId, PaginationParams.ALL())
                .pipe(
                    tap(res => {
                        this.threadMembers = res.items.reduce((acc, i) => {
                            acc[i.subjectId] = true;
                            return acc;
                        }, {});
                    })
                )
        ]);

        this._notificationService.onMessage$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(notification => {
                if (notification.notificationTopicName === NotificationTopics.Chat) {
                    try {
                        if (notification.action === NotificationAction.Thread_ParticipantsJoinedEvent) {
                            this._handleInviteAccepted(JSON.parse(notification.payload));
                        }
                    } catch (e) {
                        console.log('Notification error');
                        console.log(e);
                    }
                }
                if (notification.notificationTopicName === NotificationTopics.Invites) {
                    try {
                        if (notification.action === NotificationAction.Thread_InviteRejectedEvent) {
                            this._handleInviteRejected(JSON.parse(notification.payload));
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
    }

    usersAutocompleteHandler: TagsInputAutocompleteHandler = (query: string) => {
        if (query.length === 0) {
            this.filteredSuggestedUsers$.next(null);
            return of([]);
        }

        this.loading = true;
        const response = query ? this._usersProfileService.searchUsersProfileByUserName(query) : this._getDefaultUserList();

        return response.pipe(
            map(resp => {
                this.filteredSuggestedUsers$.next(resp ? resp.items : []);
                this.loading = false;

                return resp && resp.items && resp.items.length ? resp.items : [];
            }),
            catchError((e) => {
                console.error(e);
                return of([]);
            })
        );
    }

    userEmailSelector: TagsInputTagNameSelector = (data: UserProfileModel) => {
        return `${(<UserProfileModel>data).firstName} ${(<UserProfileModel>data).lastName}`;
    }

    isUserMember(user: UserProfileModel): boolean {
        return this.threadMembers[user.id] != null;
    }

    isUserSelectedForInvitation(user: UserProfileModel): boolean {
        return this.selectedMembers.findIndex(u => u.id === user.id) !== -1;
    }

    isInvitationSentToUser(user: UserProfileModel): boolean {
        return this.getUserInvitation(user.id) != null;
    }

    getUserInvitation(userId: string): IThreadInvite {
        return this.threadInvites.find(invite => invite.subjectId === userId);
    }


    handleUserSelected(user: UserProfileModel) {
        if (this.isInvitationSentToUser(user) || this.isUserMember(user) || user.id === this._identityService.id) {
            return;
        }

        if (this.isUserSelectedForInvitation(user)) {
            this.removeUserFromInvitation(user);
        } else {
            this.addUserForInvitation(user);
            this.selectedMembersInput.refreshInputField();
            this.filteredSuggestedUsers$.next(null);
        }
    }

    addUserForInvitation(user: UserProfileModel) {
        this.selectedMembers.push(user);
    }

    removeUserFromInvitation(user: UserProfileModel) {
        this.selectedMembers = this.selectedMembers.filter(u => u.id !== user.id);
    }

    cancelInvitation(userId: string) {
        const invite = this.getUserInvitation(userId);

        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: this._translateService.get('cancelInvitation'),
                onConfirm: () => {
                    this._chatApiService.deleteThreadInviteById(invite.id)
                        .subscribe({
                            next: resp => {
                                this.threadInvites = this.threadInvites.filter(inv => inv.id !== invite.id);
                            },
                            error: (e) => {
                                console.error(e);
                                this._alertService.error(this._translateService.get('failedCancelInvitation'));
                            }
                        });
                }
            }
        });
    }

    private _handleInviteRejected(inviteEject: IInviteEject) {
        this._deleteUserInvitation(inviteEject.threadInvite.subjectId);
    }

    private _handleInviteAccepted(inviteAccepted: IThreadInviteSubject) {
        const userId = inviteAccepted.subjects[0].id;

        this._deleteUserInvitation(inviteAccepted.subjects[0].id);
        this.threadMembers[userId] = true;
    }

    private _deleteUserInvitation(userId: string) {
        this.threadInvites = this.threadInvites.filter(t => t.subjectId !== userId);
    }

    private _getDefaultUserList(): Observable<IPaginationResponse<UserProfileModel>> {
        return this._usersProfileService.getAllUsersProfiles(new PaginationParams(0, 10));
    }

    submit() {
        const threadId = this.threadId;
        const ids = this.selectedMembers.map(sm => sm.id);

        this.processInvite = true;
        this._chatApiService.inviteMembersByIds(threadId, ids)
            .subscribe({
                next: () => {
                    this.processInvite = false;
                    this.close();
                },
                error: (e) => {
                    console.error(e);
                    this.processInvite = false;
                    this._alertService.error(this._translateService.get('failedToInviteUsers'));
                }
            });
    }

    public handleRemoveUserFromInvitation(user: UserProfileModel) {
        this.selectedMembers = this.selectedMembers.filter(u => u.id !== user.id);
    }

    ngOnDestroy() {
    }
}
