import { Component, ElementRef } from "@angular/core";
import { ChatbroService } from "@app/services/traking/ChatbroService";
import { GTMTrackingService } from "@app/services/traking/gtm.tracking.service";
import { Intercom } from "ng-intercom";
import { AcademyComponent } from "../academy-component/academy.component";
@Component({
    selector: 'academy-page-v2',
    templateUrl: 'academy-page-v2.component.html',
    styleUrls: ['academy-page-v2.component.scss']
})
export class AcademyPageV2Component extends AcademyComponent {

    constructor(protected _hostElement: ElementRef, protected _intercom: Intercom,
        protected _gtmService: GTMTrackingService, protected _chatbroService: ChatbroService) {
            super(_hostElement);
    }

    ngAfterViewInit() {
        try {
            if ((window as any).Intercom) {
                (window as any).Intercom('update', {"hide_default_launcher": false});
            }
        } catch (error) {
            console.error(error);
        }

        this._gtmService.load();
        this._chatbroService.load();
    }
   
}
