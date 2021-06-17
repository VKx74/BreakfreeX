import { Component } from '@angular/core';
import { IBrokerState } from '@app/interfaces/broker/broker';
import { BrokerService } from '@app/services/broker.service';
import { MTConnectionData } from 'modules/Trading/models/forex/mt/mt.models';
import { ConnectedAccountInfoComponent } from '../../../shared/connected-account-info';

@Component({
    selector: 'mt-connected-account-info',
    templateUrl: './mt-connected-account-info.component.html',
    styleUrls: ['./mt-connected-account-info.component.scss']
})
export class MTConnectedAccountInfoComponent extends ConnectedAccountInfoComponent {

    get filteredAccounts(): IBrokerState[] {
        return this.accounts.filter(_ => (_.state as MTConnectionData).Password);
    }

    constructor(protected _brokerService: BrokerService) {
        super(_brokerService);
    }
}
