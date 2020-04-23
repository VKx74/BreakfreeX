import {ActivatedRouteSnapshot} from "@angular/router";

export function isEditResolverMode(route: ActivatedRouteSnapshot): boolean {
    return route.data['isEditMode'] === true;
}