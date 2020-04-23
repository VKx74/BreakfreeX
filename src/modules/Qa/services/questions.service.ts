import {Observable, of} from "rxjs";
import {QuestionModel} from "../data/questions";
import {
    IBaseResponse,
    ICreateQuestionParams, IGetQuestionFiltrationParams,
    IGetQuestionParams,
    IUpdateQuestionParams,
    QuestionDTO
} from "../data/api";
import {Injectable} from "@angular/core";
import {flatMap, map} from "rxjs/operators";
import {QaApiService} from "./api.service";
import {ILoadPaginatedDataResult} from "@app/models/common/load-paginated-data-result";
import {
    CollectionResponseType,
    PaginationParams,
    IPaginationResponse,
    toBasePaginationResponse
} from "@app/models/pagination.model";

@Injectable()
export class QuestionsService {
    constructor(private _apiService: QaApiService) {
    }

    getQuestions(params = new PaginationParams(0, 10), filtrationParams?: IGetQuestionFiltrationParams): Observable<ILoadPaginatedDataResult<QuestionModel>> {
        return this._apiService.getQuestions(params, filtrationParams)
            .pipe(
                map((resp: IBaseResponse<QuestionDTO[]>) => {
                    const models = resp.data.map(dto => QuestionModel.fromDto(dto));

                    return {
                        data: models,
                        page: params.page,
                        pageSize: params.pageSize,
                        pageCount: Math.ceil(resp.total / params.pageSize),
                        itemsCount: resp.total
                    };
                })
            );
    }

    getQuestionsList(paginationParams?: PaginationParams, filtrationParams?: object): Observable<IPaginationResponse<QuestionDTO>> {
        return this._apiService.getQuestions(paginationParams, filtrationParams)
            .pipe(
                toBasePaginationResponse(CollectionResponseType.DataTotal)
            );
    }

    getQuestionsByTags(tag: string, pagination: PaginationParams): Observable<ILoadPaginatedDataResult<QuestionModel>> {
        return this._apiService.getQuestionsByTags(tag, pagination)
            .pipe(
                map((resp: IBaseResponse<QuestionDTO[]>) => {
                    const models = resp.data.map(dto => QuestionModel.fromDto(dto));

                    return {
                        data: models,
                        page: pagination.page,
                        pageSize: pagination.pageSize,
                        pageCount: Math.ceil(resp.total / pagination.pageSize),
                        itemsCount: resp.total
                    };
                })
            );
    }

    getQuestion(params: IGetQuestionParams): Observable<QuestionModel> {
        return this._apiService.getQuestion(params)
            .pipe(
                map((dto: QuestionDTO) => QuestionModel.fromDto(dto))
            );
    }

    createQuestion(params: ICreateQuestionParams): Observable<QuestionModel> {
        return this._apiService.createQuestion(params)
            .pipe(
                map((dto: QuestionDTO) => QuestionModel.fromDto(dto))
            );
    }

    deleteQuestion(id: string): Observable<any> {
        return this._apiService.deleteQuestion(id);
    }

    updateQuestion(params: IUpdateQuestionParams): Observable<QuestionModel> {
        return this._apiService.updateQuestion(params)
            .pipe(
                map((dto: QuestionDTO) => QuestionModel.fromDto(dto))
            );
    }
}
