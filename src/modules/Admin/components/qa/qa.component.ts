import {Component, OnInit} from '@angular/core';
import {DiscussionForumApiService} from "../../../DiscussionForum/services/api.service";
import {
    PaginationComponent,
    PaginationParams,
    IPaginationResponse,
    SkipTakeQueryParams
} from "@app/models/pagination.model";
import {Observable} from "rxjs";
import {PageEvent} from "@angular/material/typings/paginator";
import {DiscussionDTO} from "../../../DiscussionForum/data/api";
import {IGetQuestionsParams, QuestionDTO} from "../../../Qa/data/api";
import {QuestionsService} from "../../../Qa/services/questions.service";
import {
    IJSONViewDialogData,
    JSONViewDialogComponent
} from "../../../Shared/components/json-view/json-view-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {SearchHandler} from "UI";
import {MatDatepickerInputEvent} from "@angular/material/typings/datepicker";
import {ActivatedRoute} from "@angular/router";
import {FiltrationParams} from "@app/models/filtration-params";
import {ComponentIdentifier} from "@app/models/app-config";

interface IQAFiltrationParams {
    from;
    to;
    search: string;
}

class QAFiltrationParams extends FiltrationParams<IQAFiltrationParams> {
    from;
    to;
    search;

    clearDateParams() {
        this.from = null;
        this.to = null;
    }

    clear() {
        this.clearDateParams();
        this.search = null;
    }

    toObject(): IQAFiltrationParams {
        return {
            from: this.toJSON(this.from),
            to: this.toJSON(this.to),
            search: this.search
        };
    }
}

interface ResolverData {
    questions: Observable<IPaginationResponse<QuestionDTO>>;
}

@Component({
    selector: 'qa',
    templateUrl: './qa.component.html',
    styleUrls: ['./qa.component.scss'],
})
export class QAComponent extends PaginationComponent<QuestionDTO> implements OnInit {
    questions: QuestionDTO[];
    searchHandler = new SearchHandler();
    requestParams = new QAFiltrationParams();
    ComponentIdentifier = ComponentIdentifier;

    get from() {
        return this.requestParams.from;
    }

    set from(value) {
        this.requestParams.from = value;
    }

    get to() {
        return this.requestParams.to;
    }

    set to(value) {
        this.requestParams.to = value;
    }

    constructor(private _forumService: DiscussionForumApiService,
                private _questionsService: QuestionsService,
                private _dialog: MatDialog,
                private _activatedRoute: ActivatedRoute) {
        super();
    }

    ngOnInit() {
        const resolvedDiscussions = ((this._activatedRoute.snapshot.data as ResolverData).questions);
        resolvedDiscussions.subscribe(this.setPaginationHandler.bind(this));
    }

    getItems(): Observable<IPaginationResponse<QuestionDTO>> {
        return this._questionsService.getQuestionsList(this.paginationParams, this.requestParams.toObject());
    }

    responseHandler(response: [IPaginationResponse<QuestionDTO>, PageEvent]): void {
        this.questions = response[0].items;
    }

    showQuestionDetails(question: QuestionDTO) {
        this._dialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Question Details',
                json: question,
            }
        });
    }

    onFromDateChange(event: MatDatepickerInputEvent<any>) {
        this.from = event.value;
        this.resetPagination();
    }

    onToDateChange(event: MatDatepickerInputEvent<any>) {
        this.to = event.value;
        this.resetPagination();
    }

    clearDatePickers() {
        this.requestParams.clearDateParams();
        this.resetPagination();
    }

    search(searchTerm: string) {
        this.requestParams.search = searchTerm;
        this.resetPagination();
    }
}
