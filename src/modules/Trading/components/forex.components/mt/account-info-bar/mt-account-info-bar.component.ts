import { Component } from '@angular/core';
import { BrokerService } from '@app/services/broker.service';
import { MTBroker } from '@app/services/mt/mt.broker';
import { MTTradingAccount } from 'modules/Trading/models/forex/mt/mt.models';
import { BrokerConnectivityStatus } from 'modules/Trading/models/models';

@Component({
    selector: 'mt-account-info-bar',
    templateUrl: './mt-account-info-bar.component.html',
    styleUrls: ['./mt-account-info-bar.component.scss']
})
export class MTAccountInfoBarComponent {
    BrokerConnectivityStatus = BrokerConnectivityStatus;
    decimals = 0;
    get activeAccount(): MTTradingAccount {
        const mtBroker = this._broker.activeBroker as MTBroker;
        if (!mtBroker) {
            return null;
        }

        return mtBroker.accountInfo;
    }

    get status(): BrokerConnectivityStatus {
        const mtBroker = this._broker.activeBroker as MTBroker;
        if (!mtBroker) {
            return null;
        }


        return mtBroker.status;
    }

    constructor(private _broker: BrokerService) {
    }
}
