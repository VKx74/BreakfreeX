import {Component, EventEmitter, Output} from '@angular/core';
import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import { OandaTradingAccount } from 'modules/Trading/models/forex/oanda/oanda.models';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import { MT5TradingAccount } from 'modules/Trading/models/forex/mt/mt.models';
import { BrokerService } from '@app/services/broker.service';
import { EBrokerInstance, IBrokerState } from '@app/interfaces/broker/broker';

@Component({
    selector: 'connected-account-info',
    templateUrl: './connected-account-info.component.html',
    styleUrls: ['./connected-account-info.component.scss']
})
export class ConnectedAccountInfoComponent {
    private _accounts: IBrokerState[];
    @Output() onBrokerSelected = new EventEmitter<IBrokerState>();
    
    selectedItem: IBrokerState;

    get accounts(): IBrokerState[] {
        return this._accounts;
    }

    constructor(private _brokerService: BrokerService) {
        this._accounts = this._brokerService.getSavedBroker().filter(_ => _.brokerType === EBrokerInstance.MT5);
    }

    removeSavedAccount(account: IBrokerState) {
       this._brokerService.removeSavedBroker(account);
       this._accounts = this._brokerService.getSavedBroker().filter(_ => _.brokerType === EBrokerInstance.MT5);
    }

    selectItem(account: IBrokerState) {
        this.selectedItem = account;
        this.onBrokerSelected.next(account);
    }
    
    isActiveAccount(account: IBrokerState): boolean {
        if (!this._brokerService.activeBroker) {
            return false;
        }

        const activeAccount = this._brokerService.getActiveBroker();
        if (!activeAccount) {
            return false;
        }

        return activeAccount.account === account.account && activeAccount.server === account.server;
    }
}
