import {Injectable} from "@angular/core";
import {AnswerModel} from "../data/answers";
import {Observable, of} from "rxjs";
import {map} from "rxjs/operators";
import {IAnswerDTO, IBaseResponse, ICreateAnswerParams, IGetAnswersParams, IUpdateAnswerParams} from "../data/api";
import {ILoadPaginatedDataResult} from "@app/models/common/load-paginated-data-result";
import {QaApiService} from "./api.service";

@Injectable()
export class AnswersService {
    constructor(private _apiService: QaApiService) {
    }

    getAnswers(params: IGetAnswersParams): Observable<ILoadPaginatedDataResult<AnswerModel>> {
        return this._apiService.getAnswers(params)
            .pipe(
                map((resp: IBaseResponse<IAnswerDTO[]>) => {
                    const models = resp.data.map(dto => AnswerModel.fromDto(dto));

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

    getActiveAnswers(): Observable<AnswerModel[]> {
        return of([]);
    }

    getVotesAnswers(): Observable<AnswerModel[]> {
        return of([]);
    }

    getAnswer(id: string): Observable<AnswerModel> {
        return this._apiService.getAnswer(id)
            .pipe(
                map((dto: IAnswerDTO) => AnswerModel.fromDto(dto))
            );
    }

    createAnswer(params: ICreateAnswerParams): Observable<AnswerModel> {
        return this._apiService.createAnswer(params)
            .pipe(
                map((dto) => AnswerModel.fromDto(dto))
            );
    }

    updateAnswer(params: IUpdateAnswerParams): Observable<AnswerModel> {
        return this._apiService.updateAnswer(params)
            .pipe(
                map((dto: IAnswerDTO) => AnswerModel.fromDto(dto))
            );
    }

    deleteAnswer(id: string): Observable<any> {
        return this._apiService.deleteAnswer(id);
    }
}