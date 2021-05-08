import { Component } from '@angular/core';
import { BrokerService } from '@app/services/broker.service';
import { ConnectedAccountInfoComponent } from '../../../shared/connected-account-info';

@Component({
    selector: 'mt-connected-account-info',
    templateUrl: './mt-connected-account-info.component.html',
    styleUrls: ['./mt-connected-account-info.component.scss']
})
export class MTConnectedAccountInfoComponent extends ConnectedAccountInfoComponent {
    constructor(protected _brokerService: BrokerService) {
        super(_brokerService);
    }
}
