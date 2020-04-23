import {ActivatedRoute, ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {forkJoin, Observable, of} from "rxjs";
import {Injectable} from "@angular/core";
import {IdentityService} from "@app/services/auth/identity.service";
import {catchError, map} from "rxjs/operators";
import {DiscussionModel} from "../data/discussions";
import {DiscussionsService} from "../services/discussions.service";
import {DiscussionPostModel} from "../data/discussion-posts";
import {DiscussionPostsService} from "../services/discussion-posts.service";
import {ILoadPaginatedDataResult} from "@app/models/common/load-paginated-data-result";
import {getPageQueryParamValue} from "../../../functions";

export interface IDiscussionResolverValue {
    discussion: DiscussionModel;
    discussionPosts: ILoadPaginatedDataResult<DiscussionPostModel>;
}

export interface IDiscussionQueryParams {
    page?: string;
}

@Injectable()
export class DiscussionDetailedResolver implements Resolve<IDiscussionResolverValue> {
    constructor(private _identityService: IdentityService,
                private _discussionsService: DiscussionsService,
                private _discussionPostsService: DiscussionPostsService,
                private _route: ActivatedRoute) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<IDiscussionResolverValue | null> {
        const id = route.params['id'];
        const page = getPageQueryParamValue((route.queryParams as IDiscussionQueryParams).page);

        return forkJoin({
            discussion: this._discussionsService.getDiscussion(id),
            discussionPosts: this._discussionPostsService.getDiscussionPosts({
                discussionId: id,
                page: page,
                pageSize: 10
            })
        })
            .pipe(
                map(({discussion, discussionPosts}) => {
                    return {
                        discussion: discussion,
                        discussionPosts: discussionPosts
                    } as IDiscussionResolverValue;
                })
            );
    }
}
