import { Component } from '@angular/core';
import { IBrokerState } from '@app/interfaces/broker/broker';
import { BrokerService } from '@app/services/broker.service';
import { BinanceConnectionData } from 'modules/Trading/models/crypto/binance/binance.models';
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

    getKeyText(item: IBrokerState<BinanceConnectionData>) {
        if (!item.state || !item.state.APIKey) {
            return 'Not specified';
        }

        const apiKey = item.state.APIKey;
        const apiKeyLength = apiKey.length;
        return apiKey.slice(0, 1) + "******" + apiKey.slice(apiKeyLength - 4, apiKeyLength);
        
    }

    getEnvironment(item: IBrokerState<BinanceConnectionData>) {
        if (!item.state || !item.state.BinanceEnvironment) {
            return 'Not specified';
        }

        return item.state.BinanceEnvironment;
    }
}