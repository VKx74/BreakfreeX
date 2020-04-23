import {Component, OnInit} from '@angular/core';
import {IPaginationResponse, PaginationComponent} from "@app/models/pagination.model";
import {EThreadType, IThread, IThreadBan, IThreadParticipant} from "../../../../Chat/models/thread";
import {ConfirmModalComponent, SearchHandler} from "UI";
import {JsUtil} from "../../../../../utils/jsUtil";
import {ActivatedRoute} from "@angular/router";
import {UsersService} from "@app/services/users.service";
import {MatDialog} from "@angular/material/dialog";
import {Observable, of} from "rxjs";
import {IThreadDetails} from "../../../resolvers/thread-details.resolver";
import {IInputModalConfig, InputModalComponent} from "../../../../UI/components/input-modal/input-modal.component";
import {ThreadManagerService} from "../thread-manager.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {ThreadResolverData} from "../../../data/models";
import {map} from "rxjs/operators";
import {ComponentIdentifier} from "@app/models/app-config";
import {ChatApiService} from "../../../../Chat/services/chat.api.service";

export interface ThreadMembersResolvedData {
    threadDetails: Observable<IThreadDetails>;
    bannedUsers: Observable<IThreadBan[]>;
    users: Observable<ThreadResolverData<IPaginationResponse<IThreadParticipant>>>;
}

export enum BanFilterKind {
    All,
    Banned,
    UnBanned
}

@Component({
    selector: 'thread-members',
    templateUrl: './thread-members.component.html',
    styleUrls: ['./thread-members.component.scss']
})
export class ThreadMembersComponent extends PaginationComponent<IThreadParticipant> implements OnInit {
    public participants: IThreadParticipant[];
    public banList: IThreadBan[] = [];

    public thread: IThread;
    public searchHandler: SearchHandler;
    public ThreadType = EThreadType;
    ComponentIdentifier = ComponentIdentifier;
    public banFilterKindArray: BanFilterKind[] = JsUtil.numericEnumToArray(BanFilterKind);
    public BanFilterKind = BanFilterKind;
    public activeFilterKind: BanFilterKind = BanFilterKind.All;
    public activeQuery: string = '';

    get threadId() {
        return this.thread.id;
    }

    get currentUserId() {
        return this._identityService.id;
    }

    get params() {
        return this.paginationParams.toOffsetLimit();
    }

    constructor(private _threadService: ChatApiService,
                private _route: ActivatedRoute,
                private _usersService: UsersService,
                private _threadManagerService: ThreadManagerService,
                private _identityService: IdentityService,
                private _dialog: MatDialog) {
        super();
    }

    ngOnInit() {
        (this._route.snapshot.data as ThreadMembersResolvedData).users
            .subscribe((res: ThreadResolverData<IPaginationResponse<IThreadParticipant>>) => {
                this.thread = res.thread;
                this.banList = res.bans;
                this.setPaginationHandler(res.data);
            });
    }

    public removeUserFromThread(participant: IThreadParticipant) {
        this._threadService.deleteUserFromThread(this.threadId, participant.subjectId)
            .subscribe(() => {
                this.resetPagination();
                // this.participants = this.participants.filter(p => participant.subjectId !== p.subjectId);
            });
    }

    public openBanModal(participant: IThreadParticipant) {
        this._dialog.open(InputModalComponent, {data: this.getCreateBanDialogData()})
            .afterClosed()
            .subscribe((value) => {
                if (value) {
                    this._threadService.createThreadBan({
                        description: value,
                        subjectId: participant.subjectId,
                        threadId: this.threadId
                    })
                        .subscribe(resp => {
                            participant.ban = resp;
                        }, e => {
                            console.log(e);
                        });
                }
            });
    }

    public openUpdateBanModal(participant: IThreadParticipant) {
        this._dialog.open(InputModalComponent, {data: this.getUpdateBanDialogData(participant)})
            .afterClosed()
            .subscribe((value) => {
                if (value) {
                    this._threadService.updateThreadBanById(participant.ban.id, {description: value})
                        .subscribe(resp => {
                            participant.ban = resp;
                        }, e => {
                            console.log(e);
                        });
                }
            });
    }

    public removeBan(participant: IThreadParticipant) {
        this._dialog.open(ConfirmModalComponent, {data: this.getRemoveBanDialogData()})
            .afterClosed()
            .subscribe((confirm) => {
                if (confirm) {
                    this._threadService.deleteThreadBanById((participant.ban as IThreadBan).id)
                        .subscribe(() => {
                            participant.ban = null;
                        });

                }
            });
    }

    getItems() {
        let obs: Observable<IPaginationResponse<IThreadParticipant>>;
        if (this.thread.type === EThreadType.Public) {
            obs = this._threadService.getPublicThreadParticipants(this.thread.id, this.paginationParams);
        } else {
            obs = this._threadService.getThreadParticipants(this.threadId, this.paginationParams);
        }

        return obs.pipe(
            map(res => Object.assign(res, {items: this.getMembersWithBanInfo(res.items)})),
        );
    }

    responseHandler(response): void {
        if (response) {
            this.participants = response[0].items;
        }
    }

    getMembersWithBanInfo(members: { id?: string; subjectId?: string, [key: string]: any }[]) {
        return members.map(member => {
            const memberId = member.subjectId || member.id;
            return {
                ...member,
                ban: this.banList.find(ban => ban.subjectId === memberId)
            };
        });
    }

    private getCreateBanDialogData(): IInputModalConfig {
        return {
            title: of('New ban'),
            errorText: of('Please, enter a valid reason'),
            buttonCaption: of('Ban'),
            inputCaption: of('Reason'),
        };
    }

    private getUpdateBanDialogData(participant: IThreadParticipant): IInputModalConfig {
        return {
            value: participant.ban.description,
            title: of('Update ban'),
            errorText: of('Please, enter a valid reason'),
            buttonCaption: of('Update ban'),
            inputCaption: of('Reason'),
        };
    }

    private getRemoveBanDialogData() {
        return {
            message: 'Remove user ban?'
        };
    }
}
