import {Inject, TemplateRef, ViewContainerRef} from "@angular/core";
import {Roles} from "@app/models/auth/auth.models";
import {IdentityService} from "@app/services/auth/identity.service";

export abstract class BaseRoleDirective {
    protected _roles: Roles[] = [];

    constructor(
        @Inject(ViewContainerRef) protected _viewContainerRef: ViewContainerRef,
        @Inject(TemplateRef) protected _templateRef: TemplateRef<any>,
        @Inject(IdentityService) protected _identityService: IdentityService
    ) {}

    protected _checkCurrentUserRole(): boolean {
        const currentUserRole = this._identityService.role as Roles;

        if (this._roles.length) {
            return this._roles.indexOf(currentUserRole) !== -1;
        }

        return true;
    }
}