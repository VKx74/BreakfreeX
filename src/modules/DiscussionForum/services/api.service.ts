import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {AppConfigService} from "@app/services/app.config.service";
import {
    DiscussionDTO,
    DiscussionPostDTO,
    IBaseResponse, ICategoryDTO, ICreateCategoryParams,
    ICreateDiscussionParams,
    ICreateDiscussionPostParams,
    IGetDiscussionParams,
    IGetDiscussionPostsParams, IUpdateCategoryParams,
    IUpdateDiscussionParams,
    IUpdateDiscussionPostParams
} from "../data/api";
import {map} from "rxjs/operators";
import {
    CollectionResponseType,
    IDataTotalResponse, PaginationParams,
    IPaginationResponse,
    toBasePaginationResponse, IPaginationParams
} from "@app/models/pagination.model";
import {QueryParamsConstructor} from "../../Admin/data/models";
import {ForumType} from "../enums/enums";
import {ILoadPaginatedDataResult} from "@app/models/common/load-paginated-data-result";
import {Injectable} from "@angular/core";
import {UserProfileModel} from "@app/models/auth/auth.models";

type WithUsers<T> = {
    [P in keyof T]: T[P]
} & {users:
        {
            items: UserProfileModel[]
        }
};

@Injectable()
export class DiscussionForumApiService {

    constructor(private _httpClient: HttpClient) {
    }

    getDiscussions(params: IGetDiscussionParams): Observable<ILoadPaginatedDataResult<DiscussionDTO>> {
        let requestParams: any = {
            skip: ((params.page - 1) * params.pageSize).toString(),
            take: params.pageSize.toString(),
            forumType: params.forumTypes.reduce((acc: any, v: any) => {
                // tslint:disable-next-line
                return acc | v;
            }, "0"),
            popular: params.popular
        };

        if (params.search && params.search.length) {
            requestParams.search = params.search;
        }

        if (params.categoryId) {
            requestParams.categoryId = params.categoryId;
        }

        return this._httpClient.get<WithUsers<IBaseResponse<DiscussionDTO[]>>>(`${AppConfigService.apiUrls.socialForumREST}Discussion`, {
            params: requestParams
        })
            .pipe(
                map((resp) => {
                    if (resp.data) {
                        return {
                            page: params.page,
                            pageSize: params.pageSize,
                            itemsCount: resp.total,
                            data: resp.data.map((item) => ({...item, creatorModel: resp.users.items.find(u => u.id === item.creatorId)}))
                        } as ILoadPaginatedDataResult<DiscussionDTO>;
                    }

                    throw new Error(resp.error);
                })
            );
    }

    getDiscussionsList(paginationParams = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<DiscussionDTO>> {
        return this._httpClient.get<WithUsers<IDataTotalResponse<DiscussionDTO>>>(`${AppConfigService.apiUrls.socialForumREST}Discussion`, {
            params: QueryParamsConstructor.fromObjects(paginationParams.toSkipTake(), filtrationParams)
        }).pipe(
            map((r) => {
                return {
                    items: r.data.map(item => ({...item, creator: r.users.items.find((u) => u.id === item.creatorId)} as DiscussionDTO)),
                    total: r.total
                } as IPaginationResponse<DiscussionDTO>;
            })
        );
    }

    getDiscussion(id: string): Observable<DiscussionDTO> {
        return this._httpClient.get<WithUsers<IBaseResponse<DiscussionDTO>>>(`${AppConfigService.apiUrls.socialForumREST}Discussion/${id}`)
            .pipe(
                map((resp) => ({...resp.data, creatorModel: resp.users.items[0]}) as DiscussionDTO)
            );
    }

    createDiscussion(params: ICreateDiscussionParams): Observable<DiscussionDTO> {
        return this._httpClient.post<WithUsers<IBaseResponse>>(`${AppConfigService.apiUrls.socialForumREST}Discussion`, params)
            .pipe(
                map((resp) => {
                    if (resp.data) {
                        return {...resp.data, creatorModel: resp.users.items[0]} as DiscussionDTO;
                    }

                    throw new Error(resp.error);
                }));
    }

    updateDiscussion(id: string, params: IUpdateDiscussionParams): Observable<DiscussionDTO> {
        return this._httpClient.put<WithUsers<IBaseResponse>>(`${AppConfigService.apiUrls.socialForumREST}Discussion/${id}`, params)
            .pipe(map((resp) => ({...resp.data, creatorModel: resp.users.items[0]}) as DiscussionDTO));
    }

    deleteDiscussion(id: string): Observable<any> {
        return this._httpClient.delete<IBaseResponse>(`${AppConfigService.apiUrls.socialForumREST}Discussion/${id}`);
    }

    getDiscussionPosts(params: IGetDiscussionPostsParams): Observable<IBaseResponse<DiscussionPostDTO[]>> {
        return this._httpClient.get<WithUsers<IBaseResponse<DiscussionPostDTO[]>>>(`${AppConfigService.apiUrls.socialForumREST}DiscussionMessage/discussion/${params.discussionId}`, {
            params: {
                skip: ((params.page - 1) * params.pageSize).toString(),
                take: params.pageSize.toString()
            }
        })
            .pipe(
                map((r) => {
                    return {...r, data: r.data.map(item => ({...item, creator: r.users.items.find(u => u.id === item.creatorId)}))};
                })
            );
    }

    createDiscussionPost(params: ICreateDiscussionPostParams): Observable<DiscussionPostDTO> {
        return this._httpClient.post<WithUsers<IBaseResponse<DiscussionPostDTO>>>(`${AppConfigService.apiUrls.socialForumREST}DiscussionMessage/discussion/${params.discussionId}`, {
            message: params.message
        })
            .pipe(map((resp) => ({...resp.data, creator: resp.users.items[0]}) as DiscussionPostDTO));
    }

    updateDiscussionPost(params: IUpdateDiscussionPostParams): Observable<DiscussionPostDTO> {
        return this._httpClient.put<WithUsers<IBaseResponse<DiscussionPostDTO>>>(`${AppConfigService.apiUrls.socialForumREST}DiscussionMessage/${params.id}`, {
            message: params.message
        })
            .pipe(map((resp) =>  ({...resp.data, creator: resp.users.items[0]}) as DiscussionPostDTO));
    }

    deleteDiscussionPost(id: string): Observable<any> {
        return this._httpClient.delete<IBaseResponse<any>>(`${AppConfigService.apiUrls.socialForumREST}DiscussionMessage/${id}`);
    }

    getCategories(params: IPaginationParams): Observable<ILoadPaginatedDataResult<ICategoryDTO>> {
        return this._httpClient.get<IBaseResponse<ICategoryDTO[]>>(`${AppConfigService.apiUrls.socialForumREST}Categories`, {
            params: {
                skip: ((params.page - 1) * params.pageSize).toString(),
                take: params.pageSize.toString()
            }
        })
            .pipe(
                map((resp) => {
                    return {
                        page: params.page,
                        pageSize: params.pageSize,
                        itemsCount: resp.total,
                        data: resp.data
                    } as ILoadPaginatedDataResult<ICategoryDTO>;
                })
            );
    }

    createCategory(params: ICreateCategoryParams): Observable<ICategoryDTO> {
        return this._httpClient.post<ICategoryDTO>(`${AppConfigService.apiUrls.socialForumREST}Categories?Name=${params.name}&Description=${params.description}`, null);
    }

    updateCategory(id: string, params: IUpdateCategoryParams): Observable<ICategoryDTO> {
        return this._httpClient.put<ICategoryDTO>(`${AppConfigService.apiUrls.socialForumREST}Categories/${id}`, params);
    }

    deleteCategory(id: string): Observable<any> {
        return this._httpClient.delete(`${AppConfigService.apiUrls.socialForumREST}Categories/${id}`);
    }

    getPopularCategories(forumType?: ForumType, count = 6): Observable<ICategoryDTO[]> {
        let params = {
            postType: '5', // PostType.Discussion
            count: count.toString()
        };
        if (forumType != null) {
            params['forumType'] = forumType.toString();
        }
        return this._httpClient.get<ICategoryDTO[]>(`${AppConfigService.apiUrls.socialForumREST}Categories/top`, {params});
    }
}
