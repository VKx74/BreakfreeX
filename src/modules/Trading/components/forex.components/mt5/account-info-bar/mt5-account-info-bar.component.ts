import {Component} from '@angular/core';
import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import { OandaTradingAccount } from 'modules/Trading/models/forex/oanda/oanda.models';

@Component({
    selector: 'mt5-account-info-bar',
    templateUrl: './mt5-account-info-bar.component.html',
    styleUrls: ['./mt5-account-info-bar.component.scss']
})
export class MT5AccountInfoBarComponent {
    get activeAccount(): OandaTradingAccount {
        return this._oandaBrokerService.userInfo;
    }

    constructor(private _oandaBrokerService: OandaBrokerService) {
    }
}
