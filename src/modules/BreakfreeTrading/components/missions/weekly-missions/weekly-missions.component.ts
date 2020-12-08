import { Input } from '@angular/core';
import {Component, Inject, Injector, OnInit, ViewChild} from '@angular/core';
import { IBFTMissions } from 'modules/BreakfreeTrading/services/tradingProfile.service';

@Component({
    selector: 'weekly-missions-component',
    templateUrl: './weekly-missions.component.html',
    styleUrls: ['./weekly-missions.component.scss']
})
export class WeeklyMissionsComponent {

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
