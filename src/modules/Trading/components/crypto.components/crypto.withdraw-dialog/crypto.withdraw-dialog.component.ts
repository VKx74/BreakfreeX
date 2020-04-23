import {Component, Inject, Injector, Input, OnInit} from '@angular/core';
import {Modal} from "Shared";
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../../localization/token";
import {CryptoBroker, IFeeInfo} from "@app/interfaces/broker/crypto.broker";
import {BrokerService} from "@app/services/broker.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {AlertService} from "../../../../Alert";
import {
    ECryptoOperation,
    ETransactionState,
    ETransactionType,
    IWallet,
    IWalletTransaction
} from "../../../models/crypto/crypto.models";
import {LocalTimeZone, TimeZoneManager, TzUtils} from "TimeZones";
import {ConfirmModalComponent} from "UI";
import {TwoAuthPinValidator} from "Validators";

@Component({
    selector: 'app-crypto.withdraw-dialog',
    templateUrl: './crypto.withdraw-dialog.component.html',
    styleUrls: ['./crypto.withdraw-dialog.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class CryptoWithdrawDialogComponent extends Modal<string> implements OnInit {
    private _broker: CryptoBroker;
    readonly MINIMUM_FEE = 0.0002;

    withdraws: IWalletTransaction[];
    withdrawForm: FormGroup;

    get pinInputRequired(): boolean {
        return this._broker.operationRequires2FA.indexOf(ECryptoOperation.Withdraw) !== -1;
    }

    get feeInputRequired(): boolean {
        return this._broker.withdrawFeeRequired;
    }

    get balance(): number {
        return this.wallet.balance || 0;
    }

    get currency(): string {
        return this.wallet.currency;
    }

    get ETransactionState() {
        return ETransactionState;
    }

    get wallet(): IWallet {
        return this.data.wallet;
    }

    constructor(injector: Injector,
                private _brokerService: BrokerService,
                private _fb: FormBuilder,
                private _dialog: MatDialog,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private _alertService: AlertService,
                private _translateService: TranslateService,
                private _timeZoneManager: TimeZoneManager) {
        super(injector);
        this._broker = this._brokerService.activeBroker as CryptoBroker;
    }

    ngOnInit() {
        this.updateWithdraws();

        this.withdrawForm = this.getWithdrawForm();

        if (this._broker.withdrawFeeRequired) {
            this._broker.getDefaultWithdrawalFee(this.wallet.currency).subscribe((value: IFeeInfo) => {
                if (value) {
                    this.withdrawForm.controls['fee'].setValue(value.fee);
                }
            });
        }
    }

    getWithdrawForm() {
        const group = this._fb.group({
            address: ['', [Validators.required]],
            amount: ['', [Validators.required]],
            fee: [this.MINIMUM_FEE, [Validators.required, Validators.min(this.MINIMUM_FEE)]],
        });

        if (this.pinInputRequired) {
            group.addControl('pin', new FormControl("", [
                Validators.required,
                TwoAuthPinValidator()
            ]));
        }

        return group;
    }

    withdraw() {
        if (!this.wallet) {
            return;
        }

        const controls = this.withdrawForm.controls;
        const address = controls['address'].value;
        const amount = controls['amount'].value;
        const fee = controls['fee'].value;
        const pin = controls['pin'] ? controls['pin'].value : '';

        this._broker.withdraw({
            From: this.wallet.address,
            To: address,
            Amount: Number(amount),
            Currency: this.wallet.currency,
            Pin: pin,
            Fee: Number(fee ? fee : 0)
        }).subscribe(value => {
            if (value.result) {
                this._alertService.success(this._translateService.get('tradeManager.withdrawSent'));
                this.updateWithdraws();
            } else {
                this._alertService.error(value.msg);
            }
        }, error => {
            this._alertService.error(error);
        });
    }

    withdrawAll() {
        this.withdrawForm.controls['amount'].setValue(this.wallet.balance);
    }

    getFormattedDate(time: number): string {
        const date = TzUtils.convertDateTz(new Date(time), LocalTimeZone, this._timeZoneManager.timeZone);
        return moment(date).format('YYYY MMM DD HH:mm:ss');
    }

    cancelWithdraw(transaction: IWalletTransaction) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get(`cancelWithdraw`),
                onConfirm: () => {
                    this._broker.cancelWithdraw({
                        Id: transaction.id
                    }).subscribe(value => {
                        if (value.result) {
                            this._alertService.success(this._translateService.get('tradeManager.withdrawCanceled'));
                            this.updateWithdraws();
                        } else {
                            this._alertService.error(value.msg);
                        }
                    }, error => {
                        this._alertService.error(error.message);
                    });
                }
            }
        } as any).beforeClosed();
    }

    trackByID(index, item: IWalletTransaction) {
        return item.id;
    }

    updateWithdraws() {
        this._broker.getWalletTransaction(this.wallet.currency).subscribe((transactions: IWalletTransaction[]) => {
            this.withdraws = transactions.filter((transaction) => {
                return transaction.transactType === ETransactionType.Withdrawal;
            });
        });
    }
}
