import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../../localization/token";
import {MatDialog} from "@angular/material/dialog";
import {CryptoWithdrawDialogComponent} from "../crypto.withdraw-dialog/crypto.withdraw-dialog.component";
import {CryptoDepositDialogComponent} from "../crypto.deposit-dialog/crypto.deposit-dialog.component";
import {Subject, of, Subscription} from "rxjs";
import {BrokerService} from "../../../../../app/services/broker.service";
import {CryptoBroker} from "../../../../../app/interfaces/broker/crypto.broker";
import {IWallet} from "../../../models/crypto/crypto.models";

@Component({
    selector: 'crypto-wallet',
    templateUrl: './crypto.wallet.component.html',
    styleUrls: ['./crypto.wallet.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class CryptoWalletComponent implements OnInit {
    private _currentWallet: IWallet;

    destroy$ = new Subject<any>();

    private _wallets: IWallet[] = [];
    private _brokerChangesSubscription: Subscription;
    private _walletsChanged: Subscription;

    get wallets(): IWallet[] {
        return this._wallets;
    }

    get currentWallet(): IWallet {
        if (!this._currentWallet && this.wallets.length) {
            this._currentWallet = this.wallets[0];
        }

        return this._currentWallet;
    }

    constructor(private _dialog: MatDialog,
                private _brokerService: BrokerService) {
        this._brokerChangesSubscription = this._brokerService.activeBroker$.subscribe(() => {
            this._subscribe();
        });
    }

    ngOnInit() {
        this._subscribe();
        this._loadWallets();
    }

    walletCaption(wallet) {
        return of(wallet.currency);
    }

    onWalletSelect(wallet) {
        this._currentWallet = wallet;
    }

    showWithdrawDialog() {
        this._dialog.open(CryptoWithdrawDialogComponent, {
            maxWidth: '800px',
            data: {
                wallet: this._currentWallet
            }
        })
            .afterClosed().subscribe();
    }

    showDepositDialog() {
        this._dialog.open(CryptoDepositDialogComponent, {
            maxWidth: '800px',
            data: {
                wallet: this._currentWallet
            }
        })
            .afterClosed().subscribe();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();

        if (this._brokerChangesSubscription) {
            this._brokerChangesSubscription.unsubscribe();
            this._brokerChangesSubscription = null;
        }
    }

    private _subscribe() {
        if (this._walletsChanged) {
            this._walletsChanged.unsubscribe();
            this._walletsChanged = null;
        }

        const broker = this._brokerService.activeBroker as CryptoBroker;
        if (broker) {
            this._walletsChanged = broker.onWalletsInfoUpdated.subscribe(() => {
                this._loadWallets();
            });
        }
    }

    private _loadWallets() { 
        const broker = this._brokerService.activeBroker as CryptoBroker;
        if (broker) {
            broker.getWallets(true).subscribe((wallets: IWallet[]) => {
                this._wallets = wallets;
                this._setSelectedOrder();
            });
        }
    }

    private _setSelectedOrder() {
        if (!this._currentWallet) {
            return;
        }

        for (let i = 0; i < this._wallets.length; i++) {
            if (this._wallets[i].currency === this._currentWallet.currency) {
                this._currentWallet = this._wallets[i];
                break;
            }
        }
    }

}
