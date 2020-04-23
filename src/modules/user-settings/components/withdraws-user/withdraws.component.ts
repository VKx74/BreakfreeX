import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ExchangeManagementApiService} from "../../../Admin/services/exchange-management-api.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {
    ETransactionState,
    ETransactionType,
    IWallet,
    IWalletTransaction
} from "../../../Trading/models/crypto/crypto.models";
import {ConfirmModalComponent} from "UI";
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../../Trading/localization/token";
import {MatDialog} from "@angular/material/dialog";
import {AlertService} from "@alert/services/alert.service";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {BrokerService} from "@app/services/broker.service";
import {WithdrawModalComponent} from "../../../trading-dialog/components/withdraw-modal/withdraw-modal.component";
import {LocalTimeZone, TimeZoneManager, TzUtils} from "TimeZones";
import {FormBuilder} from "@angular/forms";
import {catchError, filter, map, switchMap, tap} from "rxjs/operators";
import {memoize} from "@decorators/memoize";
import {merge, Observable, of} from "rxjs";


@Component({
    selector: 'withdraws',
    templateUrl: './withdraws.component.html',
    styleUrls: ['./withdraws.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService,
        }
    ]
})
export class WithdrawsComponent {
    brokerInitState$ = this._brokerService.brokerInitializationState$;
    activeBroker$ = this._brokerService.activeBroker$ as Observable<CryptoBroker>;
    ETransactionState = ETransactionState;

    get activeBroker() {
        return this._brokerService.activeBroker as CryptoBroker;
    }

    constructor(
        private _dialog: MatDialog,
        private _alertService: AlertService,
        private _translateService: TranslateService,
        private _brokerService: BrokerService,
        private _timeZoneManager: TimeZoneManager
    ) {
    }

    ngOnInit() {
    }

    addWithdraw() {
        this._dialog.open(WithdrawModalComponent, {})
            .afterClosed().subscribe((result: boolean) => {
            // this.updateWithdraws();
        });
    }

    cancelWithdraw(transaction: IWalletTransaction) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get(`cancelWithdraw`),
                onConfirm: () => {
                    this.activeBroker$
                        .pipe(
                            switchMap(broker => broker.cancelWithdraw({Id: transaction.id}))
                        ).subscribe(value => {
                        if (value.result) {
                            this._alertService.success(this._translateService.get('tradeManager.withdrawCanceled'));
                            // // TODO: TEST
                            // this.activeBroker$ = this._brokerService.activeBroker$ as Observable<CryptoBroker>;
                            // this.updateWithdraws();
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

    @memoize()
    getWithdrawsObs(wallet: IWallet) {
        return this.activeBroker$
            .pipe(
                filter(broker => !!broker),
                switchMap(broker => merge(
                    of(broker),
                    broker.onWalletsInfoUpdated
                )),
                switchMap(() => this.activeBroker.getWalletTransaction(wallet.currency)
                    .pipe(catchError(() => []))
                ),
                map(transactions =>
                    transactions.filter(transaction => transaction.transactType === ETransactionType.Withdrawal)),
            );
    }
}
