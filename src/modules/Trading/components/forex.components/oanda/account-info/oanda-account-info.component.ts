import {Component} from '@angular/core';
import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import { OandaTradingAccount } from 'modules/Trading/models/forex/oanda/oanda.models';

@Component({
    selector: 'oanda-account-info',
    templateUrl: './oanda-account-info.component.html',
    styleUrls: ['./oanda-account-info.component.scss']
})
export class OandaAccountInfoComponent {
    get activeAccount(): OandaTradingAccount {
        return this._oandaBrokerService.userInfo;
    }

    constructor(private _oandaBrokerService: OandaBrokerService) {
    }
}
