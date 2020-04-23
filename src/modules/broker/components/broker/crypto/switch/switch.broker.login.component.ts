import {Component, OnInit} from '@angular/core';
import {BrokerService} from "../../../../../../app/services/broker.service";
import {BrokerFactory} from "../../../../../../app/factories/broker.factory";
import {AlertService} from "../../../../../Alert";
import {TranslateService} from "@ngx-translate/core";
import {FormBuilder} from "@angular/forms";
import {EBrokerInstance} from "@app/interfaces/broker/broker";

@Component({
    selector: 'switch-broker-login-component',
    templateUrl: './switch.broker.login.component.html',
    styleUrls: ['./switch.broker.login.component.scss']
})
export class SwitchBrokerLoginComponent implements OnInit {
    showSpinner = false;

    constructor(private _brokerService: BrokerService,
                private _brokerFactory: BrokerFactory,
                private _alertService: AlertService,
                private _translateService: TranslateService,
                private _fb: FormBuilder) {
    }

    ngOnInit() {
    }


    connect() {
        this.showSpinner = true;

        this._brokerService.setDefaultBroker().subscribe(setBrokerResult => {
            this.showSpinner = false;
            if (!setBrokerResult.result) {
                this._alertService.error(setBrokerResult.msg, this._translateService.get('broker.broker'));
            } else {
                this._alertService.success(this._translateService.get('broker.connectedBroker'), this._translateService.get('broker.broker'));
            }
        }, setBrokerError => {
            this._alertService.error(this._translateService.get('broker.setFailed'), this._translateService.get('broker.broker'));
            this.showSpinner = false;
        });
    }


}
