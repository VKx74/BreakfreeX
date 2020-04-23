import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {Injectable} from "@angular/core";
import {ICategoryDTO} from "../data/api";
import {DiscussionForumApiService} from "../services/api.service";


export interface IForumsPageResolverValue {
    categories: ICategoryDTO[];
}

@Injectable()
export class ForumsPageResolver implements Resolve<IForumsPageResolverValue> {
    constructor(private _apiService: DiscussionForumApiService) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<IForumsPageResolverValue> {
        return this._apiService.getPopularCategories(null, 6)
            .pipe(
                map((categories) => {
                    return {
                        categories: categories
                    } as IForumsPageResolverValue;
                }),
                catchError((e) => {
                    console.error(e);

                    return of(null);
                })
            );
    }
}
