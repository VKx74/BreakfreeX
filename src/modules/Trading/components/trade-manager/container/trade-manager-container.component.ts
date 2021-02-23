import {Component} from "@angular/core";
import { EBrokerInstance } from "@app/interfaces/broker/broker";
import { BrokerService } from "@app/services/broker.service";
import {TranslateService} from "@ngx-translate/core";
import { TradingTranslateService } from "modules/Trading/localization/token";

@Component({
    selector: 'trade-manager-container',
    templateUrl: 'trade-manager-container.component.html',
    styleUrls: ['trade-manager-container.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class TradeManagerComponentContainer {
    EBrokerInstance = EBrokerInstance;

    get instanceType() {
        const brokerService = this.brokerService;

        return brokerService && brokerService.activeBroker && brokerService.activeBroker.instanceType;
    }

    constructor(private brokerService: BrokerService) {
    }
}
