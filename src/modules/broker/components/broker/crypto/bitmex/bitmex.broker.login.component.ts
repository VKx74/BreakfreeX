import {Component, OnInit} from '@angular/core';
import {BrokerService} from "../../../../../../app/services/broker.service";
import {BrokerFactory, CreateBrokerActionResult} from "../../../../../../app/factories/broker.factory";
import {AlertService} from "../../../../../Alert";
import {TranslateService} from "@ngx-translate/core";
import {EBrokerInstance} from "../../../../../../app/interfaces/broker/broker";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IBitmexLoginAction} from "../../../../../Trading/models/crypto/bitmex/bitmex.models";

@Component({
    selector: 'bitmex-broker-login-component',
    templateUrl: './bitmex.broker.login.component.html',
    styleUrls: ['./bitmex.broker.login.component.scss']
})
export class BitmexBrokerLoginComponent implements OnInit {
    showSpinner = false;
    bitmexForm: FormGroup;

    constructor(private _brokerService: BrokerService,
                private _brokerFactory: BrokerFactory,
                private _alertService: AlertService,
                private _translateService: TranslateService,
                private _fb: FormBuilder) {
    }

    ngOnInit() {
        this.bitmexForm = this.getBitmexAccountForm();
    }

    getBitmexAccountForm() {
        return this._fb.group({
            apiKey: ['', Validators.required],
            secretKey: ['', Validators.required]
        });
    }

    getBitmexAuthData(): IBitmexLoginAction {
        return {
            apiKey: this.bitmexForm.controls['apiKey'].value,
            secret: this.bitmexForm.controls['secretKey'].value,
            // apiKey: 'IZ444Z_wBe4Vv_uG7hh4cKgd',
            // secret: 'sCzwIv_VaLIGJSfliwsaw8zGfPyRKmSmqwsz5rE2ah2uEeUM',
        };
    }

    connect() {
        // TODO: Create common connect method for all brokers
        this.showSpinner = true;
        const initData = this.getBitmexAuthData();
        this._brokerFactory.tryCreateInstance(EBrokerInstance.BitmexBroker, initData)
            .subscribe((value: CreateBrokerActionResult) => {
                this.showSpinner = false;
                if (!value.result) {
                    this._alertService.error(value.msg, this._translateService.get('broker.broker'));
                } else {
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
                }
            }, error => {
                this.showSpinner = false;
                this._alertService.error(this._translateService.get('broker.createFailed'), this._translateService.get('broker.broker'));
            });
    }


}
