import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {merge, Observable, of} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {FiltrationParams} from "@app/models/filtration-params";
import {ExchangeManagementApiService} from "../../../Admin/services/exchange-management-api.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {JsUtil} from "../../../../utils/jsUtil";
import {ETransactionState, ETransactionType, IWallet} from "../../../Trading/models/crypto/crypto.models";
import {ModalDepositComponent} from "../../../trading-dialog/components/modal-deposit/modal-deposit.component";
import {LocalTimeZone, TimeZoneManager, TzUtils} from "TimeZones";
import {AlertService} from "@alert/services/alert.service";
import {BrokerService} from "@app/services/broker.service";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../../Trading/localization/token";
import {catchError, filter, map, switchMap} from "rxjs/operators";
import {memoize} from "@decorators/memoize";

@Component({
    selector: 'deposits',
    templateUrl: './deposits.component.html',
    styleUrls: ['./deposits.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService,
        }
    ]
})
export class DepositsComponent implements OnInit {
    activeBroker$ = this._brokerService.activeBroker$ as Observable<CryptoBroker>;
    brokerInitializationState$ = this._brokerService.brokerInitializationState$;
    ETransactionState = ETransactionState;

    get activeBroker() {
        return this._brokerService.activeBroker as CryptoBroker;
    }

    constructor(private _route: ActivatedRoute,
                private _apiService: ExchangeManagementApiService,
                private _dialog: MatDialog,
                private _identityService: IdentityService,
                private _alertService: AlertService,
                private _brokerService: BrokerService,
                private _timeZoneManager: TimeZoneManager
    ) {
    }

    ngOnInit() {
    }

    showQrCode() {
        this._dialog.open(ModalDepositComponent, {})
            .afterClosed().subscribe();
    }

    copyExample(example: string) {
        JsUtil.copyStringToClipboard(example);
    }



    @memoize()
    private _getDepositsObs(wallet: IWallet) {
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
                    transactions.filter(transaction => transaction.transactType === ETransactionType.Deposit)),
            );
    }
}
