import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {QuestionModel} from "../data/questions";
import {Observable, of} from "rxjs";
import {QuestionsService} from "../services/questions.service";
import {catchError} from "rxjs/operators";
import {Injectable} from "@angular/core";
import {ILoadPaginatedDataResult} from "@app/models/common/load-paginated-data-result";
import {PaginationParams} from "@app/models/pagination.model";

@Injectable()
export class QuestionsResolver implements Resolve<ILoadPaginatedDataResult<QuestionModel>> {
    constructor(private _questionsService: QuestionsService) {
    }


    resolve(route: ActivatedRouteSnapshot): Observable<ILoadPaginatedDataResult<QuestionModel>> {
        let tag: string = route.queryParams['tag'];
        let obs = tag != null
            ? this._questionsService.getQuestionsByTags(tag, new PaginationParams(0, 10))
            : this._questionsService.getQuestions(new PaginationParams(0, 10));

        return obs
            .pipe(
                catchError((e) => {
                    console.error(e);

                    return of(null);
                })
            );
    }
}
