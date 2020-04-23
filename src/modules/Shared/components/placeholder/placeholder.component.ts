import {Component, Input, OnInit} from '@angular/core';

export enum PlaceholderType {
    Admin,
    Platform,
}

@Component({
    selector: 'placeholder',
    templateUrl: './placeholder.component.html',
    styleUrls: ['./placeholder.component.scss']
})
export class PlaceholderComponent implements OnInit {
    @Input() message: string = '';

    constructor() {
    }

    ngOnInit() {
    }

}
