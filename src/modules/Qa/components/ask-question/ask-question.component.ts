import {Component, OnInit} from '@angular/core';
import {QaApiService} from "../../services/api.service";
import {ICreateQuestionParams, QuestionDTO} from "../../data/api";
import {ActivatedRoute, Router} from "@angular/router";
import {QaRoutes} from "../../qa.routes";
import {of} from "rxjs";
import {IQuestionFormValues, QuestionFormComponentSubmitHandler} from "../question-form/question-form.component";
import {tap, catchError} from "rxjs/operators";

@Component({
    selector: 'ask-question',
    templateUrl: './ask-question.component.html',
    styleUrls: ['./ask-question.component.scss']
})
export class AskQuestionComponent implements OnInit {
    constructor(private _apiService: QaApiService,
                private _router: Router,
                private _route: ActivatedRoute) {
    }

    ngOnInit() {
    }

    submitHandler: QuestionFormComponentSubmitHandler = (values: IQuestionFormValues) => {
        const params: ICreateQuestionParams = {
            title: values.title,
            message: values.message,
            tags: values.tags
        };

        return this._apiService.createQuestion(params)
            .pipe(
                tap((dto: QuestionDTO) => {
                    this._router.navigate([QaRoutes.Questions, dto.id], {
                        relativeTo: this._route.parent
                    });
                }),
                catchError((e) => {
                    console.error(e);
                    return of(null);
                })
            );
    }
}
