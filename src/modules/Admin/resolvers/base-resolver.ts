import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable, of, throwError} from "rxjs";
import {catchError, map} from 'rxjs/operators';

export abstract class BaseResolver<T> implements Resolve<Observable<T>> {
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Observable<T>> {
        return this._getResolveValue(route, state)
            .pipe(
                map((value: any) => of(value)),
                catchError((e) => {
                    return throwError(this._handleResolveError(e));
                })
            );
    }

    protected abstract _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<T>;
    protected _handleResolveError(e: any): any {
        console.error(e);

        return e;
    }
}