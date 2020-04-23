import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AppRoutes} from "AppRoutes";
import {INews, INewsPopularTag} from "../../../News/models/models";
import {LandingRoutes} from "../../../Landing/landing.routes";
import {TitleManager} from "../title-manager";

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
    @Input() news: INews[];
    @Input() tags: INewsPopularTag[];

    constructor(private _router: Router) {
    }

    ngOnInit() {
    }

    redirectToFullNews(news: INews) {
        this._router.navigate([AppRoutes.Landing, LandingRoutes.News, news.id]).then(() => TitleManager.title = news.title);
    }

    handleTagClick(tag: INewsPopularTag) {
        this._router.navigate([AppRoutes.Landing, LandingRoutes.News], {queryParams: {tag: tag.tagName}});
    }

}
