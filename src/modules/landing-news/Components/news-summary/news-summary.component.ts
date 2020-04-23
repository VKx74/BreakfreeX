import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {PaginationResponse, PaginationComponent, IPaginationResponse} from "@app/models/pagination.model";
import {Observable} from "rxjs";
import {PageEvent} from "@angular/material/typings/paginator";
import {INews} from "../../../News/models/models";
import {INewsManagerResolverData} from "../../../Admin/resolvers/news-manager.resolver";
import {NewsService} from "../../../Admin/services/news.service";
import {TitleManager} from "../title-manager";

@Component({
    selector: 'news-summary',
    templateUrl: './news-summary.component.html',
    styleUrls: ['./news-summary.component.scss']
})
export class NewsSummaryComponent extends PaginationComponent<INews> implements OnInit {
    newsList: INews[];
    readonly format: string = 'MMMM, DD, HH:mm';

    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _newsService: NewsService) {
        super();
    }

    ngOnInit() {
        this.pageSize = 5;
        this._route.data.subscribe((data: INewsManagerResolverData) => {
            // const resolvedData = this._route.snapshot.data as INewsManagerResolverData;

            // if (!this.newsList) {
                this.setPaginationHandler(PaginationResponse.fromObject(data.news));
            // }
        });
        // const resolvedData = this._route.snapshot.data as INewsManagerResolverData;
        // this.setPaginationHandler(BasePaginationResponse.fromObject(resolvedData.news));
    }

    getItems(): Observable<IPaginationResponse<INews>> {
        return this._newsService.getNewsList(this.paginationParams);
    }

    responseHandler(response: [IPaginationResponse<INews>, PageEvent]): void {
        this.newsList = response[0].items;
    }

    redirectToFullNews(news: INews) {
        this._router.navigate(['/landing/news', news.id]).then(() => TitleManager.title = news.title);
    }
}
