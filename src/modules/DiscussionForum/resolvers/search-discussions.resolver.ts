import {ActivatedRoute, ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {forkJoin, Observable, of} from "rxjs";
import {catchError, map, tap} from "rxjs/operators";
import {Injectable} from "@angular/core";
import {ILoadPaginatedDataResult} from "@app/models/common/load-paginated-data-result";
import {DiscussionsService} from "../services/discussions.service";
import {DiscussionModel} from "../data/discussions";
import {ForumType} from "../enums/enums";
import {ICategoryDTO} from "../data/api";
import {DiscussionForumApiService} from "../services/api.service";
import {JsUtil} from "../../../utils/jsUtil";
import {allForumTypes} from "../functions";
import {IDiscussionsQueryParams} from "./discussions.resolver";
import {getPageQueryParamValue} from "../../../functions";
import {MAX_PAGE_SIZE} from "@app/models/pagination.model";

export interface SearchDiscussionsQueryParams {
    query: string;
    categories?: string[];
    forumTypes?: ForumType | ForumType[];
    page?: string;
}

export interface ISearchDiscussionsResolverValue {
    discussions: ILoadPaginatedDataResult<DiscussionModel>;
    categories: ICategoryDTO[];
}

@Injectable()
export class SearchDiscussionsResolver implements Resolve<ISearchDiscussionsResolverValue> {
    constructor(private _discussionsService: DiscussionsService,
                private _apiService: DiscussionForumApiService,
                private _route: ActivatedRoute) {
    }


    resolve(route: ActivatedRouteSnapshot): Observable<ISearchDiscussionsResolverValue> {
        const searchParams = route.queryParams as SearchDiscussionsQueryParams;
        let category: string = null;

        if (searchParams.categories) {
            category = Array.isArray(searchParams.categories) ? searchParams.categories[0] : searchParams.categories;
        }

        return (forkJoin({
            discussions: this._discussionsService.getDiscussions({
                page: getPageQueryParamValue(searchParams.page),
                pageSize: 15,
                search: searchParams.query || '',
                forumTypes: searchParams.forumTypes
                    ? JsUtil.flattenArray([searchParams.forumTypes]).map(t => parseInt(t as string, 10))
                    : allForumTypes(),
                categoryId: category
            }),
            categories: this._apiService.getCategories({page: 1, pageSize: MAX_PAGE_SIZE}).pipe(map(r => r.data))
        }) as Observable<ISearchDiscussionsResolverValue>)
            .pipe(
                catchError((e) => {
                    console.error(e);
                    return of(null);
                })
            );

    }
}
