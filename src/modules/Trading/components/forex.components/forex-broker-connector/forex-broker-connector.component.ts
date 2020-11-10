import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../localization/token";
import {BrokerService} from "@app/services/broker.service";
import {ApplicationTypeService} from "@app/services/application-type.service";
import { Component } from "@angular/core";

@Component({
    selector: 'forex-broker-connector',
    templateUrl: 'forex-broker-connector.component.html',
    styleUrls: ['forex-broker-connector.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class ForexBrokerConnectorComponent {
    applicationType$ = this._applicationTypeService.applicationTypeChanged;
    // EBrokerInstance = EBrokerInstance;

    get instanceType() {
        const brokerService = this.brokerService;

        return brokerService && brokerService.activeBroker && brokerService.activeBroker.instanceType;
    }

    constructor(private brokerService: BrokerService,
                private _applicationTypeService: ApplicationTypeService) {
    }
}