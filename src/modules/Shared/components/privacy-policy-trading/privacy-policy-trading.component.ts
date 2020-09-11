import { Component, Injector } from '@angular/core';
import { Modal } from 'modules/Shared/helpers/modal';

@Component({
    selector: 'privacy-policy-trading-modal',
    templateUrl: './privacy-policy-trading.component.html',
    styleUrls: ['./privacy-policy-trading.component.scss']
})
export class PrivacyPolicyTradingModalComponent extends Modal {
    constructor(private _injector: Injector) {
        super(_injector);
    }

    ngOnInit() {
    }

    ngOnDestroy() {

    }
}
