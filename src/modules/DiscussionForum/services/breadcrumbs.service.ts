import {Inject, Injectable} from "@angular/core";
import {IBreadcrumb} from "../../Shared/components/breadcrumbs/breadcrumbs.component";
import {Observable, of} from "rxjs";
import {ForumType} from "../enums/enums";
import {ForumFacadeService} from "./forum-facade.service";
import {map} from "rxjs/operators";
import {ForumModuleBaseUrlToken} from "../forum-module-base-url.token";
import {DiscussionsForumRoutes} from "../discussion-forum.routes";
import {ForumTypeToUrl} from "../functions";

@Injectable()
export class BreadcrumbsService {
    get forumType(): ForumType {
        return this._facadeService.forumType;
    }

    constructor(private _facadeService: ForumFacadeService,
                @Inject(ForumModuleBaseUrlToken) private _baseUrl: string) {
        // if (this._baseUrl.endsWith("/")) {
        //     this._baseUrl = this._baseUrl.slice(0, -1);
        // }
    }

    discussionsPage(): IBreadcrumb[] {
        return [
            ...this._forumTypeBreadcrumbs(),
            {
                label: of('Discussions'),
                url: `#${this._baseUrl}/${ForumTypeToUrl(this.forumType)}/${DiscussionsForumRoutes.Discussions}`
            }
        ];
    }

    discussionPage(discussionTitle: string): IBreadcrumb[] {
        return [
            ...this.discussionsPage(),
            {
                label: of(discussionTitle)
            }
        ];
    }

    editDiscussionPage(discussionId: string, discussionTitle: string): IBreadcrumb[] {
        return [
            ...this.discussionsPage(),
            {
                label: of(discussionTitle),
                url: `#${this._baseUrl}/${ForumTypeToUrl(this.forumType)}/${DiscussionsForumRoutes.Discussions}/${discussionId}`
            }
        ];
    }

    createDiscussionPage(): IBreadcrumb[] {
        return [
            ...this._forumTypeBreadcrumbs(),
            {
                label: of('Create Discussion')
            }
        ];
    }

    searchDiscussionsPage(): IBreadcrumb[] {
        return [
            ...this._forumsBreadcrumbs(),
            {
                label: of('Search Discussions')
            }
        ];
    }

    categoriesPage(): IBreadcrumb[] {
        return [
            ...this._forumsBreadcrumbs(),
            {
                label: of('Categories')
            }
        ];
    }

    private _forumsBreadcrumbs(): IBreadcrumb[] {
        return [
            {
                label: of('Forums'),
                url: `#${this._baseUrl}`
            }
        ];
    }

    private _forumTypeBreadcrumbs(): IBreadcrumb[] {
        return [
            ...this._forumsBreadcrumbs(),
            {
                label: this._facadeService.getForumTypeCaption(this.forumType).pipe(
                    map((caption: string) => caption)
                ),
                url: `#${this._baseUrl}/${ForumTypeToUrl(this.forumType)}`
            }
        ];
    }
}
