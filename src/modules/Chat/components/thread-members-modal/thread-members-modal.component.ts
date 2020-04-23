import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {Modal} from "Shared";
import {TranslateService} from "@ngx-translate/core";
import {ChatApiService} from "../../services/chat.api.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {IInviteMembersModalConfig} from "../invite-members-modal/invite-members-modal.component";
import {ISubject, IThread, IThreadBan, IThreadInviteSubject} from "../../models/thread";
import {UserModel, UserProfileModel} from "@app/models/auth/auth.models";
import {BehaviorSubject, combineLatest, forkJoin, Observable, of, Subscription} from "rxjs";
import {IInputModalConfig, InputModalComponent} from "../../../UI/components/input-modal/input-modal.component";
import {ConfirmModalComponent, IConfirmModalConfig, SearchHandler} from "UI";
import {MatDialog} from "@angular/material/dialog";
import {UsersProfileService} from "@app/services/users-profile.service";
import {ChatTranslateService} from "../../localization/token";
import {NotificationService} from "@app/services/notification.service";
import {catchError, map, switchMap, tap} from "rxjs/operators";
import {PaginationParams} from "@app/models/pagination.model";
import {AlertService} from "@alert/services/alert.service";

export interface IThreadMembersModalComponentConfig {
    threadId: string;
}

interface MemberModel {
    user: UserProfileModel;
    ban: IThreadBan;
}

const BanModalClass = 'ban-modal';

@Component({
    selector: 'thread-members-modal',
    templateUrl: './thread-members-modal.component.html',
    styleUrls: ['./thread-members-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ChatTranslateService
        }
    ]
})
export class ThreadMembersModalComponent extends Modal<IInviteMembersModalConfig> implements OnInit {
    $initObs: Observable<any>;

    allMembers: BehaviorSubject<MemberModel[]> = new BehaviorSubject<MemberModel[]>([]);
    filteredMembers: Observable<MemberModel[]>;
    members: Observable<MemberModel[]>;
    query = new BehaviorSubject('');

    get threadId() {
        return this.data.threadId;
    }

    constructor(private _chatApiService: ChatApiService,
                private _translateService: TranslateService,
                private _usersProfileService: UsersProfileService,
                private _threadService: ChatApiService,
                private _identityService: IdentityService,
                private _dialog: MatDialog,
                private _notificationService: NotificationService,
                private _alertService: AlertService,
                injector: Injector) {
        super(injector);
    }


    public ngOnInit() {
        this.filteredMembers = combineLatest(
            this.allMembers,
            this.query
        ).pipe(
            map(([allMembers, query]) => {
                if (query.length === 0) {
                    return allMembers;
                }

                return allMembers.filter((i) => {
                    return i.user.userName.indexOf(query) !== -1;
                });
            })
        );

        this.members = combineLatest(
            this.allMembers,
            this.filteredMembers
        ).pipe(
            map(([allMembers, filteredMembers]) => {
                return filteredMembers ? filteredMembers : allMembers;
            })
        );


        this.$initObs = this._chatApiService.getThreadParticipants(this.threadId, PaginationParams.ALL())
            .pipe(
                map((resp) => resp.items.map(i => i.subjectId)),
                switchMap((memberIds: string[]) => {
                    return forkJoin({
                        users: this._usersProfileService.getUsersProfilesByIds(memberIds).pipe(map(resp => resp.items)),
                        bans: this._threadService.getThreadBansByThreadId(this.threadId, PaginationParams.ALL()).pipe(map(resp => resp.items))
                    });
                }),
                tap(({users, bans}) => {
                    this.allMembers.next(
                        users.map((u) => {
                            return {
                                user: u,
                                ban: bans.find(b => b.subjectId === u.id)
                            } as MemberModel;
                        })
                    );
                })
            );
    }

    handleSearch(query: string) {
        this.query.next(query);
    }

    handleCreateBan(member: MemberModel) {
        this._dialog.open(InputModalComponent, {
            data: {
                title: this._translateService.get('newBan'),
                errorText: of(''),
                buttonCaption: this._translateService.get('submit'),
                inputCaption: this._translateService.get('banReason'),
                inputPlaceholder: this._translateService.get('banReason'),
                modalClass: BanModalClass,
                submitHandler: (value: string) => {
                    return this._threadService.createThreadBan({
                        description: value,
                        subjectId: member.user.id,
                        threadId: this.data.threadId
                    }).pipe(
                        tap((ban: IThreadBan) => {
                            member.ban = ban;
                        }),
                        catchError((e) => {
                            console.error(e);
                            this._alertService.error(this._translateService.get('failedToCreateBan'));

                            return of(false);
                        })
                    );
                }
            } as IInputModalConfig
        });
    }


    handleRemoveMember(member: MemberModel) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                onConfirm: () => {
                    this._threadService.deleteUserFromThread(this.data.threadId, member.user.id)
                        .subscribe(() => {
                            this.allMembers.next(this.allMembers.getValue().filter(m => m.user.id !== member.user.id));
                        }, e => {
                            console.error(e);
                            this._alertService.error(this._translateService.get('failedToRemoveMember'));
                        });
                }
            } as IConfirmModalConfig
        });
    }

    handleUpdateBan(member: MemberModel) {
        this._dialog.open(InputModalComponent, {
            data: {
                value: member.ban.description,
                title: this._translateService.get('updateBan'),
                errorText: of(''),
                buttonCaption: this._translateService.get('submit'),
                inputCaption: this._translateService.get('banReason'),
                inputPlaceholder: this._translateService.get('banReason'),
                modalClass: BanModalClass,
                submitHandler: (value: string) => {
                    return this._threadService.updateThreadBanById(member.ban.id, {description: value}).pipe(
                        tap((ban: IThreadBan) => {
                            member.ban = ban;
                        }),
                        catchError((e) => {
                            console.error(e);
                            this._alertService.error(this._translateService.get('failedToUpdateBan'));

                            return of(false);
                        })
                    );
                }
            } as IInputModalConfig
        });
    }

    handleUnbanUser(member: MemberModel) {
        this._dialog.open(ConfirmModalComponent,
            {
                data: {
                    message: this._translateService.get('unbanUser?'),
                    onConfirm: () => {
                        this._threadService.deleteThreadBanById(member.ban.id)
                            .subscribe({
                                next: (resp) => {
                                    member.ban = null;
                                },
                                error: (e) => {
                                    console.error(e);
                                    this._alertService.error(this._translateService.get('failedToUnbanUser'));
                                }
                            });
                    }
                } as IConfirmModalConfig
            });
    }

    isCurrentUser(user: UserProfileModel): boolean {
        return this._identityService.id === user.id;
    }

    ngOnDestroy() {
    }
}
