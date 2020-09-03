import {Component} from '@angular/core';
import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import { OandaTradingAccount } from 'modules/Trading/models/forex/oanda/oanda.models';

@Component({
    selector: 'mt5-account-info',
    templateUrl: './mt5-account-info.component.html',
    styleUrls: ['./mt5-account-info.component.scss']
})
export class MT5AccountInfoComponent {
    get activeAccount(): OandaTradingAccount {
        return this._oandaBrokerService.userInfo;
    }

    constructor(private _oandaBrokerService: OandaBrokerService) {
    }
}
