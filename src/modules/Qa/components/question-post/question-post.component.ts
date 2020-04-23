import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {QuestionModel} from "../../data/questions";
import {QaApiService} from "../../services/api.service";
import {QaHelperService} from "../../services/qa-helper.service";
import {IPostVoteResponse, PostVote} from "../../data/api";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {AnswerModel} from "../../data/answers";
import {ConfirmModalComponent} from "UI";
import {ResponseError} from "@app/models/common/response-error";
import {MatDialog} from "@angular/material/dialog";
import {IdentityService} from "@app/services/auth/identity.service";
import {Roles} from "@app/models/auth/auth.models";

@Component({
    selector: 'question-post',
    templateUrl: './question-post.component.html',
    styleUrls: ['./question-post.component.scss']
})
export class QuestionPostComponent implements OnInit {
    @Input() post: QuestionModel;
    @Output() onDeleted = new EventEmitter<QuestionModel | AnswerModel>();
    @Output() onEdit = new EventEmitter();

    canManage() {
        return this._identityService.isAdmin || this.post.creatorId === this._identityService.id;
    }

    constructor(private _apiService: QaApiService,
                private _dialog: MatDialog,
                private _identityService: IdentityService,
                private _helperService: QaHelperService) {
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
        this.onEdit.next();
    }

    delete() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                onConfirm: () => {
                    this._apiService.deleteQuestion(this.post.id).subscribe({
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

    getTags(): { name: string }[] {
        return this.post.tags;
    }

    handleTagClick(tagName: string) {
        this._helperService.showTaggedQuestions(tagName);
    }
}
