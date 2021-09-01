import { Component, OnInit } from "@angular/core";
import { IdentityService } from "@app/services/auth/identity.service";
import { BaseLayoutItem } from "@layout/base-layout-item";
import { SonarFeedWidgetComponent } from "../sonar-feed-widget/sonar-feed-widget.component";

@Component({
    selector: 'sonar-feed',
    templateUrl: './sonar-feed.component.html',
    styleUrls: ['./sonar-feed.component.scss']
})
export class SonarFeedComponent extends BaseLayoutItem  implements OnInit {
    
    get componentId(): string {
        return SonarFeedWidgetComponent.componentName;
    }

    constructor(protected _identityService: IdentityService) {
        super();
    }


    getState() {
        throw new Error("Method not implemented.");
    }
    setState(state: any) {
        throw new Error("Method not implemented.");
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }
}