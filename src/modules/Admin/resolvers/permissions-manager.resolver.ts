import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {EMPTY, forkJoin, Observable, of, throwError} from "rxjs";
import {ComponentAccessService, IUserTag, IUIComponent} from "@app/services/component-access.service";
import {UserTagsService} from "../services/user-tags.service";
import {catchError, flatMap, map} from "rxjs/operators";
import {ComponentIdentifier} from "@app/models/app-config";

export interface IUIPermissionsResolverData {
    tags: IUserTag[];
    uiElements: IUIComponent[];
    restrictedComponents: ComponentIdentifier[];
}

class UIPermissionsData implements IUIPermissionsResolverData {
    tags: IUserTag[];
    uiElements: IUIComponent[];
    restrictedComponents: ComponentIdentifier[];

    constructor(tags: IUserTag[], uiElements: IUIComponent[], restrictedComponents: ComponentIdentifier[]) {
        this.tags = tags || [];
        this.uiElements = uiElements || [];
        this.restrictedComponents = restrictedComponents || [];
    }
}

@Injectable()
export class UIPermissionsResolver implements Resolve<IUIPermissionsResolverData> {
    constructor(private _componentAccessService: ComponentAccessService, private _tagsService: UserTagsService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IUIPermissionsResolverData> {
        return this._tagsService.getTags()
            .pipe(
                flatMap(tags => {
                    const tagId = tags.length ? tags[0].id : null;
                    return tagId ? forkJoin(
                        of(tags),
                        this._componentAccessService.getUIElements(),
                        this._componentAccessService.getTagWithRestrictions(tagId)
                            .pipe(
                                map(tagWithRestrictions => tagWithRestrictions.restrictedUiElements)
                            )
                    ) : throwError('No tags available');
                }),
                catchError(() => EMPTY),
                map(data => new UIPermissionsData(data[0], data[1], data[2])),
            );
    }
}
