import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'main-container',
    templateUrl: './main-container.component.html',
    styleUrls: ['./main-container.component.scss']
})
export class MainContainerComponent implements OnInit {
    @Input() noPaddingTop = false;
    @Input() noPadding = true;

    constructor() {
    }

    ngOnInit() {
    }

}
