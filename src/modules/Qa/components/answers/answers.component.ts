import {Component, Input, OnInit} from '@angular/core';
import {ITab} from "../tabs/tabs.component";
import {QuestionModel} from "../../data/questions";
import {AnswersService} from "../../services/answers.service";
import {GetAnswersOrderType, IGetAnswersParams} from "../../data/api";
import {BehaviorSubject, merge, Observable, of, Subject} from "rxjs";
import {AnswerModel} from "../../data/answers";
import {ILoadPaginatedDataResult} from "@app/models/common/load-paginated-data-result";
import {catchError, mapTo, startWith, switchMap, tap} from "rxjs/operators";
import {JsUtil} from "../../../../utils/jsUtil";
import {AnswerInputSubmitHandler} from "../answer-input/answer-input.component";
import {QaApiService} from "../../services/api.service";
import {PaginationHandler} from "@app/models/pagination.model";

interface ISortAnswerTab extends ITab {
    orderType: GetAnswersOrderType;
}

const AnswerSortTabs: ISortAnswerTab[] = [
    {
        id: '0',
        label: 'Active',
        orderType: GetAnswersOrderType.Active
    },
    {
        id: '1',
        label: 'Oldest',
        orderType: GetAnswersOrderType.Oldest
    },
    {
        id: '2',
        label: 'Votes',
        orderType: GetAnswersOrderType.Votes
    }
];


@Component({
    selector: 'answers',
    templateUrl: './answers.component.html',
    styleUrls: ['./answers.component.scss']
})
export class AnswersComponent implements OnInit {
    @Input() question: QuestionModel;
    answers: AnswerModel[];
    totalAnswersCount: number;

    answerTabs: ISortAnswerTab[] = AnswerSortTabs;
    selectedAnswerTab$ = new BehaviorSubject<ISortAnswerTab>(AnswerSortTabs[0]);

    paginationHandler = new PaginationHandler();
    loadData$: Observable<number>;

    answersUpdated$ = new Subject();
    showPaginator: boolean;

    constructor(private _answersService: AnswersService,
                private _apiService: QaApiService) {
    }

    ngOnInit() {
        this.paginationHandler.setPaginationData({
            pageIndex: 0,
            itemsCount: 0,
            pageSize: 10
        });

        this.loadData$ = merge(
            this.paginationHandler.onPageChange$.pipe(mapTo(null)),

            merge(
                this.answersUpdated$,
                this.selectedAnswerTab$
                    .pipe(
                        startWith(this.selectedAnswerTab$.getValue())
                    )
            ).pipe(mapTo(0))
        );

        this.loadData$
            .pipe(
                startWith(null),
                switchMap((page?: number) => {
                    return this._loadAnswers({
                        questionId: this.question.id,
                        orderType: this.selectedAnswerTab$.getValue().orderType,
                        page: page != null ? page : this._getPageIndex(),
                        pageSize: 10
                    });
                })
            )
            .subscribe({
                next: this._handleLoadedAnswers.bind(this),
                error: this._handleLoadAnswersError.bind(this)
            });

        this.totalAnswersCount = this.question.totalAnswersCount;
    }

    answerInputSubmitHandler: AnswerInputSubmitHandler = (message: string) => {
        return this._apiService.createAnswer({
            questionId: this.question.id,
            message: message
        })
            .pipe(
                tap(() => {
                    this.answersUpdated$.next();
                }),
                catchError((e) => {
                    console.error(e);
                    return of(null);
                })
            );
    }

    handleAnswerDeleted(answer: AnswerModel) {
        this.answers = this.answers.filter(a => a.id !== answer.id);
        this.answersUpdated$.next();
    }

    handleAnswerEdited(answer: AnswerModel) {
        this.answers = JsUtil.replaceArrayItem(this.answers, (a) => a.id === answer.id, answer);
    }

    handleAnswerTabChange(tab: ITab) {
        this.selectedAnswerTab$.next(tab as ISortAnswerTab);
    }

    private _getPageIndex(): number {
        return this.paginationHandler.getPaginationData().pageIndex;
    }

    private _loadAnswers(params: IGetAnswersParams): Observable<ILoadPaginatedDataResult<AnswerModel>> {
        return this._answersService.getAnswers(params);
    }

    private _handleLoadedAnswers(result: ILoadPaginatedDataResult<AnswerModel>) {
        this.paginationHandler.setPaginationData({
            pageIndex: result.page,
            itemsCount: result.itemsCount,
            pageSize: result.pageSize
        });

        this.answers = result.data;
        this.totalAnswersCount = result.itemsCount;
        this.showPaginator = result.itemsCount > result.pageSize;
    }

    private _handleLoadAnswersError(error: any) {
        console.error(error);
    }

}
