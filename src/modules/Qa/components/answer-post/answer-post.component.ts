import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AnswerModel} from "../../data/answers";
import {QaApiService} from "../../services/api.service";
import {MatDialog} from "@angular/material/dialog";
import {IPostVoteResponse, PostVote} from "../../data/api";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {ConfirmModalComponent} from "UI";
import {ResponseError} from "@app/models/common/response-error";
import {AnswerInputSubmitHandler} from "../answer-input/answer-input.component";
import {AnswersService} from "../../services/answers.service";
import {Roles} from "@app/models/auth/auth.models";
import {IdentityService} from "@app/services/auth/identity.service";

@Component({
    selector: 'answer-post',
    templateUrl: './answer-post.component.html',
    styleUrls: ['./answer-post.component.scss']
})
export class AnswerPostComponent implements OnInit {
    @Input() post: AnswerModel;
    @Output() onDeleted = new EventEmitter<AnswerModel>();
    @Output() onEdited = new EventEmitter<AnswerModel>();
    isEditing: boolean;

    canManage() {
        return this._identity.isAdmin || this.post.creatorId === this._identity.id;
    }

    constructor(private _apiService: QaApiService,
                private _answersService: AnswersService,
                private _identity: IdentityService,
                private _dialog: MatDialog) {
    }

    ngOnInit() {
    }

    voteHandler = (vote: PostVote) => {
        return this._apiService.vote(vote, this.post.id)
            .pipe(
                tap((resp: IPostVoteResponse) => {
                    this.post.vote = vote;
                    this.post.totalVoteCount = resp.total;
                }),
                catchError((e) => {
                    console.error(e);
                    return of(null);
                })
            );
    }

    edit() {
        this.isEditing = true;
    }

    handleCancelEdit() {
        this.cancelEdit();
    }

    cancelEdit() {
        this.isEditing = false;
    }

    delete() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                onConfirm: () => {
                    this._apiService.deleteAnswer(this.post.id).subscribe({
                        next: () => {
                            this.onDeleted.emit(this.post);
                        },
                        error: (e: ResponseError) => {
                            console.error(e);
                        }
                    });
                }
            }
        });
    }

    editAnswerSubmitHandler: AnswerInputSubmitHandler = (message: string) => {
        return this._answersService.updateAnswer({
            id: this.post.id,
            message: message
        })
            .pipe(
                tap((post: AnswerModel) => {
                    this.onEdited.emit(post);
                    this.cancelEdit();
                }),
                catchError((e) => {
                    console.error(e);
                    return of(null);
                })
            );
    }
}
