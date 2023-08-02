import { Component, Injector } from '@angular/core';
import { Modal } from 'modules/Shared/helpers/modal';

@Component({
    selector: 'profit-policy-trading-modal',
    templateUrl: './profit-policy-trading.component.html',
    styleUrls: ['./profit-policy-trading.component.scss']
})
export class ProfitPolicyTradingModalComponent extends Modal {
    constructor(private _injector: Injector) {
        super(_injector);
    }

    ngOnInit() {
    }

    ngOnDestroy() {

    }
}
