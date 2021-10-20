import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
    selector: 'sonar-time-filter',
    templateUrl: './sonar-time-filter.component.html',
    styleUrls: ['./sonar-time-filter.component.scss']
})
export class SonarTimeFilterComponent implements OnInit {
    @Input() value: string;
    @Output() valueChange = new EventEmitter<string>();

    constructor() {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }

    changeInterval(value) {
        this.value = value;
        this.valueChange.emit(value);
    }
}