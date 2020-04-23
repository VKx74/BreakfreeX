import {Component} from "@angular/core";
import {TradingTranslateService} from "../../../localization/token";
import {TranslateService} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import {BrokerService} from "@app/services/broker.service";
import { ForexOrderConfiguratorModalComponent } from '../forex-order-configurator-modal/forex-order-configurator-modal.component';

@Component({
    selector: 'oanda-trade-manager',
    templateUrl: 'oanda-trade-manager.component.html',
    styleUrls: ['oanda-trade-manager.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class OandaTradeManagerComponent {

    get brokerConnected(): boolean {
        return this._broker != null;
    }

    private get _broker(): OandaBrokerService {
        return this.brokerService.activeBroker as OandaBrokerService;
    }

    constructor(private _dialog: MatDialog,
                private brokerService: BrokerService) {
    }

    placeOrder() {
        this._dialog.open(ForexOrderConfiguratorModalComponent);
    }
}
