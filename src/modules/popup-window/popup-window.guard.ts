import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, CanDeactivate} from "@angular/router";
import {Observable, of} from "rxjs";
import {isPopupWindow} from "./functions";

@Injectable()
export class PopupWindowGuard implements CanActivate, CanDeactivate<boolean> {
    constructor() {
    }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        return of(isPopupWindow());
    }

    canDeactivate(): Observable<boolean> {
        return of(!isPopupWindow());
    }
}
