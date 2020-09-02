import {Component} from '@angular/core';
import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import { OandaTradingAccount } from 'modules/Trading/models/forex/oanda/oanda.models';

@Component({
    selector: 'oanda-account-info-bar',
    templateUrl: './oanda-account-info-bar.component.html',
    styleUrls: ['./oanda-account-info-bar.component.scss']
})
export class OandaAccountInfoBarComponent {
    get activeAccount(): OandaTradingAccount {
        return this._oandaBrokerService.userInfo;
    }

    constructor(private _oandaBrokerService: OandaBrokerService) {
    }
}
