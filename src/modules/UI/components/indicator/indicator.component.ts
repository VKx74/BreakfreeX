import {Component, Input, OnInit} from '@angular/core';
import {EEventVolatility} from "@calendarEvents/models/enums";

@Component({
    selector: 'indicator',
    templateUrl: './indicator.component.html',
    styleUrls: ['./indicator.component.scss'],
})
export class IndicatorComponent implements OnInit {
    @Input() color: string;
    @Input() colorClass: string;

    constructor() {
    }

    ngOnInit() {
    }

}
