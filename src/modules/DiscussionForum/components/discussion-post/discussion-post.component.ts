import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DiscussionPostModel} from "../../data/discussion-posts";
import {IdentityService} from "@app/services/auth/identity.service";
import {DiscussionForumApiService} from "../../services/api.service";
import {MatDialog} from "@angular/material/dialog";
import {switchMap} from "rxjs/operators";
import {EMPTY} from "rxjs";
import {ConfirmModalComponent} from "UI";
import {DiscussionPostsService} from "../../services/discussion-posts.service";

@Component({
    selector: 'discussion-post',
    templateUrl: './discussion-post.component.html',
    styleUrls: ['./discussion-post.component.scss']
})
export class DiscussionPostComponent implements OnInit {
    @Input() post: DiscussionPostModel;
    @Output() delete = new EventEmitter<DiscussionPostModel>();
    @Output() postEdited = new EventEmitter<DiscussionPostModel>();
    isInEditMode = false;

    canManage() {
        return this._identity.isAdmin || this.post.creatorId === this._identity.id;
    }

    constructor(private _identity: IdentityService,
                private _discussionService: DiscussionForumApiService,
                private _dialog: MatDialog) {
    }

    ngOnInit() {
    }

    onPostDelete() {
        this._dialog.open(ConfirmModalComponent)
            .afterClosed()
            .pipe(
                switchMap(dialogConfirm => dialogConfirm ? this._discussionService.deleteDiscussionPost(this.post.id) : EMPTY)
            ).subscribe(
            (res) => {
                if (res) {
                    this.delete.emit(this.post);
                }
            },
            // () => this._alertService.error('Failed to remove message')
        );
    }

    onPostEdited(post: DiscussionPostModel) {
        this.postEdited.emit(post);
        this.isInEditMode = false;
    }

    edit() {
    }

    toggleEdit() {
        this.isInEditMode = !this.isInEditMode;
    }

}
