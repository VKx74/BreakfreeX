import {Component, OnInit} from '@angular/core';
import {IQuestionFormValues, QuestionFormComponentSubmitHandler} from "../question-form/question-form.component";
import {IUpdateQuestionParams, QuestionDTO} from "../../data/api";
import {catchError, tap} from "rxjs/operators";
import {QaRoutes} from "../../qa.routes";
import {of} from "rxjs";
import {QaApiService} from "../../services/api.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'edit-question',
    templateUrl: './edit-question.component.html',
    styleUrls: ['./edit-question.component.scss']
})
export class EditQuestionComponent implements OnInit {
    question: QuestionDTO;
    formValues: IQuestionFormValues;

    constructor(private _router: Router,
                private _route: ActivatedRoute,
                private _apiService: QaApiService) {
    }

    ngOnInit() {
        this.question = this._route.snapshot.data['question'];

        this.formValues = {
            title: this.question.title,
            message: this.question.message,
            tags: this.question.tags.map(t => t.name)
        };
    }

    submitHandler: QuestionFormComponentSubmitHandler = (values: IQuestionFormValues) => {
        const params: IUpdateQuestionParams = {
            id: this.question.id,
            title: values.title,
            message: values.message,
            tags: values.tags
        };

        return this._apiService.updateQuestion(params)
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
