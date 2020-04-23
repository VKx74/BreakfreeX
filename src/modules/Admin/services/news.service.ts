import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {PaginationResponse, PaginationParams, IPaginationResponse} from "@app/models/pagination.model";
import {QueryParamsConstructor} from "../data/models";
import {map} from "rxjs/operators";
import {IGetNewsListResponse, INews, INewsPopularTag, INewsResponse} from "../../News/models/models";

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    readonly NEWS_URL = `${AppConfigService.config.apiUrls.news}api/News/`;

    constructor(private _http: HttpClient) {
    }

    getPopularTags(count: number = 10): Observable<INewsPopularTag[]> {
        return this._http.get<INewsPopularTag[]>(`${this.NEWS_URL}tags`);
    }

    getNewsList(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<INews>> {
        return this._http.get<IGetNewsListResponse>(`${this.NEWS_URL}`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        }).pipe(
            map(res => new PaginationResponse<INews>(res.news, res.count))
        );
    }

    getNews(newsId: string): Observable<INews> {
        return this._http.get<INews>(`${this.NEWS_URL}${newsId}`);
    }

    createNews(newsModel: INews): Observable<INewsResponse> {
        return this._http.post<INewsResponse>(`${this.NEWS_URL}`, newsModel);
    }

    updateNews(newsId: string, updatedModel: INews): Observable<INewsResponse> {
        return this._http.put<INewsResponse>(`${this.NEWS_URL}${newsId}`, updatedModel);
    }

    deleteNews(newsId: string): Observable<INewsResponse> {
        return this._http.delete<INewsResponse>(`${this.NEWS_URL}${newsId}`);
    }
}
