import {Component, OnInit} from '@angular/core';
import {APP_TYPE_BROKERS, ApplicationType} from "../../../../../app/enums/ApplicationType";
import {EBrokerInstance} from "../../../../../app/interfaces/broker/broker";
import {BrokerService} from "../../../../../app/services/broker.service";
import {TranslateService} from "@ngx-translate/core";
import {AlertService} from "../../../../Alert";
import {ComponentIdentifier} from "@app/models/app-config";

@Component({
    selector: 'crypto-broker-component',
    templateUrl: './crypto.broker.component.html',
    styleUrls: ['./crypto.broker.component.scss']
})
export class CryptoBrokerComponent implements OnInit {
    brokerOptions: EBrokerInstance[] = APP_TYPE_BROKERS[ApplicationType.Crypto];
    EBrokerInstance = EBrokerInstance;

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    get brokerConnected(): boolean {
        return this._brokerService.activeBroker !== null && this._brokerService.activeBroker !== undefined;
    }

    get connectedBrokerDescription(): string {
        if (this._brokerService.activeBroker && this._brokerService.userInfo) {
            return this._brokerService.activeBroker.instanceType + " Username: " + this._brokerService.userInfo.username;
        }
    }

    selectedBroker: string;

    constructor(private _brokerService: BrokerService,
                private _translateService: TranslateService,
                private _alertService: AlertService) {
    }

    ngOnInit() {
        this.initBroker();
    }

    initBroker() {
        this.selectedBroker = this.brokerOptions.length ? this.brokerOptions[0] : null;
    }

    onBrokerSelect(brokerName: EBrokerInstance) {
        this.selectedBroker = brokerName;
    }

    disconnect() {
        this._brokerService.disposeActiveBroker().subscribe(value => {
            if (value.result) {
                this._alertService.success(this._translateService.get('broker.brokerDisconnected'));
            } else {
                this._alertService.error(this._translateService.get('broker.failedDisconnectBroker'));
                console.table(value);
            }
        });
    }

}
