import { Component, ElementRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MissionTrackingService } from "@app/services/missions-tracking.service";
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
    @ViewChild('rootComponent', { static: true }) root: ElementRef;

    constructor(protected _hostElement: ElementRef, protected _intercom: Intercom, private route: ActivatedRoute,
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
        
        this._chatbroService.load();
    }

    ngOnInit() {
        if (!this.root) {
            return;
        }

        let section = this.route.snapshot.params["id"];
        if (section === "qa3z1iua7r") {
            $(this.root.nativeElement).addClass("mental-alchemy");
        } else if (section === "3jc17um90b") {
            $(this.root.nativeElement).addClass("the-blueprint");
        } else {
            $(this.root.nativeElement).addClass("default-bg");
        }
    }
   
}
