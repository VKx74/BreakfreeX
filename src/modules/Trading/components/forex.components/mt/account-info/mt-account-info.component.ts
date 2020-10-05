import {Component} from '@angular/core';
import { MTBroker } from '@app/services/mt/mt.broker';
import { MTTradingAccount } from 'modules/Trading/models/forex/mt/mt.models';
import { BrokerService } from '@app/services/broker.service';

@Component({
    selector: 'mt-account-info',
    templateUrl: './mt-account-info.component.html',
    styleUrls: ['./mt-account-info.component.scss']
})
export class MTAccountInfoComponent {
    decimals = 2;
    
    get activeAccount(): MTTradingAccount {
        const mtBroker = this._broker.activeBroker as MTBroker;
        if (!mtBroker) {
            return null;
        }

        return mtBroker.accountInfo;
    }

    constructor(private _broker: BrokerService) {
    }
}
