import {Component, OnInit} from '@angular/core';
import {NewsService} from "../../../services/news.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {PaginationComponent, IPaginationResponse} from "@app/models/pagination.model";
import {Observable} from "rxjs";
import {PageEvent} from "@angular/material/typings/paginator";
import {ConfirmModalComponent, IConfirmModalConfig} from "UI";
import {FiltrationParams} from "@app/models/filtration-params";
import {ComponentIdentifier} from "@app/models/app-config";
import {INews} from "../../../../News/models/models";
import {CreateNewsComponent} from "../create-news/create-news.component";

interface INewsManagerFiltrationParams {
    tags: string[];
    search: string;
    endDate: string;
    startDate: string;
}

class NewsManagerFiltrationParams extends FiltrationParams<INewsManagerFiltrationParams> implements INewsManagerFiltrationParams {
    endDate: string;
    search: string;
    startDate: string;
    tags: string[];

    toObject(): INewsManagerFiltrationParams {
        return {
            endDate: this.toUTCDayEndSecondsString(this.endDate),
            search: this.search,
            startDate: this.toUTCSecondsString(this.startDate),
            tags: this.tags,
        };
    }

    clearDateParams() {
        this.startDate = null;
        this.endDate = null;
    }
}

@Component({
    selector: 'news-list',
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent extends PaginationComponent<INews> implements OnInit {
    loading = false;
    newsList: INews[];
    filtrationParams = new NewsManagerFiltrationParams();
    ComponentIdentifier = ComponentIdentifier;

    get startDate() {
        return this.filtrationParams.startDate;
    }

    set startDate(value: string) {
        this.filtrationParams.startDate = value;
    }

    get endDate() {
        return this.filtrationParams.endDate;
    }

    set endDate(value: string) {
        this.filtrationParams.endDate = value;
    }

    constructor(private _route: ActivatedRoute,
                private _newsManagerService: NewsService,
                private _matDialog: MatDialog) {
        super();
    }

    ngOnInit() {
        const news = this._route.snapshot.data['news'] as IPaginationResponse<INews>;

        if (news) {
            this.setPaginationHandler(news);
        }
    }

    getItems(): Observable<IPaginationResponse<INews>> {
        return this._newsManagerService.getNewsList(this.paginationParams, this.filtrationParams.toObject());
    }

    responseHandler(response: [IPaginationResponse<INews>, PageEvent]): void {
        this.newsList = response[0].items;
    }

    clearDatePickers() {
        this.filtrationParams.clearDateParams();
        this.resetPagination();
    }

    onSearchValueChange(term: string) {
        this.filtrationParams.search = term;
        this.resetPagination();
    }

    createNews() {
        this._matDialog.open(CreateNewsComponent).beforeClosed().subscribe(() => {
                this.updateNewsList();
        });
    }

    modalEditNews(news: INews) {
        this._matDialog.open(CreateNewsComponent, {
            data: news.id,
        }).beforeClosed().subscribe(() => {
                this.updateNewsList();
        });

    }

    updateNewsList() {
        this.getItems().subscribe(news => {
             this.newsList = news.items;
        });
    }

    deleteNews(news: INews) {
        this._matDialog.open<ConfirmModalComponent, IConfirmModalConfig>(ConfirmModalComponent, {
            data: {
                title: 'Delete Confirm',
                message: 'Are you confirm delete news?',
                onConfirm: () => this._newsManagerService.deleteNews(news.id)
                    .subscribe(res => {
                        // this.newsList = this.newsList.filter(n => n.id !== res.id);
                        this.resetPagination();
                    }, (err) => console.log('error happened ', err)),
            }
        });
    }
}
