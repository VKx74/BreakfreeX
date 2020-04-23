import {DiscussionForumApiService} from "./api.service";
import {Injectable} from "@angular/core";
import {
    DiscussionPostDTO,
    ICreateDiscussionPostParams,
    IGetDiscussionPostsParams,
    IUpdateDiscussionPostParams
} from "../data/api";
import {Observable} from "rxjs";
import {DiscussionPostModel} from "../data/discussion-posts";
import {map} from "rxjs/operators";
import {IBaseResponse} from "../../Qa/data/api";
import {ILoadPaginatedDataResult} from "@app/models/common/load-paginated-data-result";

@Injectable()
export class DiscussionPostsService {
    constructor(private _apiService: DiscussionForumApiService) {
    }

    getDiscussionPosts(params: IGetDiscussionPostsParams): Observable<ILoadPaginatedDataResult<DiscussionPostModel>> {
        return this._apiService.getDiscussionPosts(params)
            .pipe(
                map((resp: IBaseResponse<DiscussionPostDTO[]>) => {
                    const models = resp.data.map(dto => DiscussionPostModel.fromDTO(dto));

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

    createDiscussionPost(params: ICreateDiscussionPostParams): Observable<DiscussionPostModel> {
        return this._apiService.createDiscussionPost(params)
            .pipe(
                map((dto: DiscussionPostDTO) => DiscussionPostModel.fromDTO(dto))
            );
    }

    updateDiscussionPost(params: IUpdateDiscussionPostParams): Observable<DiscussionPostModel> {
        return this._apiService.updateDiscussionPost(params)
            .pipe(
                map((dto: DiscussionPostDTO) => DiscussionPostModel.fromDTO(dto))
            );
    }

    deleteDiscussionPost(id: string): Observable<any> {
        return this._apiService.deleteDiscussionPost(id);
    }
}