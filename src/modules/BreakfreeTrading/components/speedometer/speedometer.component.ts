import {Component, Inject, Injector, Input, OnInit, ViewChild} from '@angular/core';

@Component({
    selector: 'speedometer-component',
    templateUrl: './speedometer.component.html',
    styleUrls: ['./speedometer.component.scss']
})
export class SpeedometerComponent {
    @Input() score: number;
    
    public get scoreClass(): string {
        switch (Math.round(this.score)) {
            case 1: return "score_1";
            case 2: return "score_2";
            case 3: return "score_3";
            case 4: return "score_4";
            case 5: return "score_5";
            default: return "";
        }
    }

    constructor() {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }
}
