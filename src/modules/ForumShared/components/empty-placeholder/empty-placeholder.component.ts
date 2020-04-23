import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'empty-placeholder',
    templateUrl: './empty-placeholder.component.html',
    styleUrls: ['./empty-placeholder.component.scss']
})
export class EmptyPlaceholderComponent implements OnInit {
    @Input() message: string;

    constructor() {
    }

    ngOnInit() {
    }

}
