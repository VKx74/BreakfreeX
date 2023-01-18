import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";


@Injectable()
export class P2PAccountDetailsResolver implements Resolve<any> {
    constructor() {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const id = route.params['id'];
        const wallet = route.params['wallet'];
        return of({
            id,
            wallet
        });
    }
}
