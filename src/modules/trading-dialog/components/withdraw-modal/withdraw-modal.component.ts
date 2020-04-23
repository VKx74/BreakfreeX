import {Component, Injector, OnInit} from '@angular/core';
import {Modal} from "Shared";
import {BrokerService} from "@app/services/broker.service";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../../Trading/localization/token";
import {AlertService} from "@alert/services/alert.service";
import {ECryptoOperation, IWallet} from "../../../Trading/models/crypto/crypto.models";

@Component({
  selector: 'withdraw-modal',
  templateUrl: './withdraw-modal.component.html',
  styleUrls: ['./withdraw-modal.component.scss'],
  providers: [
    {
      provide: TranslateService,
      useExisting: TradingTranslateService,
    }
  ]
})
export class WithdrawModalComponent extends Modal<string, boolean> implements OnInit {
  _broker: CryptoBroker;
  _balance: number;
  _currency: string;
  stateCheckbox = false;
  formWithdraw: FormGroup;
  readonly MINIMUM_FEE = 0.0002;

  get wallet(): IWallet {
    return  this._broker.activeWallet;
  }

  get pinInputRequired(): boolean {
    return this._broker.operationRequires2FA.indexOf(ECryptoOperation.Withdraw) !== -1;
  }

  constructor(
      injector: Injector,
      private _brokerService: BrokerService,
      private _alertService: AlertService,
      private _translateService: TranslateService,
  ) {
    super(injector);
    this._broker = this._brokerService.activeBroker as CryptoBroker;

    this.formWithdraw = new FormGroup({
      "address": new FormControl('', Validators.required),
      "amount": new FormControl('', Validators.required),
      "pin": new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this._broker.activeWallet$
        .subscribe(wallet => {
          console.log(wallet);
          this._balance = wallet.balance;
          this._currency = wallet.currency;
        });
  }



  processWithdraw() {
    if (!this.wallet) {
      return;
    }

    console.log(this.formWithdraw.controls);
    const controls = this.formWithdraw.controls;
    const address = controls['address'].value;
    const amount = controls['amount'].value;
    const pin = controls['pin'] ? controls['pin'].value : '';

    this._broker.withdraw({
      From: this.wallet.address,
      To: address,
      Amount: Number(amount),
      Currency: this.wallet.currency,
      Pin: pin,
      Fee: this.MINIMUM_FEE,
    }).subscribe(value => {
      console.log(value);
      if (value.result) {
        this._alertService.success(this._translateService.get('tradeManager.withdrawSent'));
        this.close();
      } else {
        this.close();
        this._alertService.error("you don't have access this currency");
      }
    }, error => {
      this._alertService.error(error);
    });

  }




}
