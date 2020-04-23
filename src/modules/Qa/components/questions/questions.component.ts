import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QuestionModel} from "../../data/questions";
import {ILoadPaginatedDataResult} from "@app/models/common/load-paginated-data-result";
import {QuestionsService} from "../../services/questions.service";
import {switchMap} from "rxjs/operators";
import {PageEvent} from "@angular/material/paginator";
import {QaModuleBasePath} from "../../BasePath";
import {PaginationHandler, PaginationParams} from "@app/models/pagination.model";
import {SearchIconPosition} from "../../../UI/components/debounced-input/debounced-input.component";
import {DEFAULT_PAGINATION_PARAMS} from "../../data/api";

@Component({
    selector: 'questions',
    templateUrl: './questions.component.html',
    styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent implements OnInit {
    SearchIconPosition = SearchIconPosition;
    paginationHandler = new PaginationHandler();
    questions: QuestionModel[] = [];
    showPaginator: boolean;

    constructor(private _route: ActivatedRoute,
                @Inject(QaModuleBasePath) private _basePath: string,
                private _questionsService: QuestionsService) {
    }

    ngOnInit() {
        const resolveResult: ILoadPaginatedDataResult<QuestionModel> = this._route.snapshot.data['questions'];

        this.showPaginator = resolveResult.itemsCount > resolveResult.pageSize;

        this.questions = resolveResult.data;

        this.paginationHandler.setPaginationData({
            pageIndex: 0,
            itemsCount: resolveResult.itemsCount,
            pageSize: resolveResult.pageSize
        });


        this.paginationHandler.onPageChange$
            .pipe(
                switchMap((event: PageEvent) => {
                    return this._questionsService.getQuestions(new PaginationParams(event.pageIndex * event.pageSize, event.pageSize));
                })
            )
            .subscribe({
                next: this._handleQuestionsLoaded.bind(this),
                error: this._handleLoadQuestionsError.bind(this)
            });
    }

    search(searchTerm: string) {
        this._questionsService
            .getQuestions(new PaginationParams(0, 10), {
                search: searchTerm,
            })
            .subscribe(questions => {
                this.questions = questions.data;
            });
    }

    trackById(index: number, question: QuestionModel) {
        return question.id;
    }

    private _handleQuestionsLoaded(result: ILoadPaginatedDataResult<QuestionModel>) {
        this.questions = result.data;
        this.paginationHandler.setPaginationData({
            pageIndex: result.page,
            itemsCount: result.itemsCount,
            pageSize: result.pageSize
        });
    }

    private _handleLoadQuestionsError(e) {
        console.error(e);
    }
}
