import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'pagination-buttons',
    templateUrl: './pagination-buttons.component.html',
    styleUrls: ['./pagination-buttons.component.scss']
})
export class PaginationButtonsComponent implements OnInit {
    @Input() prevDisabled = false;
    @Input() nextDisabled = false;
    @Output() prev = new EventEmitter();
    @Output() next = new EventEmitter();

    constructor() {
    }

    ngOnInit() {
    }

    onPrevClick() {
        if (!this.prevDisabled) {
            this.prev.emit();
        }
    }

    onNextClick() {
        if (!this.nextDisabled) {
            this.next.emit();
        }
    }

}
