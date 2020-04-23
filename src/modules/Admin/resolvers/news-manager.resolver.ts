import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable, of} from "rxjs";
import {catchError} from "rxjs/operators";
import {PaginationParams, IPaginationResponse} from "@app/models/pagination.model";
import {NewsService} from "../services/news.service";
import {INews} from "../../News/models/models";

export interface INewsManagerResolverData {
    news: IPaginationResponse<INews>;
}

@Injectable()
export class NewsManagerResolver implements Resolve<IPaginationResponse<INews>> {
    constructor(private _newsService: NewsService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPaginationResponse<INews>> {
        return this._newsService.getNewsList(new PaginationParams(), {tags: route.queryParams['tag']})
            .pipe(
                catchError(() => of(null))
            );
    }
}
