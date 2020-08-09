import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {ComponentIdentifier, CONFIGS_BASE_URL, IComponentsConfig} from "@app/models/app-config";
import {map, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {IdentityService} from "@app/services/auth/identity.service";
import {AppConfigService} from "@app/services/app.config.service";
import {PaginationParams} from "@app/models/pagination.model";
import {QueryParamsConstructor} from "../../modules/Admin/data/models";

enum ComponentAccessResolverStrategy {
    ConfigFile,
    UserTags,
}

export enum UIElementType {
    Admin,
    User
}

export interface IUIComponent {
    id: number;
    name: ComponentIdentifier;
    type: UIElementType;
    checked?: boolean;
}

export interface IUserTag {
    id: string;
    name: string;
}

export interface IUserTagWithRestriction extends IUserTag {
    restrictedUiElements: ComponentIdentifier[];
}

export const ADMIN_ITEMS: ComponentIdentifier[] = [
    ComponentIdentifier.summary,
    ComponentIdentifier.blockchains,
    ComponentIdentifier.currencies,
    ComponentIdentifier.markets,
    ComponentIdentifier.dataConsolidator,
    ComponentIdentifier.wallets,
    ComponentIdentifier.accounts,
    ComponentIdentifier.deposits,
    ComponentIdentifier.withdraws,
    ComponentIdentifier.exchangeMembers,
    ComponentIdentifier.adminNotifications,
    ComponentIdentifier.eventConsolidator,
    ComponentIdentifier.appMembers,
    ComponentIdentifier.adminChat,
    ComponentIdentifier.adminForum,
    ComponentIdentifier.adminQA,
    ComponentIdentifier.adminNews,
    ComponentIdentifier.permissionsManager,
    ComponentIdentifier.restrictionsManager,
    ComponentIdentifier.systemMonitoring,
    ComponentIdentifier.eventsLog,
    ComponentIdentifier.tradesReports,
];

export const ADMIN_ALLOWED_COMPONENTS: ComponentIdentifier[] = [
    ComponentIdentifier.breakfreeTradingBacktest
];

@Injectable({
    providedIn: 'root'
})
export class ComponentAccessService {

    private static _identityService: IdentityService;
    static config: IComponentsConfig;

    COMPONENTS_ACCESS_RESOLVER_STRATEGY = ComponentAccessResolverStrategy.UserTags;
    configurationFile: IComponentsConfig = null;

    get currentStrategy(): ComponentAccessResolverStrategy {
        return this.COMPONENTS_ACCESS_RESOLVER_STRATEGY;
    }

    constructor(private _http: HttpClient,
                private _identity: IdentityService) {
        ComponentAccessService._identityService = this._identity;
    }

    static isAccessible(identifier: ComponentIdentifier): boolean {
        if (ADMIN_ALLOWED_COMPONENTS.indexOf(identifier) >= 0) {
            return false;
            // return ComponentAccessService._identityService.isAdmin;
        }

        return identifier && ComponentAccessService.config[identifier];
    }

    static isAccessibleComponentsArray(identifiers: ComponentIdentifier[]): boolean {
        for (const item of identifiers) {
            if (ADMIN_ALLOWED_COMPONENTS.indexOf(item) >= 0) {
                return false;
            } 
            
            // if (ADMIN_ALLOWED_COMPONENTS.indexOf(item) >= 0 && !ComponentAccessService._identityService.isAdmin) {
            //     return false;
            // }
        }

        return (identifiers && identifiers.length && identifiers.some((i) => ComponentAccessService.config[i]));
    }

    public getUIElements(params = PaginationParams.ALL()): Observable<IUIComponent[]> {
        return this._http.get<IUIComponent[]>(`${AppConfigService.config.apiUrls.identityUrl}UiElement`, {
            params: QueryParamsConstructor.fromObject(params.toSkipLimit()),
            withCredentials: true
        });
    }

    public getTagWithRestrictions(tagId: string): Observable<IUserTagWithRestriction> {
        return this._http.get<IUserTagWithRestriction>(`${AppConfigService.config.apiUrls.identityUrl}UserTag/${tagId}/restriction`, {
            withCredentials: true
        });
    }

    public patchTagRestrictions(tagId: string, restrictions: ComponentIdentifier[]): Observable<boolean> {
        return this._http.patch<boolean>(`${AppConfigService.config.apiUrls.identityUrl}UserTag/restriction`, {
            id: tagId,
            restrictions
        }, {withCredentials: true});
    }

    public getConfig(): Observable<IComponentsConfig> {
        if (this.configurationFile) {
            return of(this.configurationFile);
        } else {
            return this._http.get<IComponentsConfig>(`${CONFIGS_BASE_URL}components.json`)
                .pipe(
                    tap((configFile) => this.configurationFile = configFile)
                );
        }
    }

    public initComponentsAccessConfig(): Observable<IComponentsConfig> {
        let obs: Observable<IComponentsConfig>;

        if (this.COMPONENTS_ACCESS_RESOLVER_STRATEGY === ComponentAccessResolverStrategy.ConfigFile) {
            obs = this._getConfigForConfigFileStrategy();
        } else {
            obs = this._getConfigForTagsStrategy();
        }

        return obs.pipe(
            tap(configFile => ComponentAccessService.config = configFile),
        );
    }

    private _getConfigForTagsStrategy(): Observable<IComponentsConfig> {
        return this.getConfig()
            .pipe(
                map((componentsConfig: IComponentsConfig) => {
                    const userRestrictedComponents = this._identity.restrictedComponents;
                    return Object.keys(componentsConfig)
                        .reduce((acc, component) => {
                            acc[component] = !userRestrictedComponents.find(comp => comp === component);
                            return acc;
                        }, {} as IComponentsConfig);
                }),
            );
    }

    private _getConfigForConfigFileStrategy(): Observable<IComponentsConfig> {
        return this.getConfig();
    }

}
