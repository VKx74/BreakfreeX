import {Component, OnDestroy, OnInit} from '@angular/core';
import {IThreadInvite} from "../../../Chat/models/thread";
import {catchError, switchMap} from "rxjs/operators";
import {UsersProfileService} from "@app/services/users-profile.service";
import {of, Subscription} from "rxjs";
import {ConfirmModalComponent} from "UI";
import {MatDialog} from "@angular/material/dialog";
import {NotificationService} from "@app/services/notification.service";
import {IThreadInvitePayload, NotificationAction, NotificationTopics} from "@app/models/notifications/notification";
import {TranslateService} from "@ngx-translate/core";
import {NotificationsTranslateService} from "../../localization/token";
import {IdentityService} from "@app/services/auth/identity.service";
import {ComponentIdentifier} from "@app/models/app-config";
import {ChatApiService} from "../../../Chat/services/chat.api.service";

@Component({
    selector: 'invite-notifications',
    templateUrl: './invite-notifications.component.html',
    styleUrls: ['./invite-notifications.component.scss',
        '../../styles/_shared.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: NotificationsTranslateService
        }
    ]
})
export class InviteNotificationsComponent implements OnInit, OnDestroy {
    private _total: number = 0;

    public invites: IThreadInvitePayload[] = [];
    private _notificationSubscription: Subscription;

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(private _threadService: ChatApiService,
                private _userProfileService: UsersProfileService,
                private _dialog: MatDialog,
                private _identityService: IdentityService,
                private _notificationService: NotificationService) {
    }

    public ngOnInit(): void {
        this._notificationSubscription = this._notificationService.onMessage$
            .subscribe(notification => {
                try {
                    if (notification.notificationTopicName === NotificationTopics.Invites
                    && this._identityService.id === (<IThreadInvitePayload>JSON.parse(notification.payload)).threadInvite.subjectId) {
                        switch (notification.action) {
                            case NotificationAction.Thread_InviteCreatedEvent:
                                this._handleInviteCreate(JSON.parse(notification.payload));
                                break;

                            case NotificationAction.Thread_InviteDeletedEvent:
                                this._handleInviteDelete(JSON.parse(notification.payload));
                                break;

                            default:
                                break;

                        }
                    }
                } catch (e) {
                    console.log('Notification error');
                    console.log(e);
                }
            });

        this._notificationService.ensureConnectionEstablished()
            .pipe(
                switchMap(() => this._notificationService.subscribeForUpdates(NotificationTopics.Invites))
            )
            .subscribe(res => {
            }, error => {
                console.log(error);
            });

        this._getInvites();
    }

    public ngOnDestroy() {
        this._notificationService.unSubscribeForUpdates(NotificationTopics.Invites)
            .subscribe();
        this._notificationSubscription.unsubscribe();
    }

    public handleScrollToBottom() {
        if (this._total > this.invites.length) {
            this._getInvites();
        }
    }

    private _getInvites() {
        this._threadService.getThreadInvitesForCurrentUser(this.invites.length).subscribe(resp => {
            this.invites = [...this.invites, ...resp.items];
            this._total = resp.total;
        });
    }

    public accept(invite: IThreadInvite, index: number) {
        this._threadService.acceptThreadInvite(invite.id)
            .subscribe(resp => {
                this.invites.splice(index, 1);
            });

    }

    public reject(invite: IThreadInvite, index: number) {
        this._dialog.open(ConfirmModalComponent)
            .afterClosed()
            .subscribe(confirm => {
                if (confirm) {
                    this._threadService.rejectThreadInvite(invite.id)
                        .subscribe(resp => {
                            this.invites.splice(index, 1);
                        });
                }
            });

    }

    private _handleInviteCreate(payload: IThreadInvitePayload) {
        this._userProfileService.getUserProfileById(payload.threadInvite.inviteCreatorId)
            .pipe(
                catchError((e) => {
                    return of(null);
                }))
            .subscribe(resp => {
            if (this.invites.findIndex(i => i.threadInvite.id === payload.threadInvite.id) === -1) {
                this.invites.unshift({
                    creator: resp,
                    thread: payload.thread,
                    threadInvite: payload.threadInvite,
                });
            }
        });
    }

    private _handleInviteDelete(payload: IThreadInvitePayload) {
        let index = this.invites.findIndex(i => i.threadInvite.id === payload.threadInvite.id);

        if (index !== -1) {
            this.invites.splice(index, 1);

        }
    }

}
