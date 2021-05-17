import {ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, UrlSegment} from "@angular/router";
import {Injectable} from "@angular/core";
import {IdentityService} from "./identity.service";
import {AppRoutes} from "../../app.routes";
import {AuthenticationService} from "./auth.service";
import {AuthRoutes} from "../../../modules/Auth/auth.routes";
import {Observable, of} from "rxjs";

const DefaultRedirect = `${AppRoutes.Platform}`;

@Injectable()
export class GuestGuard implements CanActivate, CanLoad {
    constructor(private _identityService: IdentityService,
                private _authService: AuthenticationService,
                private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        if (this._identityService.isAuthorized && !this._identityService.isGuestMode) {
            this._router.navigate([DefaultRedirect]);
            return of(false);
        } else {
            return of(true);
        }
    }

    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
        if (this._identityService.isAuthorized && !this._identityService.isGuestMode) {
            this._router.navigate([DefaultRedirect]);
            return of(false);
        } else {
            return of(true);
        }
    }
}
