import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {forkJoin, Observable} from "rxjs";
import {BaseResolver} from "./base-resolver";
import {IPaginationResponse, MAX_PAGE_SIZE} from "@app/models/pagination.model";
import {ICategoryDTO} from "../../DiscussionForum/data/api";
import {DiscussionForumApiService} from "../../DiscussionForum/services/api.service";
import {map} from "rxjs/operators";

export interface IForumResolverData {
    categories: IPaginationResponse<ICategoryDTO>;
}

@Injectable()
export class ForumCategoriesResolver extends BaseResolver<IForumResolverData> {
    constructor(private _forumApiService: DiscussionForumApiService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IForumResolverData> {
        return forkJoin({
            categories: this._forumApiService.getCategories({page: 1, pageSize: MAX_PAGE_SIZE})
                .pipe(
                    map((c) => {
                        return {
                            items: c.data,
                            total: c.itemsCount
                        };
                    })
                )
        }) as Observable<IForumResolverData>;
    }
}
