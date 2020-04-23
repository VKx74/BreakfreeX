import {Component, OnInit, ViewChild} from '@angular/core';
import {BrokerService} from "@app/services/broker.service";
import {Subject, Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {IWallet} from "../../../Trading/models/crypto/crypto.models";
import {DataTableComponent} from "../../../datatable/components/data-table/data-table.component";
import {MatRadioGroup} from "@angular/material/radio";
import {FormControl} from "@angular/forms";
import {filter} from "rxjs/operators";
import {IBroker} from "@app/interfaces/broker/broker";

const DEFAULT_WALLETS_LIST = [
    {
        balance: 25.50,
        currency: 'BTC',
        address: 'dfgfgsfdgsdfgsfdg',
        locked: 2
    },
    {
        balance: 25.50,
        currency: 'ETH',
        address: 'sfgsfgserereerer',
        locked: 2
    },
    {
        balance: 12.12,
        currency: 'UAH',
        address: 'qerqereqwrqwer',
        locked: 2
    }
];

@Component({
    selector: 'wallets-list',
    templateUrl: './wallets-list.component.html',
    styleUrls: ['./wallets-list.component.scss']
})
export class WalletsListComponent implements OnInit {
    // destroy$ = new Subject<any>();
    walletSelect = new FormControl();
    private _wallets: IWallet[] = [];
    private _brokerChangesSubscription: Subscription;
    private _walletsChanged: Subscription;

    get wallets(): IWallet[] {
        if (this._wallets.length) {
            return this._wallets;
        }
    }


    get activeWallet() {
        const activeBroker = this.activeBroker;
        return activeBroker ? activeBroker.activeWallet : null;
    }

    get activeBroker() {
        return this._brokerService.activeBroker as CryptoBroker;
    }

    constructor(private _dialog: MatDialog,
                private _brokerService: BrokerService) {
    }

    ngOnInit() {
        this._brokerChangesSubscription = this._brokerService.activeBroker$
            .subscribe((broker: IBroker) => {
                if (broker) {
                    this._subscribe();
                    this._loadWallets();
                }
            });
        this._subscribe();
        this._loadWallets();

        this.walletSelect
            .valueChanges
            .pipe(
                filter(v => !!v)
            ).subscribe(res => this.changeActiveWallet(res));

    }

    trackBy(index, wallet: IWallet) {
        return wallet.address; // or item.id
    }

    ngOnDestroy() {
        // this.destroy$.next();
        // this.destroy$.complete();
        if (this._brokerChangesSubscription) {
            this._brokerChangesSubscription.unsubscribe();
            // this._brokerChangesSubscription = null;
        }
    }

    changeActiveWallet(wallet: IWallet) {
        const activeBroker = this._brokerService.activeBroker as CryptoBroker;
        if (activeBroker) {
            activeBroker.setActiveWallet(wallet);
        }
    }

    private _subscribe() {
        if (this._walletsChanged) {
            this._walletsChanged.unsubscribe();
            this._walletsChanged = null;
        }

        const broker = this._brokerService.activeBroker as CryptoBroker;
        if (broker && broker.onWalletsInfoUpdated) {
            this._walletsChanged = broker.onWalletsInfoUpdated
                .subscribe(() => {
                    this._loadWallets();
                });
        }
    }

    private _loadWallets() {
        const broker = this._brokerService.activeBroker as CryptoBroker;
        if (broker) {
            broker.getWallets(true).subscribe((wallets: IWallet[]) => {
                this._wallets = wallets && wallets.length ? wallets : DEFAULT_WALLETS_LIST;
                if (broker.activeWallet) {
                    this.walletSelect.setValue(this.activeWallet);
                }
            });
        }
    }
}
