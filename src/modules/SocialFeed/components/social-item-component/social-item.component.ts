import { Component } from "@angular/core";
import { ActivatedRoute, UrlSegment } from "@angular/router";
import { map } from "rxjs/operators";

@Component({
    selector: 'social-item-component',
    templateUrl: 'social-item.component.html',
    styleUrls: ['social-item.component.scss']
})
export class SocialItemComponent {
    postId: any;

    constructor(route: ActivatedRoute) {
        this.postId = route.snapshot.params.id;

        route.params.subscribe(routeParams => {
            if (routeParams.id && routeParams.id !== this.postId) {
                this.postId = routeParams.id;
            }
        });
    }
}
