import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {Observable, of} from "rxjs";
import {catchError} from "rxjs/operators";
import {Injectable} from "@angular/core";
import {ILoadPaginatedDataResult} from "@app/models/common/load-paginated-data-result";
import {DiscussionsService} from "../services/discussions.service";
import {DiscussionModel} from "../data/discussions";
import {getForumTypeFromRoute} from "../functions";
import {getPageQueryParamValue} from "../../../functions";

export interface IDiscussionsQueryParams {
    page?: string;
}

@Injectable()
export class DiscussionsResolver implements Resolve<ILoadPaginatedDataResult<DiscussionModel>> {
    constructor(private _discussionsService: DiscussionsService) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<ILoadPaginatedDataResult<DiscussionModel>> {
        return this._discussionsService.getDiscussions({
            page: getPageQueryParamValue((route.queryParams as IDiscussionsQueryParams).page),
            pageSize: 15,
            forumTypes: [getForumTypeFromRoute(route.data)]
        })
            .pipe(
                catchError((e) => {
                    console.error(e);

                    return of(null);
                })
            );
    }
}
