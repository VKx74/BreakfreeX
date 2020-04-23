import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DiscussionModel} from "../../data/discussions";
import {IBreadcrumb} from "../../../Shared/components/breadcrumbs/breadcrumbs.component";
import {BreadcrumbsService} from "../../services/breadcrumbs.service";
import {map, takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {DiscussionPostModel} from "../../data/discussion-posts";
import {IDiscussionQueryParams, IDiscussionResolverValue} from "../../resolvers/discussion-detailed.resolver";
import {PaginationHandler} from "@app/models/pagination.model";
import {PageEvent} from "@angular/material/paginator";

@Component({
    selector: 'discussion-detailed',
    templateUrl: './discussion-detailed.component.html',
    styleUrls: ['./discussion-detailed.component.scss']
})
export class DiscussionDetailedComponent implements OnInit {
    discussion: DiscussionModel;
    discussionPosts: DiscussionPostModel[];
    breadcrumbs: IBreadcrumb[];
    paginationHandler = new PaginationHandler();
    showPaginator: boolean;

    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _breadcrumbsService: BreadcrumbsService) {
    }

    ngOnInit() {
        this._route.data
            .pipe(
                map(data => data['resolverData'] as IDiscussionResolverValue),
                takeUntil(componentDestroyed(this))
            )
            .subscribe((data: IDiscussionResolverValue) => {
                this.discussion = data.discussion;
                this.discussionPosts = data.discussionPosts.data;
                this.paginationHandler.setPaginationData({
                    pageIndex: data.discussionPosts.page - 1,
                    itemsCount: data.discussionPosts.itemsCount,
                    pageSize: data.discussionPosts.pageSize
                });
                this.showPaginator = data.discussionPosts.itemsCount > data.discussionPosts.data.length;
            });

        this.breadcrumbs = this._breadcrumbsService.discussionPage(this.discussion.title);
        this.paginationHandler.onPageChange$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe((event: PageEvent) => {
                this._router.navigate([], {
                    relativeTo: this._route,
                    queryParams: {
                        page: (event.pageIndex + 1).toString()
                    } as IDiscussionQueryParams
                });
            });
    }

    onDiscussionDeleted() {
        this._router.navigate(['../'], {relativeTo: this._route});
    }

    onDiscussionEdit() {
        this._router.navigate(['../edit', this.discussion.id], {relativeTo: this._route});
    }

    onPostDelete() {
        this._router.navigate([], {
            queryParams: {t: new Date().getTime()}
        });
    }

    onPostEdited(editedPost: DiscussionPostModel) {
        const index = this.discussionPosts.findIndex(post => post.id === editedPost.id);
        this.discussionPosts.splice(index, 1, editedPost);
    }

    handlePostCreated() {
        this._router.navigate([], {
            queryParams: {t: new Date().getTime()}
        });
    }

    ngOnDestroy() {
    }
}
