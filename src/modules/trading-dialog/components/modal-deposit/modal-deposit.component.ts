import {Component, Injector, OnInit} from '@angular/core';
import {Modal} from "Shared";
import {BrokerService} from "@app/services/broker.service";
import {JsUtil} from "../../../../utils/jsUtil";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../../Trading/localization/token";

@Component({
  selector: 'modal-deposit',
  templateUrl: './modal-deposit.component.html',
  styleUrls: ['./modal-deposit.component.scss'],
  providers: [
    {
      provide: TranslateService,
      useExisting: TradingTranslateService
    }
  ]
})
export class ModalDepositComponent extends Modal<string> implements OnInit {

  private _broker: CryptoBroker;
  address: string;
  currency: string;

  get qrURL() {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${this.address}&amp;size=150x150`;
  }
  constructor(
      injector: Injector,
      private _brokerService: BrokerService,
  ) {
    super(injector);
    this._broker = this._brokerService.activeBroker as CryptoBroker;
  }

  ngOnInit() {
    this.address = this._broker.activeWallet.address;
    this.currency = this._broker.activeWallet.currency;
  }

  copyAddress(address: string) {
    JsUtil.copyStringToClipboard(address);
  }

}
