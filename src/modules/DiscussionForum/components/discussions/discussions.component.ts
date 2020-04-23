import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ILoadPaginatedDataResult} from "@app/models/common/load-paginated-data-result";
import {takeUntil} from "rxjs/operators";
import {PageEvent} from "@angular/material/paginator";
import {DiscussionsService} from "../../services/discussions.service";
import {DiscussionModel} from "../../data/discussions";
import {PaginationHandler} from "@app/models/pagination.model";
import {ForumFacadeService} from "../../services/forum-facade.service";
import {ForumType} from "../../enums/enums";
import {IBreadcrumb} from "../../../Shared/components/breadcrumbs/breadcrumbs.component";
import {BreadcrumbsService} from "../../services/breadcrumbs.service";
import {IDiscussionsQueryParams} from "../../resolvers/discussions.resolver";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";

@Component({
    selector: 'discussions',
    templateUrl: './discussions.component.html',
    styleUrls: ['./discussions.component.scss']
})
export class DiscussionsComponent implements OnInit {
    paginationHandler = new PaginationHandler();
    discussions: DiscussionModel[] = [];
    showPaginator: boolean;
    breadcrumbs: IBreadcrumb[];

    ForumType = ForumType;

    get forumType(): ForumType {
        return this._facadeService.forumType;
    }

    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _facadeService: ForumFacadeService,
                private _discussionsService: DiscussionsService,
                private _breadcrumbsService: BreadcrumbsService) {
    }

    ngOnInit() {
        this.breadcrumbs = this._breadcrumbsService.discussionsPage();
        this._route.data
            .pipe(
                takeUntil(componentDestroyed(this))
            )
            .subscribe((data) => {
                const resolveResult: ILoadPaginatedDataResult<DiscussionModel> = data['resolverData'];

                this.discussions = resolveResult.data;
                this.showPaginator = resolveResult.itemsCount > resolveResult.pageSize;
                this.paginationHandler.setPaginationData({
                    pageIndex: resolveResult.page ? resolveResult.page - 1 : 0,
                    itemsCount: resolveResult.itemsCount,
                    pageSize: resolveResult.pageSize
                });
            });

        this.paginationHandler.onPageChange$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe((event: PageEvent) => {
                this._router.navigate([], {
                    queryParams: {
                        page: (event.pageIndex + 1).toString()
                    } as IDiscussionsQueryParams,
                    relativeTo: this._route
                });
            });
    }

    getDiscussionUrl(id: string): string {
        return this._facadeService.getDiscussionUrl(id);
    }

    ngOnDestroy() {
    }
}
