import { Component } from '@angular/core';
import { AlertService } from "@alert/services/alert.service";
import { TranslateService } from "@ngx-translate/core";
import { BrokerFactory } from '@app/factories/broker.factory';
import { EBrokerInstance, IBrokerState } from '@app/interfaces/broker/broker';
import { BrokerService } from '@app/services/broker.service';
import { BinanceConnectionData } from 'modules/Trading/models/crypto/binance/binance.models';
import { BrokerLogin } from '../../shared/broker-login';

@Component({
    selector: 'binance-broker-login',
    templateUrl: './binance.broker.login.component.html',
    styleUrls: ['./binance.broker.login.component.scss']
})
export class BinanceBrokerLoginComponent extends BrokerLogin {
    public apiKey = "";
    public apiSecret = "";
    
    constructor(protected _brokerFactory: BrokerFactory,
        protected _translateService: TranslateService,
        protected _brokerService: BrokerService,
        protected _alertService: AlertService) {
        super(_brokerFactory, _translateService, _brokerService, _alertService);
    }

    connect() {
        if (!this.policyAccepted || !this.apiKey || !this.apiSecret) {
            return;
        }

        const initData: BinanceConnectionData = {
            APIKey: this.apiKey,
            APISecret: this.apiSecret
        };

        this._connect(this.brokerInstance, initData);
    }

    savedAccountExists(): boolean {
        return this._savedAccountExists(this.brokerInstance);
    }

    disconnect(): void {
        this._disconnect();
    }

    brokerSelected(input: IBrokerState<BinanceConnectionData>) {
        this.apiKey = input.state.APIKey;
        this.apiSecret = input.state.APISecret;
    }
}
