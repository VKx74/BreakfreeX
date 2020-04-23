import {CanLoad} from "@angular/router";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {ComponentAccessService} from "@app/services/component-access.service";
import {mapTo} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ComponentsGuard implements CanLoad {
    constructor(private _cas: ComponentAccessService) {
    }

    // resolve(): Observable<IComponentsConfig> {
    //     if (!ComponentAccessService.config) {
    //         return this._cas.initComponentsAccessConfig();
    //     } else {
    //         return of(ComponentAccessService.config);
    //     }
    // }

    canLoad(): Observable<boolean> | boolean {
        if (ComponentAccessService.config) {
            return true;
        }
        return this._cas.initComponentsAccessConfig()
            .pipe(
                mapTo(true)
            );
    }
}
