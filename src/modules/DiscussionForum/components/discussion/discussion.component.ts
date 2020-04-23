import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DiscussionModel} from "../../data/discussions";
import {IdentityService} from "@app/services/auth/identity.service";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmModalComponent} from "UI";
import {switchMap} from "rxjs/operators";
import {DiscussionForumApiService} from "../../services/api.service";
import {EMPTY} from "rxjs";
import {AlertService} from "@alert/services/alert.service";

@Component({
    selector: 'discussion',
    templateUrl: './discussion.component.html',
    styleUrls: ['./discussion.component.scss']
})
export class DiscussionComponent implements OnInit {
    @Input() discussion: DiscussionModel;
    @Output() deleted = new EventEmitter<DiscussionModel>();
    @Output() edit = new EventEmitter<DiscussionModel>();

    canManage() {
        return this._identity.isAdmin || this.discussion.creatorId === this._identity.id;
    }

    constructor(private _identity: IdentityService,
                private _dialog: MatDialog,
                private _discussionsService: DiscussionForumApiService,
                private _alertService: AlertService
    ) {
    }

    ngOnInit() {
    }

    deleteDiscussion() {
        this._dialog.open(ConfirmModalComponent)
            .afterClosed()
            .pipe(
                switchMap(dialogConfirmation => dialogConfirmation ? this._discussionsService.deleteDiscussion(this.discussion.id) : EMPTY)
            ).subscribe(
            () => {
                this.deleted.emit(this.discussion);
            },
            (err) => {
                this._alertService.error('Discussion cannot be deleted');
            }
        );
    }

    editDiscussion() {
        this.edit.emit(this.discussion);
    }
}
