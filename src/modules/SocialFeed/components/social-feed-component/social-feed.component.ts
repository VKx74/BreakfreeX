import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppRoutes } from "@app/app.routes";
import { LinkingAction } from "@linking/models";
import { InMemoryStorageService } from "modules/Storage/services/in-memory-storage.service";

@Component({
    selector: 'social-feed-component',
    templateUrl: 'social-feed.component.html',
    styleUrls: ['social-feed.component.scss']
})
export class SocialFeedComponent {

    constructor(protected _route: Router) {

    }

    openChart(linking: LinkingAction) {
        InMemoryStorageService.setLinking(linking);
        this._route.navigate([AppRoutes.Platform]);
    }
}
