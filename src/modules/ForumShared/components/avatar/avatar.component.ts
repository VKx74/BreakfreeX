import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
    @Input() text: string;
    letter: string;

    constructor() {
    }

    ngOnInit() {
        this.letter = this.text.substr(0, 1);
    }

}
