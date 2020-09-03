import {Component} from "@angular/core";
import {TradingTranslateService} from "../../../localization/token";
import {TranslateService} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import {BrokerService} from "@app/services/broker.service";
import { ForexOrderConfiguratorModalComponent } from '../forex-order-configurator-modal/forex-order-configurator-modal.component';

@Component({
    selector: 'mt5-trade-manager',
    templateUrl: 'mt5-trade-manager.component.html',
    styleUrls: ['mt5-trade-manager.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class MT5TradeManagerComponent {

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
