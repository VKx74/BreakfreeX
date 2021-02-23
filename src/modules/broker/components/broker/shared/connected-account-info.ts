import { EventEmitter, Input, Output} from '@angular/core';
import { BrokerService } from '@app/services/broker.service';
import { EBrokerInstance, IBrokerState } from '@app/interfaces/broker/broker';

export class ConnectedAccountInfoComponent {
    protected _accounts: IBrokerState[];
    @Output() onBrokerSelected = new EventEmitter<IBrokerState>();
    @Input() brokerInstance: EBrokerInstance;

    selectedItem: IBrokerState;

    get accounts(): IBrokerState[] {
        return this._accounts;
    }

    constructor(protected _brokerService: BrokerService) {
    }

    removeSavedAccount(account: IBrokerState) {
       this._brokerService.removeSavedBroker(account);
       this._accounts = this._brokerService.getSavedBroker().filter(_ => _.brokerType === this.brokerInstance);
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
    ngOnInit() {
        this._accounts = this._brokerService.getSavedBroker().filter(_ => _.brokerType === this.brokerInstance);
    }
}
