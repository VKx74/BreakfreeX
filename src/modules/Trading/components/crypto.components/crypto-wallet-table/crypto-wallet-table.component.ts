import {Component, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../../localization/token";
import {Subject, Subscription} from "rxjs";
import {IWallet} from "../../../models/crypto/crypto.models";
import {MatDialog} from "@angular/material/dialog";
import {BrokerService} from "../../../../../app/services/broker.service";
import {CryptoWithdrawDialogComponent} from "../crypto.withdraw-dialog/crypto.withdraw-dialog.component";
import {CryptoDepositDialogComponent} from "../crypto.deposit-dialog/crypto.deposit-dialog.component";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {DataTableComponent} from "../../../../datatable/components/data-table/data-table.component";

@Component({
    selector: 'app-crypto-wallet-table',
    templateUrl: './crypto-wallet-table.component.html',
    styleUrls: ['./crypto-wallet-table.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class CryptoWalletTableComponent implements OnInit {
    destroy$ = new Subject<any>();
    private _wallets: IWallet[] = [];
    private _brokerChangesSubscription: Subscription;
    private _walletsChanged: Subscription;

    get wallets(): IWallet[] {
        return this._wallets;
    }


    @ViewChild('table', {read: DataTableComponent, static: false}) table: DataTableComponent;

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

    showWithdrawDialog(wallet: IWallet) {
        this._dialog.open(CryptoWithdrawDialogComponent, {
            maxWidth: '800px',
            data: {
                wallet: wallet
            }
        })
            .afterClosed().subscribe();
    }

    showDepositDialog(wallet: IWallet) {
        this._dialog.open(CryptoDepositDialogComponent, {
            maxWidth: '800px',
            data: {
                wallet: wallet
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
            });
        }
    }

}
