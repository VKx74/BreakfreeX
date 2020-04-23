import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'sidebar-toggle',
    templateUrl: './sidebar-toggle.component.html',
    styleUrls: ['./sidebar-toggle.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarToggleComponent implements OnInit {
    @Input() sidebarShown = false;

    constructor() {
    }

    ngOnInit() {
    }
}
