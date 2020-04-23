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
import {DiscussionsService} from "../../../DiscussionForum/services/discussions.service";
import {DiscussionModel} from "../../../DiscussionForum/data/discussions";
import {ActivatedRoute} from "@angular/router";
import {TzUtils} from "TimeZones";
import {FiltrationParams} from "@app/models/filtration-params";
import {ComponentIdentifier} from "@app/models/app-config";
import {DiscussionsForumRoutes} from "../../../DiscussionForum/discussion-forum.routes";
import {ForumTypeToUrl} from "../../../DiscussionForum/functions";
import {AppRoutes} from "AppRoutes";

export interface IForumRequestParams {
    from?: string;
    to?: string;
    search?: string;
}

class ForumFiltrationParams extends FiltrationParams<IForumRequestParams> implements IForumRequestParams {
    from;
    to;
    search;

    constructor() {
        super();
    }

    clearDateParams() {
        this.from = '';
        this.to = '';
    }

    toObject(): IForumRequestParams {
        // const from = this.toUTCMilliseconds(this.from);
        // const to = this.toUTCMilliseconds(this.to);
        return {
            // from: from ? from.toString() : null,
            // to: to ? to.toString() : null,
            from: this.toJSON(this.from),
            to: this.toJSON(this.to),
            search: this.search
        };
    }
}

interface ResolverData {
    discussions: Observable<IPaginationResponse<DiscussionDTO>>;
}

@Component({
    selector: 'forum',
    templateUrl: './forum.component.html',
    styleUrls: ['./forum.component.scss'],
    // providers: [QuestionsService]
})
export class ForumComponent extends PaginationComponent<DiscussionDTO> implements OnInit {
    discussions: DiscussionDTO[];
    searchHandler = new SearchHandler();
    requestParams = new ForumFiltrationParams();

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

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

    constructor(private _dialog: MatDialog,
                private _discussionsService: DiscussionsService,
                private _activatedRoute: ActivatedRoute) {
        super();
    }

    ngOnInit() {
        const resolvedDiscussions = ((this._activatedRoute.snapshot.data as ResolverData).discussions);
        resolvedDiscussions.subscribe(this.setPaginationHandler.bind(this));
    }

    getItems(): Observable<IPaginationResponse<DiscussionDTO>> {
        return this._discussionsService.getDiscussionsList(this.paginationParams, this.requestParams.toObject());
    }

    responseHandler(response: [IPaginationResponse<DiscussionDTO>, PageEvent]): void {
        this.discussions = response[0].items;
    }

    showDiscussionDetails(discussion: DiscussionDTO) {
        this._dialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Discussion Details',
                json: discussion,
            }
        });
    }

    clearDatePickers() {
        this.requestParams.clearDateParams();
        this.resetPagination();
    }

    search(searchTerm: string) {
        this.requestParams.search = searchTerm;
        this.resetPagination();
    }

    getDiscussionUrl(discussion: DiscussionDTO): string {
        return `/${AppRoutes.Landing}/${DiscussionsForumRoutes.Forums}/${ForumTypeToUrl(discussion.forumType)}/${DiscussionsForumRoutes.Discussions}/${discussion.id}`;
    }
}
