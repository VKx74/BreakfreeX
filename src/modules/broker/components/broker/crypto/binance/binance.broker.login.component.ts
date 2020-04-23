import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BrokerService} from "@app/services/broker.service";
import {BrokerFactory, CreateBrokerActionResult} from "@app/factories/broker.factory";
import {AlertService} from "@alert/services/alert.service";
import {TranslateService} from "@ngx-translate/core";

import {EBrokerInstance} from "@app/interfaces/broker/broker";
import {BinanceExchangeModels} from "@app/models/binance.exchange/models";
import LoginCredentials = BinanceExchangeModels.LoginCredentials;

@Component({
    selector: 'binance-broker-login',
    templateUrl: './binance.broker.login.component.html',
    styleUrls: ['./binance.broker.login.component.scss']
})
export class BinanceBrokerLoginComponent implements OnInit {
    showSpinner = false;
    formGroup: FormGroup;

    constructor(private _brokerService: BrokerService,
                private _brokerFactory: BrokerFactory,
                private _alertService: AlertService,
                private _translateService: TranslateService,
                private _fb: FormBuilder) {
    }

    ngOnInit() {
        this.formGroup = this._fb.group({
            apiKey: ['', Validators.required],
            secretKey: ['', Validators.required]
        });
    }

    connect() {
        this.showSpinner = true;
        const creds: LoginCredentials = {
            ApiKey: this.formGroup.controls['apiKey'].value,
            Secret: this.formGroup.controls['secretKey'].value
        };

        this._brokerFactory.tryCreateInstance(EBrokerInstance.BinanceBroker, creds)
            .subscribe((value: CreateBrokerActionResult) => {
                this.showSpinner = false;

                if (!value.result) {
                    this._alertService.error(value.msg, this._translateService.get('broker.broker'));
                    return;
                }

                const brokerInstance = value.brokerInstance;

                if (brokerInstance) {
                    this._brokerService.setActiveBroker(brokerInstance).subscribe(setBrokerResult => {
                        if (!setBrokerResult.result) {
                            this._alertService.error(setBrokerResult.msg, this._translateService.get('broker.broker'));
                            brokerInstance.dispose().subscribe(disposeResult => {
                            });
                        } else {
                            this._alertService.success(this._translateService.get('broker.connectedBroker'), this._translateService.get('broker.broker'));
                        }
                    }, setBrokerError => {
                        brokerInstance.dispose().subscribe(disposeResult => {
                        });
                        this._alertService.error(this._translateService.get('broker.setFailed'), this._translateService.get('broker.broker'));
                    });
                } else {
                    this._alertService.error(this._translateService.get('broker.createFailed'), this._translateService.get('broker.broker'));
                }


            }, error => {
                this.showSpinner = false;
                this._alertService.error(this._translateService.get('broker.createFailed'), this._translateService.get('broker.broker'));
            });
    }
}
