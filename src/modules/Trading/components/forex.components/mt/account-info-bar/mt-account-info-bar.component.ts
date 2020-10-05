import {Component} from '@angular/core';
import { BrokerService } from '@app/services/broker.service';
import { MTBroker } from '@app/services/mt/mt.broker';
import { MTTradingAccount, MTStatus } from 'modules/Trading/models/forex/mt/mt.models';

@Component({
    selector: 'mt-account-info-bar',
    templateUrl: './mt-account-info-bar.component.html',
    styleUrls: ['./mt-account-info-bar.component.scss']
})
export class MTAccountInfoBarComponent {
    MTStatus = MTStatus;
    decimals = 2;
    get activeAccount(): MTTradingAccount {
        const mtBroker = this._broker.activeBroker as MTBroker;
        if (!mtBroker) {
            return null;
        }

        return mtBroker.accountInfo;
    }
 
    get status(): MTStatus {
        const mtBroker = this._broker.activeBroker as MTBroker;
        if (!mtBroker) {
            return null;
        }
        

        return mtBroker.status;
    }

    constructor(private _broker: BrokerService) {
    }
}
