import {Component} from '@angular/core';
import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import { OandaTradingAccount } from 'modules/Trading/models/forex/oanda/oanda.models';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import { MT5TradingAccount } from 'modules/Trading/models/forex/mt/mt.models';

@Component({
    selector: 'mt5-account-info',
    templateUrl: './mt5-account-info.component.html',
    styleUrls: ['./mt5-account-info.component.scss']
})
export class MT5AccountInfoComponent {
    get activeAccount(): MT5TradingAccount {
        return this._mt5Broker.accountInfo;
    }

    constructor(private _mt5Broker: MT5Broker) {
    }
}
