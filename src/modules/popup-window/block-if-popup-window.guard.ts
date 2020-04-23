import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate} from "@angular/router";
import {Observable, of} from "rxjs";
import {isPopupWindow} from "./functions";

@Injectable()
export class BlockIfPopupWindowGuard implements CanActivate {
    constructor() {
    }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        return of(!isPopupWindow());
    }
}
