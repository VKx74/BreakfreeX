import {Injectable} from "@angular/core";
import {UsersService} from "../../../app/services/users.service";
import {Observable, of} from "rxjs";
import {UserModel} from "../../../app/models/auth/auth.models";
import {BaseResolver} from "./base-resolver";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {catchError} from "rxjs/operators";

@Injectable()
export class AppUsersResolver extends BaseResolver<UserModel[]> {
    constructor(private _usersService: UsersService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserModel[]> {
        return this._usersService.getUsers()
            .pipe(
                catchError(() => of(null))
            );
    }
}
