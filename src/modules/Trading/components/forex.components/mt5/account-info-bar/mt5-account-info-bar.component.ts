import {Component} from '@angular/core';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import { MT5TradingAccount, MTStatus } from 'modules/Trading/models/forex/mt/mt.models';

@Component({
    selector: 'mt5-account-info-bar',
    templateUrl: './mt5-account-info-bar.component.html',
    styleUrls: ['./mt5-account-info-bar.component.scss']
})
export class MT5AccountInfoBarComponent {
    MTStatus = MTStatus;
    decimals = 2;
    get activeAccount(): MT5TradingAccount {
        return this._broker.accountInfo;
    }
 
    get status(): MTStatus {
        return this._broker.status;
    }

    constructor(private _broker: MT5Broker) {
    }
}
