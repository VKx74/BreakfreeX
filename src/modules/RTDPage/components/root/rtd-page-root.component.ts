import { Component } from "@angular/core";
import { Intercom } from 'ng-intercom';

@Component({
    selector: 'rtd-page-root',
    templateUrl: 'rtd-page-root.component.html',
    styleUrls: ['rtd-page-root.component.scss']
})
export class RTDPageRootComponent {
    constructor(private _intercom: Intercom) {
    }

    ngAfterViewInit() {
        try {
            this._intercom.boot({
                app_id: "sv09ttz9",
                hide_default_launcher: true
            });
        } catch (error) {
            console.error(error);
        }

        const loader = document.getElementById("initial-loader");
        if (loader) {
            loader.remove();
        }
    }
}
