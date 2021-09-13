import { Component } from "@angular/core";
import { MissionTrackingService } from "@app/services/missions-tracking.service";
import { ThemeService } from "@app/services/theme.service";

@Component({
    selector: 'social-feed',
    templateUrl: 'social-feed.component.html',
    styleUrls: ['social-feed.component.scss']
})
export class SocialFeedRootComponent {
    constructor(protected _missionTrackingService: MissionTrackingService) {
        this._missionTrackingService.initMissions();
    }

    ngAfterViewInit() {
        try {
            if ((window as any).Intercom) {
                (window as any).Intercom('update', { "hide_default_launcher": false });
            }
        } catch (error) {
            console.error(error);
        }
    }
}
