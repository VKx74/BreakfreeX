import {ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, UrlSegment} from "@angular/router";
import {Injectable} from "@angular/core";
import {IdentityService} from "./identity.service";
import {AppRoutes} from "../../app.routes";
import {AuthenticationService} from "./auth.service";
import {AuthRoutes} from "../../../modules/Auth/auth.routes";
import {Observable, of} from "rxjs";
import {catchError, flatMap} from "rxjs/operators";

const DefaultRedirect = `${AppRoutes.Auth}/${AuthRoutes.Login}`;

interface AuthGuardSettings {
    redirectUrl?: string;
}

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
    constructor(private _identityService: IdentityService,
                private _authService: AuthenticationService,
                private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        const settings: AuthGuardSettings = {
            redirectUrl: null
        };

        settings.redirectUrl = route.data['redirectUrl'] || DefaultRedirect;

        if (this._identityService.isAuthorized) {
            if ( this._identityService.isExpired) {
                return this._identityService.refreshTokens()
                    .pipe(
                        flatMap(() => of(true)),
                        catchError(() => {
                            this._router.navigate([settings.redirectUrl]);
                            return of(false);
                        })
                    );
            } else {
                return of(true);
            }
        } else {
            this._router.navigate([settings.redirectUrl]);
            return of(false);
        }
    }

    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
        if (this._identityService.isAuthorized) {
            if (this._identityService.isExpired) {
                return this._identityService.refreshTokens()
                    .pipe(
                        flatMap(() => of(true)),
                        catchError(() => {
                            this._router.navigate([DefaultRedirect]);
                            return of(false);
                        })
                    );
            } else {
                return of(true);
            }
        } else {
            this._router.navigate([DefaultRedirect]);

            return of(false);
        }
    }
}
