import {Component, ElementRef, Inject, Injector, OnInit, ViewChild} from '@angular/core';
import {Modal} from "Shared";
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../../localization/token";
import {AlertService} from "../../../../Alert";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ETransactionType, IWallet, IWalletTransaction} from "../../../models/crypto/crypto.models";
import {BrokerService} from "@app/services/broker.service";
import {LocalTimeZone, TimeZoneManager, TzUtils} from "TimeZones";
import { CryptoBroker } from '@app/interfaces/broker/crypto.broker';

@Component({
    selector: 'app-crypto.deposit-dialog',
    templateUrl: './crypto.deposit-dialog.component.html',
    styleUrls: ['./crypto.deposit-dialog.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class CryptoDepositDialogComponent extends Modal<string> implements OnInit {

    private _cryptoBroker: CryptoBroker;

    @ViewChild('codeContainer', {static: false}) codeContainer: ElementRef<HTMLInputElement>;

    history: IWalletTransaction[];

    get wallet(): IWallet {
        return this.data.wallet;
    }

    get qrURL() {
        return `https://api.qrserver.com/v1/create-qr-code/?data=${this.wallet.address}&amp;size=150x150`;
    }

    get depositAddress(): string {
        return this.wallet.address;
    }

    constructor(injector: Injector, private _alertService: AlertService, @Inject(MAT_DIALOG_DATA) public data: any,
                private _brokerService: BrokerService, private _timeZoneManager: TimeZoneManager) {
        super(injector);
        this._cryptoBroker = this._brokerService.activeBroker as CryptoBroker;
    }

    ngOnInit() {
       this.updateTransactions();
    }

    addToClipboard(inputElement) {
        inputElement.select();
        document.execCommand('copy');
        inputElement.setSelectionRange(0, 0);
        this._alertService.info('Code has been copied to clipboard');
    }

    getFormattedDate(time: number): string {
        if (!time) {
            return "-";
        }

        const date = TzUtils.convertDateTz(new Date(time), LocalTimeZone, this._timeZoneManager.timeZone);
        return moment(date).format('YYYY MMM DD HH:mm:ss');
    }

    trackByID(index, item: IWalletTransaction) {
        return item.id;
    }

    updateTransactions() {
        this._cryptoBroker.getWalletTransaction(this.wallet.currency).subscribe((transactions: IWalletTransaction[]) => {
            this.history = transactions.filter((transaction) => {
                return transaction.transactType !== ETransactionType.Withdrawal &&
                    transaction.transactType !== ETransactionType.Total;
            });
        });
    }
}
