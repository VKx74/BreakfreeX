import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'no-items-placeholder',
    templateUrl: './no-items-placeholder.component.html',
    styleUrls: ['./no-items-placeholder.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoItemsPlaceholderComponent implements OnInit {
    @Input() text = 'No Items';
    @Input() showUnderlay = false;
    @Input() hideImage = false;
    @Input() imgWidth = 150;

    constructor() {
    }

    ngOnInit() {
    }

}
