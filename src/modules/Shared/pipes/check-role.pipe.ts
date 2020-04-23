import {Pipe, PipeTransform} from '@angular/core';
import {Roles} from "@app/models/auth/auth.models";
import {IdentityService} from "@app/services/auth/identity.service";

@Pipe({
    name: 'checkRole'
})
export class CheckRolePipe implements PipeTransform {
    constructor(private _identityService: IdentityService) {
    }

    transform(...roles: Roles[]): boolean {
        return roles.some((role: Roles) => {
            return this._identityService.role as Roles === role;
        });
    }
}