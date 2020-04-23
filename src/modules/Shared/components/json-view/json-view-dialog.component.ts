import {Component, Injector, OnInit} from '@angular/core';
import {Modal} from "../../helpers/modal";

export interface IJSONViewDialogData {
    title?: string;
    json: object;
}

@Component({
    selector: 'events-log-item-details',
    templateUrl: './json-view-dialog.component.html',
    styleUrls: ['./json-view-dialog.component.scss']
})
export class JSONViewDialogComponent extends Modal<IJSONViewDialogData> implements OnInit {
    constructor(private _injector: Injector) {
        super(_injector);
    }

    ngOnInit() {
    }

}
