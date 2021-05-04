import {ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, UrlSegment} from "@angular/router";
import {Injectable} from "@angular/core";
import {IdentityService} from "./identity.service";
import {AppRoutes} from "../../app.routes";
import {AuthenticationService} from "./auth.service";
import {AuthRoutes} from "../../../modules/Auth/auth.routes";
import {Observable, of} from "rxjs";

interface GuestGuardSettings {
    redirectUrl?: string;
}

@Injectable()
export class GuestGuard implements CanActivate, CanLoad {
    constructor(private _identityService: IdentityService,
                private _authService: AuthenticationService,
                private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        const settings: GuestGuardSettings = {
            redirectUrl: null
        };
        return of(true);
    }

    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
        return of(true);
    }
}
