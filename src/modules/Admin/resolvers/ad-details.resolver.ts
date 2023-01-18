import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";
import { IUserWalletResponse } from "modules/Companion/models/models";


@Injectable()
export class AdDetailsResolver implements Resolve<any> {
    constructor() {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const id = route.params['id'];
        return of(id);
    }
}
