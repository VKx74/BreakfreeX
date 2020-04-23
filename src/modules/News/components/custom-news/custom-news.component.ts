import {Component, Input, OnInit} from '@angular/core';
import {INews} from "../../models/models";
import {IPaginationResponse, PaginationComponent, PaginationParams} from "@app/models/pagination.model";
import {NewsService} from "../../../Admin/services/news.service";
import {Observable} from "rxjs";
import {PageEvent} from "@angular/material/typings/paginator";
import {Router} from "@angular/router";
import {LandingRoutes} from "../../../Landing/landing.routes";
import {AppRoutes} from "AppRoutes";

@Component({
    selector: 'custom-news',
    templateUrl: './custom-news.component.html',
    styleUrls: ['./custom-news.component.scss']
})
export class CustomNewsComponent extends PaginationComponent<INews> implements OnInit {
    newsList: INews[] = [];
    loading: boolean = false;

    constructor(private _newsManagerService: NewsService,
                private _router: Router
                ) {
        super();
    }

    ngOnInit() {
        this.loading = true;
        this.getItems()
            .subscribe(this.setPaginationHandler.bind(this, null, 15));
    }

    redirectToLandingNews(id: number, event: Event) {
        event.stopPropagation();
        this._router.navigate(['../', AppRoutes.Landing, LandingRoutes.News, id]);
    }

    onPrevPageClick() {
        const currentPage = this.paginationHandler.pageIndex;

        if (currentPage === 0) {
            return;
        }

        this.paginationHandler.onPageChange({
                ...this.paginationHandler.paginationData, pageIndex: currentPage - 1
            } as any
        );
    }

    onNextPageClick() {
        const currentPage = this.paginationHandler.pageIndex;
        if (this.paginationHandler.isLastPage) {
            return;
        }

        this.paginationHandler.onPageChange({
                ...this.paginationHandler.paginationData, pageIndex: currentPage + 1
            } as any
        );

    }

    getItems(): Observable<IPaginationResponse<INews>> {
        return this._newsManagerService.getNewsList(this.paginationParams);
    }

    responseHandler(response: [IPaginationResponse<INews>, PageEvent]): void {
        this.loading = false;
        this.newsList = [...response[0].items];
    }
}
