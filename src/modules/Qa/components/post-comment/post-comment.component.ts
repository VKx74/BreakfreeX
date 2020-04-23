import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommentModel, ICommentDTO} from "../../data/comments";
import {MatDialog} from "@angular/material/dialog";
import {QaApiService} from "../../services/api.service";
import {ConfirmModalComponent} from "UI";
import {ResponseError} from "@app/models/common/response-error";
import {CommentInputSubmitHandler} from "../comment-input/comment-input.component";
import {tap} from "rxjs/operators";
import {IdentityService} from "@app/services/auth/identity.service";

@Component({
    selector: 'post-comment',
    templateUrl: './post-comment.component.html',
    styleUrls: ['./post-comment.component.scss']
})
export class PostCommentComponent implements OnInit {
    @Input() comment: CommentModel;
    @Input() postId: string;
    @Output() onRemoved = new EventEmitter<CommentModel>();
    @Output() onUpdated = new EventEmitter<CommentModel>();

    isInEditMode: boolean;

    canManage() {
        return this._identityService.isAdmin || this.comment.creatorId === this._identityService.id;
    }

    constructor(private _dialog: MatDialog,
                private _identityService: IdentityService,
                private _apiService: QaApiService) {
    }

    ngOnInit() {
    }

    delete() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                onConfirm: () => {
                    this._apiService.deleteComment({
                        id: this.comment.id,
                        postId: this.postId
                    })
                        .subscribe({
                            next: () => {
                                this.onRemoved.next(this.comment);
                            },
                            error: (e: ResponseError) => {
                                console.error(e);
                            }
                        });
                }
            }
        });
    }

    edit() {
        this.isInEditMode = true;
    }

    editCommentHandler: CommentInputSubmitHandler = (text: string) => {
        return this._apiService.updateComment({
            id: this.comment.id,
            message: text,
            postId: this.postId
        })
            .pipe(
                tap((dto: ICommentDTO) => {
                    const model = CommentModel.fromDTO(dto);
                    model.creator = this.comment.creator;

                    this.onUpdated.next(model);
                    this.cancelEdit();
                })
            );
    }

    handleEditCancel() {
        this.cancelEdit();
    }

    cancelEdit() {
        this.isInEditMode = false;
    }
}
