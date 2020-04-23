import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable, of} from "rxjs";
import {catchError} from "rxjs/operators";
import {NewsService} from "../services/news.service";
import {PaginationParams, IPaginationResponse} from "@app/models/pagination.model";
import {INews} from "../../News/models/models";

@Injectable()
export class LastNewsResolver implements Resolve<IPaginationResponse<INews>> {
    constructor(private _newsService: NewsService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPaginationResponse<INews>> {
        return this._newsService.getNewsList(new PaginationParams(0, 5))
            .pipe(
                catchError(() => of(null))
            );
    }
}
