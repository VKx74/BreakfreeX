import {ActivatedRouteSnapshot, CanActivate, Router} from "@angular/router";
import {Injectable} from "@angular/core";
import {IdentityService} from "./identity.service";
import {AppRoutes} from "../../app.routes";
import {AuthenticationService} from "./auth.service";
import {Observable, of} from "rxjs";

const DefaultRedirect = AppRoutes.Platform;

@Injectable()
export class UnauthorizedGuard implements CanActivate {
    constructor(private _identityService: IdentityService,
                private _authService: AuthenticationService,
                private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        if (!this._identityService.isAuthorized || this._identityService.isGuestMode) {
            return of(true);
        } else {
            this._router.navigate([DefaultRedirect]);
            return of(false);
        }
    }
}
