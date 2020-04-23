import {Component, Inject, OnInit} from '@angular/core';
import {ComponentAccessService, IUserTag, IUIComponent} from "@app/services/component-access.service";
import {ComponentIdentifier} from "@app/models/app-config";
import {TranslateService} from "@ngx-translate/core";
import {AdminTranslateService} from "../../localization/token";
import {Observable, of, throwError} from "rxjs";
import {MatSlideToggleChange} from "@angular/material/typings/slide-toggle";
import {UserTagsService} from "../../services/user-tags.service";
import {ActivatedRoute} from "@angular/router";
import {IUIPermissionsResolverData} from "../../resolvers/permissions-manager.resolver";
import {filter, finalize, flatMap, map, mapTo, switchMap, tap} from "rxjs/operators";
import {UIComponent} from "../../data/components-access.models";
import {JsUtil} from "../../../../utils/jsUtil";
import {IdentityService} from "@app/services/auth/identity.service";
import {AuthenticationService} from "@app/services/auth/auth.service";

@Component({
    selector: 'ui-permissions-manager',
    templateUrl: './ui-components-permission-manager.component.html',
    styleUrls: ['./ui-components-permission-manager.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AdminTranslateService
        }
    ]
})
export class UiComponentsPermissionManagerComponent implements OnInit {
    tags: IUserTag[];
    components: IUIComponent[];
    filteredComponents: IUIComponent[];
    selectedTag: IUserTag;
    tagRestrictedComponents: ComponentIdentifier[] = [];
    loadingComponents: ComponentIdentifier[] = [];
    readonly getOptionCaption = (tag: IUserTag): Observable<string> => of(this.toFirstUpperLetter(tag.name));

    get loading() {
        return this.loadingComponents.length;
    }

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(private _componentsAccessService: ComponentAccessService,
                private _userTagService: UserTagsService,
                private _authService: AuthenticationService,
                private _route: ActivatedRoute,
                private _identityService: IdentityService,
                @Inject(AdminTranslateService) private _translateService) {
    }

    ngOnInit() {
        const resolvedData = this._route.snapshot.data['permissionsData'] as IUIPermissionsResolverData;

        if (resolvedData) {
            this.tags = resolvedData.tags;
            this.tagRestrictedComponents = resolvedData.restrictedComponents;
            this.selectedTag = this.tags[0];
            this.filteredComponents = this.components = this.getUIComponentsWithSelectState(resolvedData.uiElements)
                .sort(this.componentsNamesComparator.bind(this));
        }
    }

    toggleLoading(component: IUIComponent) {
        let index = this.loadingComponents.indexOf(component.name);

        if (index === -1) {
            this.loadingComponents.push(component.name);
        } else {
            // this.loadingComponents = this.loadingComponents.filter(c => c !== component.name);
            this.loadingComponents.splice(index, 1);
        }
    }

    getUIComponentsWithSelectState(uiComponents: IUIComponent[]): IUIComponent[] {
        return uiComponents.map(uiComponent =>
            UIComponent.fromObject(uiComponent, this.isComponentAccessible(uiComponent)));
    }

    componentsNamesComparator(a: IUIComponent, b: IUIComponent): number {
        if (!a || !b) return 0;
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    }

    toFirstUpperLetter(str: string) {
        return `${str ? str[0].toUpperCase() + str.substr(1).toLowerCase() : ''}`;
    }

    isComponentAccessible(component: IUIComponent) {
        return !this.tagRestrictedComponents.includes(component.name);
    }

    onComponentAccessToggle(component: IUIComponent) {
        component.checked = !component.checked;

        this.toggleLoading(component);
        this.tagRestrictedComponents = this.getRestrictedComponents(component);

        this._componentsAccessService.patchTagRestrictions(this.selectedTag.id, this.tagRestrictedComponents)
            .pipe(
                finalize(() => this.toggleLoading(component)),
                flatMap(() => {
                    return this._identityService.refreshTokens()
                        .pipe(
                            flatMap(res => res ? this._componentsAccessService.initComponentsAccessConfig() : of(null))
                        );
                }),
            ).subscribe({
            error: () => {
                component.checked = !component.checked;
                this.tagRestrictedComponents = this.getRestrictedComponents(component);
            }
        });
    }

    getRestrictedComponents(component: IUIComponent): ComponentIdentifier[] {
        if (component.checked) {
            return this.removeComponentRestriction(component);
        } else {
            return JsUtil.arrayOfUniques([...this.tagRestrictedComponents, component.name]);
        }
    }

    removeComponentRestriction(componentToRemove: IUIComponent): ComponentIdentifier[] {
        return this.tagRestrictedComponents.filter(component => component !== componentToRemove.name);
    }

    onTagSelect(tag: IUserTag) {
        return this._componentsAccessService.getTagWithRestrictions(tag.id)
            .subscribe(tagWithRestrictions => {
                this.tagRestrictedComponents = tagWithRestrictions.restrictedUiElements;
                this.filteredComponents.forEach(component =>
                    component.checked = this.isComponentAccessible(component));
            });
    }

    search(term: string) {
        this.filteredComponents = term ? this.components.filter(component => component.name.includes(term)) : this.components;
    }
}
