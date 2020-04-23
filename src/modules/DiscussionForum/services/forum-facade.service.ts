import {Inject, Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {DiscussionDTO, ICategoryDTO} from "../data/api";
import {DiscussionForumApiService} from "./api.service";
import {ForumType} from "../enums/enums";
import {ActivatedRoute, NavigationEnd, Params, Router, UrlSerializer} from "@angular/router";
import {ForumModuleBaseUrlToken} from "../forum-module-base-url.token";
import {ForumTypeToUrl} from "../functions";
import {delay, map} from "rxjs/operators";
import {DiscussionsForumRoutes} from "../discussion-forum.routes";
import {JsUtil} from "../../../utils/jsUtil";
import {SearchDiscussionsQueryParams} from "../resolvers/search-discussions.resolver";

@Injectable()
export class ForumFacadeService {
    private _forumType: ForumType;

    get forumType(): ForumType {
        return this._forumType;
    }

    set forumType(value: ForumType) {
        this._forumType = value;
    }

    constructor(private _apiService: DiscussionForumApiService,
                private _router: Router,
                private _route: ActivatedRoute,
                private _serializer: UrlSerializer,
                @Inject(ForumModuleBaseUrlToken) private _baseUrl: string) {

        this.forumType = this._getForumTypeFromRoute();
        this._router.events.subscribe((s: any) => {
            if (s instanceof NavigationEnd) {
                this.forumType = this._getForumTypeFromRoute();
            }
        });
    }

    getPopularDiscussions(): Observable<DiscussionDTO[]> {
        return this._apiService.getDiscussions({
            page: 1,
            pageSize: 5,
            forumTypes: [this.forumType],
            popular: true
        }).pipe(map(data => data.data));
    }

    getPopularCategories(): Observable<ICategoryDTO[]> {
        return this._apiService.getPopularCategories();
    }

    getPopularTags(): Observable<string[]> {
        return of([
            'Bitcoin',
            'Blockchain',
            'Cryptocurrency',
            'Trading',
            'Help',
            'Indicators',
            'Common',
            'Chart'
        ]).pipe(delay(2000));
    }

    getDiscussionUrl(id: string, forumType?: ForumType): string {
        if (forumType == null) {
            forumType = this._forumType;
        }

        return `${this._baseUrl}/${ForumTypeToUrl(forumType)}/${DiscussionsForumRoutes.Discussions}/${id}`;
    }

    getSearchDiscussionsByCategoryUrl(categoryId: string, forumType?: ForumType): { url: string, queryParams: Params } {
        const queryParams = {
            categories: [categoryId]
        } as SearchDiscussionsQueryParams;

        if (forumType != null) {
            queryParams.forumTypes = [forumType];
        }

        return {
            url: `/${this._baseUrl}/search`,
            queryParams: queryParams
        };
    }

    getForumTypeCaption(forumType: ForumType): Observable<string> {
        switch (forumType) {
            case ForumType.Investor:
                return of('Investor');
            case ForumType.BasicTrader:
                return of('Basic Trader');
            case ForumType.AdvancedTrader:
                return of('Advanced Trader');
            case ForumType.Institutional:
                return of('Institutional');
            default:
                return of('Unknown');
        }
    }


    private _getForumTypeFromRoute(): ForumType {
        const check = (type: ForumType) => {
            if (this._router.isActive(`${this._baseUrl}/${ForumTypeToUrl(type)}`, false)) {
                return true;
            }

            return false;
        };

        return JsUtil.numericEnumToArray<ForumType>(ForumType).find((type) => check(type));
    }
}
