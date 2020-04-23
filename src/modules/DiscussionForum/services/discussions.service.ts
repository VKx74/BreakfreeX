import {Injectable} from "@angular/core";
import {DiscussionForumApiService} from "./api.service";
import {map} from "rxjs/operators";
import {Observable, of} from "rxjs";
import {DiscussionDTO, IGetDiscussionParams} from "../data/api";
import {ILoadPaginatedDataResult} from "@app/models/common/load-paginated-data-result";
import {DiscussionModel} from "../data/discussions";
import {PaginationParams} from "@app/models/pagination.model";
import {UsersProfileService} from "@app/services/users-profile.service";

@Injectable()
export class DiscussionsService {
    constructor(private _apiService: DiscussionForumApiService,
                private _userProfileService: UsersProfileService) {
    }

    // IGetDiscussionParams
    getDiscussions(params: IGetDiscussionParams): Observable<ILoadPaginatedDataResult<DiscussionModel>> {
        return this._apiService.getDiscussions(params)
            .pipe(
                map((resp: ILoadPaginatedDataResult<DiscussionDTO>) => {
                    const models = resp.data.map(dto => DiscussionModel.fromDTO(dto));

                    return {
                        ...resp,
                        data: models
                    } as ILoadPaginatedDataResult<DiscussionModel>;
                })
            );
    }

    getDiscussionsList(paginationParams?: PaginationParams, filtrationParams?: object) {
        return this._apiService.getDiscussionsList(paginationParams, filtrationParams);
    }

    getDiscussion(id: string): Observable<DiscussionModel> {
        return this._apiService.getDiscussion(id)
            .pipe(
                map((dto: DiscussionDTO) => DiscussionModel.fromDTO(dto))
            );
    }
}
