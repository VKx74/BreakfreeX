import { Component } from '@angular/core';
import { BrokerService } from '@app/services/broker.service';
import { ConnectedAccountInfoComponent } from '../../../shared/connected-account-info';

@Component({
    selector: 'binance-connected-account-info',
    templateUrl: './binance-connected-account-info.component.html',
    styleUrls: ['./binance-connected-account-info.component.scss']
})
export class BinanceConnectedAccountInfoComponent extends ConnectedAccountInfoComponent {
    constructor(protected _brokerService: BrokerService) {
        super(_brokerService);
    }
}