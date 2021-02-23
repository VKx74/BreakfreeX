import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../localization/token";
import {BrokerService} from "@app/services/broker.service";
import { Component } from "@angular/core";

@Component({
    selector: 'bridge-broker-connector',
    templateUrl: 'bridge-broker-connector.component.html',
    styleUrls: ['bridge-broker-connector.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class BridgeBrokerConnectorComponent {

    get instanceType() {
        const brokerService = this.brokerService;

        return brokerService && brokerService.activeBroker && brokerService.activeBroker.instanceType;
    }

    constructor(private brokerService: BrokerService) {
    }
}