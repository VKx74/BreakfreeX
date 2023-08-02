import { Component, Injector } from '@angular/core';
import { Modal } from 'modules/Shared/helpers/modal';

@Component({
    selector: 'liability-policy-trading-modal',
    templateUrl: './liability-policy-trading.component.html',
    styleUrls: ['./liability-policy-trading.component.scss']
})
export class LiabilityPolicyTradingModalComponent extends Modal {
    constructor(private _injector: Injector) {
        super(_injector);
    }

    ngOnInit() {
    }

    ngOnDestroy() {

    }
}
