import { Injectable } from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import { IdentityService } from "@app/services/auth/identity.service";
import {Observable, of, throwError} from "rxjs";
import {catchError, map} from 'rxjs/operators';

@Injectable()
export class GuestResolver implements Resolve<Observable<string>> {

    constructor(private _identityService: IdentityService) {
        _identityService.setGuestMode();
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Observable<string>> {
        return this._identityService.refreshTokenFromStorage();
    }

    protected _handleResolveError(e: any): any {
        console.error(e);
        return e;
    }
}