import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {QuestionModel} from "../data/questions";
import {Observable, of} from "rxjs";
import {QuestionsService} from "../services/questions.service";
import {Injectable} from "@angular/core";
import {IdentityService} from "@app/services/auth/identity.service";
import {catchError, map} from "rxjs/operators";

export interface IQuestionResolverValue {
    question: QuestionModel;
    allowAnswering: boolean;
}


@Injectable()
export class QuestionResolver implements Resolve<IQuestionResolverValue> {
    constructor(private _identityService: IdentityService,
                private _questionsService: QuestionsService) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<IQuestionResolverValue | null> {
        const id = route.params['id'];
        const refererUrl = ""; //document.referrer;
        const isAuthorized = this._identityService.isAuthorized;

        return this._questionsService.getQuestion({
            id: id,
            refererUrl: refererUrl
        })
            .pipe(
                map((question: QuestionModel) => {
                    return {
                        question,
                        allowAnswering: isAuthorized
                    } as IQuestionResolverValue;
                }),
                catchError((e) => {
                    console.error(e);
                    return of(null);
                })
            );
    }
}