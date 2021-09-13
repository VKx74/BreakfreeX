import {Component} from "@angular/core";
import {IdentityService} from "@app/services/auth/identity.service";
import { MissionTrackingService } from "@app/services/missions-tracking.service";
@Component({
    selector: 'academy-page',
    templateUrl: 'academy-page.component.html',
    styleUrls: ['academy-page.component.scss']
})
export class AcademyPageComponent {
   
    constructor(private _identity: IdentityService) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }
}
