import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {Injectable} from "@angular/core";
import {ICategoryDTO} from "../data/api";
import {DiscussionForumApiService} from "../services/api.service";
import {MAX_PAGE_SIZE} from "@app/models/pagination.model";

export interface ICreateUpdateDiscussionResolverData {
    categories: ICategoryDTO[];
}

@Injectable()
export class CreateUpdateDiscussionResolver implements Resolve<ICreateUpdateDiscussionResolverData> {
    constructor(private _apiService: DiscussionForumApiService) {
    }


    resolve(route: ActivatedRouteSnapshot): Observable<ICreateUpdateDiscussionResolverData> {
        return this._apiService.getCategories({page: 1, pageSize: MAX_PAGE_SIZE})
            .pipe(
                map((r) => r.data),
                map((categories: ICategoryDTO[]) => {
                    return {
                        categories
                    } as ICreateUpdateDiscussionResolverData;
                }),
                catchError((e) => {
                    console.error(e);

                    return of(null);
                })
            );
    }
}
