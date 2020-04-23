import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {forkJoin, Observable, of} from "rxjs";
import {Injectable} from "@angular/core";
import {IdentityService} from "@app/services/auth/identity.service";
import {catchError, map} from "rxjs/operators";
import {DiscussionDTO, ICategoryDTO} from "../data/api";
import {DiscussionForumApiService} from "../services/api.service";
import {MAX_PAGE_SIZE} from "@app/models/pagination.model";

export interface IEditDiscussionResolverValue {
    discussion: DiscussionDTO;
    categories: ICategoryDTO[];
}

@Injectable()
export class EditDiscussionResolver implements Resolve<IEditDiscussionResolverValue> {
    constructor(private _identityService: IdentityService,
                private _apiService: DiscussionForumApiService) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<IEditDiscussionResolverValue> {
        const id = route.params['id'];

        return (forkJoin({
            discussion: this._apiService.getDiscussion(id),
            categories: this._apiService.getCategories({page: 1, pageSize: MAX_PAGE_SIZE}).pipe(map(r => r.data))
        }) as Observable<IEditDiscussionResolverValue>).pipe(
            catchError((e) => {
                console.error(e);

                return of(null);
            })
        );
    }
}
