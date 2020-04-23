import {Component, OnInit} from '@angular/core';
import {BrokerService} from "../../../../../../app/services/broker.service";
import {BrokerFactory, CreateBrokerActionResult} from "../../../../../../app/factories/broker.factory";
import {AlertService} from "../../../../../Alert";
import {TranslateService} from "@ngx-translate/core";
import {EBrokerInstance} from "../../../../../../app/interfaces/broker/broker";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IOkexLoginAction} from "../../../../../Trading/models/crypto/okex/okex.models";

@Component({
    selector: 'okex-broker-login-component',
    templateUrl: './okex.broker.login.component.html',
    styleUrls: ['./okex.broker.login.component.scss']
})
export class OkexBrokerLoginComponent implements OnInit {
    showSpinner = false;
    okexForm: FormGroup;

    constructor(private _brokerService: BrokerService,
                private _brokerFactory: BrokerFactory,
                private _alertService: AlertService,
                private _translateService: TranslateService,
                private _fb: FormBuilder) {
    }

    ngOnInit() {
        this.okexForm = this.getOkexAccountForm();
    }

    getOkexAccountForm() {
        return this._fb.group({
            apiKey: ['', Validators.required],
            secretKey: ['', Validators.required],
            passPhrase: ['', Validators.required],
        });
    }

    getOkexAuthData(): IOkexLoginAction {
        return {
            ApiKey: this.okexForm.controls['apiKey'].value,
            Secret: this.okexForm.controls['secretKey'].value,
            PassPhrase: this.okexForm.controls['passPhrase'].value,
        };
    }

    connect() {
        this.showSpinner = true;
        const initData = this.getOkexAuthData();
        this._brokerFactory.tryCreateInstance(EBrokerInstance.OKExBroker, initData)
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
