import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable, of} from "rxjs";
import {catchError} from "rxjs/operators";
import {NewsService} from "../services/news.service";
import {IPaginationResponse} from "@app/models/pagination.model";
import {INews} from "../../News/models/models";

@Injectable()
export class NewsPopularTagsResolver implements Resolve<IPaginationResponse<INews>> {
    constructor(private _newsService: NewsService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPaginationResponse<INews>> {
        return this._newsService.getPopularTags(10)
            .pipe(
                catchError(() => of(null))
            );
    }
}
