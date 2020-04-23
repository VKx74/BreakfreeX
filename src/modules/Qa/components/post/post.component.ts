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

@Component({
    selector: 'post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
    @Input() post: QuestionModel | AnswerModel;
    @Input() isQuestion: boolean;
    @Output() onRemoved = new EventEmitter<QuestionModel | AnswerModel>();
    @Output() onEdit = new EventEmitter();

    constructor(private _apiService: QaApiService,
                private _dialog: MatDialog,
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
    }

    delete() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                onConfirm: () => {
                    const obs = this.isQuestion
                        ? this._apiService.deleteQuestion(this.post.id)
                        : this._apiService.deleteAnswer(this.post.id);

                    obs.subscribe({
                        next: () => {
                            this.onRemoved.emit(this.post);
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
        return this.isQuestion ? (this.post as QuestionModel).tags : [];
    }

    handleTagClick(tagName: string) {
        this._helperService.showTaggedQuestions(tagName);
    }
}
