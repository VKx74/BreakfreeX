import {Component, Inject, OnInit} from '@angular/core';
import {QuestionModel} from "../../data/questions";
import {ActivatedRoute, Data, Router} from "@angular/router";
import {IQuestionResolverValue} from "../../resolvers/question.resolver";
import {QaModuleBasePath} from "../../BasePath";
import {QaRoutes} from "../../qa.routes";

@Component({
    selector: 'question-detailed',
    templateUrl: './question-detailed.component.html',
    styleUrls: ['./question-detailed.component.scss']
})
export class QuestionDetailedComponent implements OnInit {
    question: QuestionModel;

    constructor(private _route: ActivatedRoute,
                private _router: Router,
                @Inject(QaModuleBasePath) private _basePath: string) {
    }

    ngOnInit() {
        const resolvedValue = this._route.snapshot.data['question'] as IQuestionResolverValue;

        this.question = resolvedValue.question;
    }

    handleQuestionEdit() {
        this._router.navigateByUrl(`${this._basePath}/${QaRoutes.Questions}/edit/${this.question.id}`);
    }

    handleQuestionDeleted() {
        this._router.navigateByUrl(`${this._basePath}/${QaRoutes.Questions}`);
    }
}
