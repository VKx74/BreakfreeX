import {Component, Input, OnInit} from '@angular/core';
import {TabHandler} from "./tab-handler";

@Component({
    selector: 'tab-container',
    templateUrl: './tab-container.component.html',
    providers: [
        TabHandler
    ]
})
export class TabContainerComponent {
    private _active: boolean = null;

    @Input() set active(value: boolean) {
        if (this._active == null) { // initial
            this._active = value;

            return;
        } else if (value !== this._active) {
            this._active = value;

            if (value) {
                this._tabHandler.activate();
            } else {
                this._tabHandler.deactivate();
            }
        }
    }

    constructor(private _tabHandler: TabHandler) {
    }

    ngOnInit() {
    }

}
