import {Component} from "@angular/core";
import {EBrokerInstance} from "../../../../app/interfaces/broker/broker";
import {BrokerService} from "../../../../app/services/broker.service";
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../localization/token";

@Component({
    selector: 'forex-trade-manager',
    templateUrl: 'forex-trade-manager.component.html',
    styleUrls: ['forex-trade-manager.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class ForexTradeManagerComponent {
    EBrokerInstance = EBrokerInstance;

    get instanceType() {
        const brokerService = this.brokerService;

        return brokerService && brokerService.activeBroker && brokerService.activeBroker.instanceType;
    }

    constructor(private brokerService: BrokerService) {
    }
}
