import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {Injectable} from "@angular/core";
import {ICategoryDTO} from "../data/api";
import {DiscussionForumApiService} from "../services/api.service";
import {ILoadPaginatedDataResult} from "@app/models/common/load-paginated-data-result";
import {MAX_PAGE_SIZE} from "@app/models/pagination.model";

@Injectable()
export class CategoriesResolver implements Resolve<ILoadPaginatedDataResult<ICategoryDTO>> {
    constructor(private _apiService: DiscussionForumApiService) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<ILoadPaginatedDataResult<ICategoryDTO>> {
        return this._apiService.getCategories({page: 1, pageSize: MAX_PAGE_SIZE})
            .pipe(
                map((r) => r.data),
                catchError((e) => {
                    console.error(e);

                    return of(null);
                })
            );
    }
}
