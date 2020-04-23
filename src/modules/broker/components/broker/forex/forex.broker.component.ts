import {Component} from '@angular/core';
import {EBrokerInstance} from "@app/interfaces/broker/broker";
import {APP_TYPE_BROKERS, ApplicationType} from "@app/enums/ApplicationType";
import { BrokerService } from '@app/services/broker.service';
import {TranslateService} from "@ngx-translate/core";
import {AlertService} from "../../../../Alert";

@Component({
    selector: 'forex-broker-component',
    templateUrl: './forex.broker.component.html',
    styleUrls: ['./forex.broker.component.scss']
})
export class ForexBrokerComponent {
    EBrokerInstance = EBrokerInstance;
    brokers: EBrokerInstance[] = APP_TYPE_BROKERS[ApplicationType.Forex];
    broker: EBrokerInstance = this.brokers[0];

    get brokerConnected(): boolean {
        return this._brokerService.activeBroker !== null && this._brokerService.activeBroker !== undefined;
    }

    constructor(private _brokerService: BrokerService,
        private _translateService: TranslateService,
        private _alertService: AlertService) {
    }
}
