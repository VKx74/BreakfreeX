import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {ComponentIdentifier} from "@app/models/app-config";
import {ComponentAccessService} from "@app/services/component-access.service";

export interface IForumRouteData {
    identifier: ComponentIdentifier;
}

@Injectable({
    providedIn: 'root'
})
export class TagGuard implements CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return ComponentAccessService.isAccessible((route.data as IForumRouteData).identifier);
    }

}
