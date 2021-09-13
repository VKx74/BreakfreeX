import {Component} from "@angular/core";
import { MissionTrackingService } from "@app/services/missions-tracking.service";
import {ThemeService} from "@app/services/theme.service";

@Component({
    selector: 'academy-root',
    templateUrl: 'academy-root.component.html',
    styleUrls: ['academy-root.component.scss']
})
export class AcademyRootComponent {
    constructor(protected _missionTrackingService: MissionTrackingService) {
        this._missionTrackingService.initMissions();
    }
}
