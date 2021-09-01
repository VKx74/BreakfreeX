import { Component, OnInit } from "@angular/core";
import { IdentityService } from "@app/services/auth/identity.service";
import { BaseLayoutItem } from "@layout/base-layout-item";
import { SonarFeedWidgetComponent } from "../sonar-feed-widget/sonar-feed-widget.component";

@Component({
    selector: 'sonar-feed-wall',
    templateUrl: './sonar-feed-wall.component.html',
    styleUrls: ['./sonar-feed-wall.component.scss']
})
export class SonarFeedWallComponent implements OnInit {

    constructor(protected _identityService: IdentityService) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }
}