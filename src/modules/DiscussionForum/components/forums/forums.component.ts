import {Component, OnInit} from '@angular/core';
import {ForumType} from "../../enums/enums";
import {ForumTypeToUrl} from "../../functions";
import {ICategoryDTO} from "../../data/api";
import {ActivatedRoute} from "@angular/router";
import {IForumsPageResolverValue} from "../../resolvers/forums-page.resolver";

@Component({
    selector: 'forums',
    templateUrl: './forums.component.html',
    styleUrls: ['./forums.component.scss']
})
export class ForumsComponent implements OnInit {
    ForumType = ForumType;
    topCategories: ICategoryDTO[];

    constructor(private _route: ActivatedRoute) {
    }

    ngOnInit() {
        const resolverData = this._route.snapshot.data['resolverData'] as IForumsPageResolverValue;
        this.topCategories = resolverData.categories;
    }

    getForumTypeUrl(forumType: ForumType): string {
        return `${ForumTypeToUrl(forumType)}`;
    }
}
