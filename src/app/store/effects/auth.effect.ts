import {Injectable} from "@angular/core";
import {Effect} from "@ngrx/effects";
import {filter, map, tap} from "rxjs/operators";
import {IdentityService} from "@app/services/auth/identity.service";
import {LogoutSuccessAction} from "@app/store/actions";

@Injectable()
export class AuthEffects {
    constructor(private _identityService: IdentityService) {
    }

    @Effect()
    logout = this._identityService.isAuthorizedChange$
        .pipe(
            filter((isAuthorized: boolean) => isAuthorized === false),
            map(() => {
                return new LogoutSuccessAction();
            })
        );
}
