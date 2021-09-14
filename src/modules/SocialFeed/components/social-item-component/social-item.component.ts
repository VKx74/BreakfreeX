import { Component } from "@angular/core";
import { ActivatedRoute, Router, UrlSegment } from "@angular/router";
import { AppRoutes } from "@app/app.routes";
import { LinkingAction } from "@linking/models";
import { InMemoryStorageService } from "modules/Storage/services/in-memory-storage.service";
import { map } from "rxjs/operators";

@Component({
    selector: 'social-item-component',
    templateUrl: 'social-item.component.html',
    styleUrls: ['social-item.component.scss']
})
export class SocialItemComponent {
    postId: any;

    constructor(protected _route: ActivatedRoute, protected _router: Router) {
        this.postId = _route.snapshot.params.id;

        _route.params.subscribe(routeParams => {
            if (routeParams.id && routeParams.id !== this.postId) {
                this.postId = routeParams.id;
            }
        });
    }

    openChart(linking: LinkingAction) {
        InMemoryStorageService.setLinking(linking);
        this._router.navigate([AppRoutes.Platform]);
    }
}
