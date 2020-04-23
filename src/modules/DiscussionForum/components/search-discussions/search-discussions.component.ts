import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DiscussionModel} from "../../data/discussions";
import {
    ISearchDiscussionsFilterConfig,
    ISearchDiscussionsFilterValues
} from "../search-discussions-filter/search-discussions-filter.component";
import {
    ISearchDiscussionsResolverValue,
    SearchDiscussionsQueryParams
} from "../../resolvers/search-discussions.resolver";
import {of} from "rxjs";
import {JsUtil} from "../../../../utils/jsUtil";
import {ForumFacadeService} from "../../services/forum-facade.service";
import {takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {PageEvent} from "@angular/material/paginator";
import {PaginationHandler} from "@app/models/pagination.model";
import {IBreadcrumb} from "../../../Shared/components/breadcrumbs/breadcrumbs.component";
import {BreadcrumbsService} from "../../services/breadcrumbs.service";
import {DiscussionsForumRoutes} from "../../discussion-forum.routes";

@Component({
    selector: 'search-discussions',
    templateUrl: './search-discussions.component.html',
    styleUrls: ['./search-discussions.component.scss']
})
export class SearchDiscussionsComponent implements OnInit {
    discussions: DiscussionModel[];
    searchFilterConfig: ISearchDiscussionsFilterConfig;
    showPaginator: boolean = false;
    paginationHandler = new PaginationHandler();
    breadcrumbs: IBreadcrumb[];

    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _facadeService: ForumFacadeService,
                private _breadcrumbsService: BreadcrumbsService) {
    }

    ngOnInit() {
        this._route.data
            .pipe(
                takeUntil(componentDestroyed(this))
            )
            .subscribe((data) => {
                const resolvedData: ISearchDiscussionsResolverValue = data['resolverData'];

                if (resolvedData) {
                    const searchParams = this._route.snapshot.queryParams as SearchDiscussionsQueryParams;
                    this.discussions = resolvedData.discussions.data;
                    this.searchFilterConfig = {
                        values: {
                            forumTypes: searchParams.forumTypes
                                ? JsUtil.flattenArray([searchParams.forumTypes]).map(t => parseInt(t as string, 10))
                                : null,
                            category: searchParams.categories
                                ? Array.isArray(searchParams.categories) ? searchParams.categories[0] : searchParams.categories
                                : null
                        },
                        categories: resolvedData.categories,
                        submitHandler: (values: ISearchDiscussionsFilterValues) => {
                            return of(this._router.navigate([DiscussionsForumRoutes.Search], {
                                relativeTo: this._route.parent,
                                queryParams: {
                                    query: searchParams.query || undefined,
                                    forumTypes: values.forumTypes,
                                    categories: values.category ? [values.category] : []
                                } as SearchDiscussionsQueryParams
                            }));
                        }
                    };

                    this.showPaginator = resolvedData.discussions.itemsCount > resolvedData.discussions.pageSize;
                    this.paginationHandler.setPaginationData({
                        pageIndex: resolvedData.discussions.page ? resolvedData.discussions.page - 1 : 0,
                        itemsCount: resolvedData.discussions.itemsCount,
                        pageSize: resolvedData.discussions.pageSize
                    });
                }
            });

        this.paginationHandler.onPageChange$
            .subscribe((event: PageEvent) => {
                this._router.navigate([], {
                    queryParams: {
                        page: (event.pageIndex + 1).toString()
                    } as SearchDiscussionsQueryParams,
                    queryParamsHandling: 'merge',
                    relativeTo: this._route
                });
            });

        this.breadcrumbs = this._breadcrumbsService.searchDiscussionsPage();
    }

    getDiscussionUrl(discussion: DiscussionModel): string {
        return this._facadeService.getDiscussionUrl(discussion.id, discussion.forumType);
    }

    ngOnDestroy() {
    }
}
