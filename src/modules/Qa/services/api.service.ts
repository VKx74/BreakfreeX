import {
    DEFAULT_PAGINATION_PARAMS,
    IAnswerDTO,
    IBaseResponse,
    ICreateAnswerParams,
    ICreateCommentParams,
    ICreateQuestionParams, ICreator,
    IDeleteCommentParams,
    IGetAnswersParams, IGetQuestionFiltrationParams,
    IGetQuestionParams,
    IGetQuestionsByTagsParams,
    IGetQuestionsParams,
    IPopularTagDTO,
    IPostVoteResponse,
    IUpdateAnswerParams,
    IUpdateCommentParams,
    IUpdateQuestionParams,
    PostVote,
    QuestionDTO
} from "../data/api";
import {forkJoin, Observable, of} from "rxjs";
import {AppConfigService} from "@app/services/app.config.service";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {flatMap, map} from "rxjs/operators";
import {ICommentDTO} from "../data/comments";
import {ResponseError} from "@app/models/common/response-error";
import {UsersProfileService} from "@app/services/users-profile.service";
import {PaginationParams} from "@app/models/pagination.model";
import {QueryParamsConstructor} from "../../Admin/data/models";
import {UserProfileModel} from "@app/models/auth/auth.models";

type WithUsers<T> = {
    [P in keyof T]: T[P]
} & {users:
        {
            items: UserProfileModel[]
        }
};

@Injectable(
    {providedIn: "root"}
)
export class QaApiService {
    constructor(private _httpClient: HttpClient, private _userProfileService: UsersProfileService) {
    }

    // IGetQuestionsParams
    getQuestions(params = new PaginationParams(0, 10), filtrationParams?: IGetQuestionFiltrationParams): Observable<IBaseResponse<QuestionDTO[]>> {
        return this._getQuestions(
            `${AppConfigService.apiUrls.socialForumREST}Question`,
            QueryParamsConstructor.fromObject({
                ...filtrationParams,
                ...params.toSkipTake()
            })
        );
    }

    getQuestionsByTags(tag: string, params: PaginationParams): Observable<IBaseResponse<QuestionDTO[]>> {
        return this._getQuestions(
            `${AppConfigService.apiUrls.socialForumREST}Question/tag/${encodeURIComponent(tag)}`,
            params.toSkipTake()
        );
    }

    getFrequentQuestions(params: IGetQuestionsParams): Observable<IBaseResponse<QuestionDTO[]>> {
        return this._getQuestions(
            `${AppConfigService.apiUrls.socialForumREST}Question/Frequent`,
            {
                skip: (params.page * params.pageSize).toString(),
                take: params.pageSize.toString()
            }
        );
    }

    private _getQuestions(url: string, params: any): Observable<IBaseResponse<QuestionDTO[]>> {
        return this._request<QuestionDTO[], WithUsers<IBaseResponse<QuestionDTO[]>>>(
            this._httpClient.get<IBaseResponse<QuestionDTO[]>>(`${url}`, {
                params
            })
        )
            .pipe(
                map((r) => {
                    return {
                        data: r.data.map(item => (<QuestionDTO>{...item, creator: r.users.items.find(u => u.id === item.creatorId)})),
                        total: r.total
                    } as IBaseResponse<QuestionDTO[]>;
                })
            );
    }

    getQuestion(params: IGetQuestionParams): Observable<QuestionDTO> {
        return this._request<any, WithUsers<IBaseResponse<QuestionDTO>>>(
            this._httpClient.get<IBaseResponse>(`${AppConfigService.apiUrls.socialForumREST}Question/${params.id}`, {
                params: {
                    RefererUrl: params.refererUrl
                }
            })
        )
            .pipe(
                map((r) => ({...r.data, creator: r.users.items[0]}))
            );
    }

    createQuestion(params: ICreateQuestionParams): Observable<QuestionDTO> {
        return this._request<any, WithUsers<IBaseResponse<QuestionDTO>>>(
            this._httpClient.post<IBaseResponse>(`${AppConfigService.apiUrls.socialForumREST}Question`, params)
        )
            .pipe(
                map((r) => ({...r.data, creator: r.users.items[0]}))
            );
    }

    updateQuestion(params: IUpdateQuestionParams): Observable<QuestionDTO> {
        return this._request<any, WithUsers<IBaseResponse<QuestionDTO>>>(
            this._httpClient.put<IBaseResponse>(`${AppConfigService.apiUrls.socialForumREST}Question/${params.id}`, params)
        )
            .pipe(
                map((r) => ({...r.data, creator: r.users.items[0]}))
            );
    }

    deleteQuestion(id: string): Observable<any> {
        return this._request(
            this._httpClient.delete<any>(`${AppConfigService.apiUrls.socialForumREST}Question/${id}`)
        );
    }

    getAnswers(params: IGetAnswersParams): Observable<IBaseResponse<IAnswerDTO[]>> {
        return this._request<any, WithUsers<IBaseResponse<IAnswerDTO[]>>>(
            this._httpClient.get<WithUsers<IBaseResponse<IAnswerDTO[]>>>(`${AppConfigService.apiUrls.socialForumREST}Answer`, {
                params: {
                    questionId: params.questionId.toString(),
                    orderType: params.orderType != null ? params.orderType.toString() : null,
                    skip: (params.page * params.pageSize).toString(),
                    take: params.pageSize.toString()
                }
            })
        ).pipe(
            map((r) => {
                return {
                    data: r.data.map(item => ({...item, creator: r.users.items.find(u => u.id === item.creatorId)})),
                    total: r.total
                } as IBaseResponse<IAnswerDTO[]>;
            })
        );
    }

    getAnswer(id: string): Observable<IAnswerDTO> {
        return of(null);
    }

    createAnswer(params: ICreateAnswerParams): Observable<IAnswerDTO> {
        return this._request<any, WithUsers<IBaseResponse<IAnswerDTO>>>(
            this._httpClient.post<IBaseResponse<IAnswerDTO>>(`${AppConfigService.apiUrls.socialForumREST}Answer`, params)
        )
            .pipe(
                map((resp) => {
                    return {...resp.data, creator: resp.users.items[0]} as IAnswerDTO;
                })
            );
    }

    updateAnswer(params: IUpdateAnswerParams): Observable<IAnswerDTO> {
        return this._request<any, WithUsers<IBaseResponse<IAnswerDTO>>>(
            this._httpClient.put<IBaseResponse>(`${AppConfigService.apiUrls.socialForumREST}Answer/${params.id}`, params)
        )
            .pipe(map((resp) => {
                return {...resp.data, creator: resp.users.items[0]};
            }));
    }

    deleteAnswer(id: string): Observable<any> {
        return this._request(
            this._httpClient.delete<any>(`${AppConfigService.apiUrls.socialForumREST}Answer/${id}`)
        );
    }

    getComments(postId: string): Observable<ICommentDTO[]> {
        return this._request<any, WithUsers<IBaseResponse<ICommentDTO[]>>>(
            this._httpClient.get<IBaseResponse<ICommentDTO[]>>(`${AppConfigService.apiUrls.socialForumREST}Comment`, {
                params: {
                    postId
                }
            })
        )
            .pipe(
                map((resp) => {
                    return resp.data.map((item) => ({...item, creator: resp.users.items.find(u => u.id === item.creatorId)}));
                })
            );
    }

    createComment(params: ICreateCommentParams): Observable<ICommentDTO> {
        return this._request<any, WithUsers<IBaseResponse<ICommentDTO>>>(
            this._httpClient.post<IBaseResponse<ICommentDTO>>(`${AppConfigService.apiUrls.socialForumREST}Comment`, params)
        )
            .pipe(
                map((resp) => ({...resp.data, creator: resp.users.items[0]}))
            );
    }

    updateComment(params: IUpdateCommentParams): Observable<ICommentDTO> {
        return this._request<any, WithUsers<IBaseResponse<ICommentDTO>>>(
            this._httpClient.put<IBaseResponse<ICommentDTO>>(
                `${AppConfigService.apiUrls.socialForumREST}Comment/${params.id}?postId=${params.postId}`, params)
        )
            .pipe(
                map((resp) => ({...resp.data, creator: resp.users.items[0]}))
            );
    }

    deleteComment(params: IDeleteCommentParams): Observable<any> {
        return this._request(
            this._httpClient.delete(`${AppConfigService.apiUrls.socialForumREST}Comment/${params.id}`, {
                params: {
                    postId: params.postId
                }
            })
        );
    }

    vote(vote: PostVote, postId: string): Observable<IPostVoteResponse> {
        return this._request(
            this._httpClient.post<IBaseResponse>(`${AppConfigService.apiUrls.socialForumREST}Vote`, {
                vote: vote,
                postId: postId
            })
        )
            .pipe(
                map((resp) => resp.data)
            );
    }

    getPopularTags(): Observable<IPopularTagDTO[]> {
        return this._request(
            this._httpClient.get<IBaseResponse<IPopularTagDTO[]>>(`${AppConfigService.apiUrls.socialForumREST}Question/tags`)
        )
            .pipe(
                map((resp) => resp.data)
            );
    }

    private _request<T = any, R = IBaseResponse<T>>(requestObs: Observable<IBaseResponse<T> | any>): Observable<R> {
        return requestObs
            .pipe(
                map(this._errorHandler.bind(this))
            );
    }

    private _errorHandler<T = any>(resp: IBaseResponse<T>): IBaseResponse<T> {
        if (resp.error != null) {
            throw {
                errorCode: resp.error.errorType,
                errorDescription: resp.error.errorDescription
            } as ResponseError;
        }

        return resp;
    }

    // private _decodePostMessage<T>(post: {message: string}): T {
    //     post.message =
    // }
    //
    // private _decodePostMessage(messageBase64: string): string {
    //     ret
    // }
}
