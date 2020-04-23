import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {EMPTY, Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {NewsService} from "../services/news.service";
import {INews} from "../../News/models/models";

@Injectable()
export class NewsResolver implements Resolve<INews> {
    constructor(private _newsService: NewsService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<INews> {
        const id = route.params['id'];
        return this._newsService.getNews(id)
            .pipe(
                catchError(() => EMPTY)
            );
    }
}
