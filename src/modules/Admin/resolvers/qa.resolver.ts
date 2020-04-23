import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {DepositDTO} from "@app/models/exchange/models";
import {BaseResolver} from "./base-resolver";
import {ExchangeManagementApiService} from "../services/exchange-management-api.service";
import {PaginationParams, IPaginationResponse} from "@app/models/pagination.model";
import {DiscussionDTO} from "../../DiscussionForum/data/api";
import {DiscussionsService} from "../../DiscussionForum/services/discussions.service";
import {QuestionDTO} from "../../Qa/data/api";
import {QuestionsService} from "../../Qa/services/questions.service";

@Injectable()
export class QAResolver extends BaseResolver<IPaginationResponse<QuestionDTO>> {
    constructor(private _questionsService: QuestionsService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPaginationResponse<QuestionDTO>> {
        return this._questionsService.getQuestionsList(new PaginationParams());
    }
}
