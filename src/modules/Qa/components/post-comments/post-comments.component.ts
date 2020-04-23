import {Component, Input, OnInit} from '@angular/core';
import {CommentModel} from "../../data/comments";
import {CommentsService} from "../../services/comments.service";
import {ProcessState} from "@app/helpers/ProcessState";
import {CommentInputSubmitHandler} from "../comment-input/comment-input.component";
import {tap} from "rxjs/operators";
import {JsUtil} from "../../../../utils/jsUtil";

@Component({
    selector: 'post-comments',
    templateUrl: './post-comments.component.html',
    styleUrls: ['./post-comments.component.scss']
})
export class PostCommentsComponent implements OnInit {
    @Input() postId: string;
    @Input() postHaveComments: boolean = true;

    loadCommentsProcessState = new ProcessState();
    addCommentProcessState = new ProcessState();

    comments: CommentModel[] = [];
    isInputShown: boolean = false;

    constructor(private _commentsService: CommentsService) {
    }

    ngOnInit() {
        if (this.postHaveComments) {
            this.loadCommentsProcessState.setPending();
            this._commentsService.getComments(this.postId)
                .subscribe({
                    next: (comments: CommentModel[]) => {
                        this.comments = comments;
                        this.loadCommentsProcessState.setSucceeded();
                    },
                    error: (e) => {
                        console.error(e);
                        this.loadCommentsProcessState.setFailed();
                    }
                });
        } else {
            this.loadCommentsProcessState.setSucceeded();
        }
    }

    addCommentHandler: CommentInputSubmitHandler = (text: string) => {
        return this._commentsService.createComment({
            postId: this.postId,
            message: text
        })
            .pipe(
                tap((comment: CommentModel) => {
                    this.comments.push(comment);
                    this.addCommentProcessState.setSucceeded();
                    this.hideCommentInput();
                })
            );
    }

    handleCommentRemoved(comment: CommentModel) {
        this.comments = this.comments.filter(c => c.id !== comment.id);
    }

    handleCommentUpdated(comment: CommentModel) {
        this.comments = JsUtil.replaceArrayItem<CommentModel>(this.comments, (c) => c.id === comment.id, comment);
    }

    showCommentInput() {
        this.isInputShown = true;
    }

    hideCommentInput() {
        this.isInputShown = false;
    }
}
