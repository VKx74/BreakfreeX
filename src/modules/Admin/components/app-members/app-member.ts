import {UserModel} from "../../../../app/models/auth/auth.models";
import {Injectable, Injector} from "@angular/core";
import {UsersService} from "../../../../app/services/users.service";
import {Observable} from "rxjs";
import {finalize, tap} from "rxjs/operators";
import {IdentityService} from "../../../../app/services/auth/identity.service";

export class AppMemberModel {
    processActivation: boolean;
    private _usersService: UsersService;
    private _identity: IdentityService;

    get isActive(): boolean {
        return this.user.isActive;
    }

    get isCurrentUser(): boolean {
        return this.user.id === this._identity.id;
    }

    constructor(public user: UserModel,
                private _injector: Injector) {

        this._usersService = this._injector.get(UsersService);
        this._identity = this._injector.get(IdentityService);
    }

    activate(): Observable<any> {
        this.processActivation = true;

        return this._usersService.activateUser(this.user)
            .pipe(
                tap(() => {
                    this.user.isActive = true;
                }),
                finalize(() => {
                    this.processActivation = false;
                })
            );
    }

    deactivate(): Observable<any> {
        this.processActivation = true;

        return this._usersService.deactivateUser(this.user)
            .pipe(
                tap(() => {
                    this.user.isActive = false;
                }),
                finalize(() => {
                    this.processActivation = false;
                })
            );
    }

    updateUser(user: UserModel) {
        this.user = user;
    }
}


@Injectable()
export class AppMemberModelFactory {
    constructor(private _injector: Injector) {
    }

    create(user: UserModel): AppMemberModel {
        return new AppMemberModel(
            user,
            this._injector
        );
    }

    createMultiple(users: UserModel[]): AppMemberModel[] {
        return users.map((u) => new AppMemberModel(u, this._injector));
    }
}