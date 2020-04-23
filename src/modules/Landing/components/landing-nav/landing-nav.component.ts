import {Component, OnInit} from '@angular/core';
import {LandingRoutes} from "../../landing.routes";
import {QaRoutes} from "../../../Qa/qa.routes";
import {AppRoutes} from "AppRoutes";
import {NavigationEnd, Router} from "@angular/router";
import {DiscussionsForumRoutes} from "../../../DiscussionForum/discussion-forum.routes";

export enum LandingActiveRoute {
    QA,
    Forum,
}

@Component({
    selector: 'landing-nav',
    templateUrl: './landing-nav.component.html',
    styleUrls: ['./landing-nav.component.scss']
})
export class LandingNavComponent implements OnInit {
    activeRoute: string;
    LandingActiveRoute = LandingActiveRoute;
    LandingRoutes = LandingRoutes;
    AppRoutes = AppRoutes;
    QaRoutes = QaRoutes;
    ForumRoutes = DiscussionsForumRoutes;
    askQuestionRoute = `/${AppRoutes.Landing}/${LandingRoutes.QA}/${QaRoutes.AskQuestion}`;
    createDiscussionRoute = `/${AppRoutes.Landing}/${LandingRoutes.Forums}/${DiscussionsForumRoutes.Discussions}/create`;

    constructor(private _router: Router) {
    }

    ngOnInit() {
        this.setActiveRoute(this._router.url);

        this._router.events
            .subscribe(e => {
                if (e instanceof NavigationEnd) {
                    this.setActiveRoute(e.url);
                }
            });
    }

    private setActiveRoute(url: string) {
        if (url.includes(LandingRoutes.QA)) {
            this.activeRoute = LandingRoutes.QA;
        } else if (url.includes(LandingRoutes.Forums)) {
            this.activeRoute = LandingRoutes.Forums;
        } else if (url.includes(LandingRoutes.News)) {
            this.activeRoute = LandingRoutes.News;
        }
    }
}
