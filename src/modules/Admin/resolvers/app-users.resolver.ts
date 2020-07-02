import {Injectable} from "@angular/core";
import {UsersService} from "../../../app/services/users.service";
import {Observable, of} from "rxjs";
import {UserModel} from "../../../app/models/auth/auth.models";
import {BaseResolver} from "./base-resolver";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {IPaginationResponse} from "@app/models/pagination.model";
import {catchError} from "rxjs/operators";

@Injectable()
export class AppUsersResolver extends BaseResolver<IPaginationResponse<UserModel>> {
    constructor(private _usersService: UsersService) {
        super();
    }

    protected _getResolveValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPaginationResponse<UserModel>> {
        return this._usersService.getUsers()
            .pipe(
                catchError(() => of(null))
            );
    }
}
