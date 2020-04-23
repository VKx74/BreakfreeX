import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from "@angular/router";
import {Injectable} from "@angular/core";
import {IdentityService} from "../auth/identity.service";
import {Roles} from "../../models/auth/auth.models";

export interface IRoleGuardConfig {
    allowedRoles: Roles[];
    redirectUrl: string;
}

export const RoleGuardConfigToken = 'roleGuardConfig';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private _identityService: IdentityService,
                private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot): UrlTree | boolean {
        const config: IRoleGuardConfig = route.data[RoleGuardConfigToken];
        const allowAccess = config.allowedRoles.some(role => this._identityService.role === role);

        if (allowAccess) {
            return true;
        }

        return this._router.createUrlTree([config.redirectUrl]);
    }
}
