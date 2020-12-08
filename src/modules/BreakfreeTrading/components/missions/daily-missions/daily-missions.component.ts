import {Component, Inject, Injector, Input, OnInit, ViewChild} from '@angular/core';
import { IBFTMissions } from 'modules/BreakfreeTrading/services/tradingProfile.service';

@Component({
    selector: 'daily-missions-component',
    templateUrl: './daily-missions.component.html',
    styleUrls: ['./daily-missions.component.scss']
})
export class DailyMissionsComponent {

    @Input() missions: IBFTMissions;

    constructor() {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }
}
