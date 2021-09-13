import { Component } from "@angular/core";
import { MissionTrackingService } from "@app/services/missions-tracking.service";
import { ThemeService } from "@app/services/theme.service";
import { Intercom } from 'ng-intercom';

@Component({
    selector: 'social-feed',
    templateUrl: 'social-feed.component.html',
    styleUrls: ['social-feed.component.scss']
})
export class SocialFeedRootComponent {
    constructor(protected _missionTrackingService: MissionTrackingService, private _intercom: Intercom) {
        this._missionTrackingService.initMissions();
    }

    ngAfterViewInit() {
        try {
            this._intercom.boot({
                app_id: "sv09ttz9",
                hide_default_launcher: true
            });
        } catch (error) {
            console.error(error);
        }
    }
}
