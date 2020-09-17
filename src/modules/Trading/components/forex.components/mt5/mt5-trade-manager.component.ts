import {Component} from "@angular/core";
import {TradingTranslateService} from "../../../localization/token";
import {TranslateService} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import {BrokerService} from "@app/services/broker.service";
import { MT5OrderConfiguratorModalComponent } from './order-configurator-modal/mt5-order-configurator-modal.component';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import { OrderTypes } from 'modules/Trading/models/models';

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
    
    get positionsAmount(): number {
        const mt5Broker = this.brokerService.activeBroker as MT5Broker;
        if (!mt5Broker || !mt5Broker.positions) {
            return 0;
        }

        return mt5Broker.positions.length;
    }  
    
    public get ordersAmount(): number {
        const mt5Broker = this.brokerService.activeBroker as MT5Broker;
        if (!mt5Broker || !mt5Broker.orders) {
            return 0;
        }

        return mt5Broker.orders.filter(_ => _.Type === OrderTypes.Market).length;
    } 

    public get pendingAmount(): number {
        const mt5Broker = this.brokerService.activeBroker as MT5Broker;
        if (!mt5Broker || !mt5Broker.orders) {
            return 0;
        }

        return mt5Broker.orders.filter(_ => _.Type !== OrderTypes.Market).length;
    } 

    public get historyAmount(): number {
        const mt5Broker = this.brokerService.activeBroker as MT5Broker;
        if (!mt5Broker || !mt5Broker.ordersHistory) {
            return 0;
        }

        return mt5Broker.ordersHistory.length;
    } 
    

    private get _broker(): OandaBrokerService {
        return this.brokerService.activeBroker as OandaBrokerService;
    }

    constructor(private _dialog: MatDialog,
                private brokerService: BrokerService) {
    }

    placeOrder() {
        this._dialog.open(MT5OrderConfiguratorModalComponent);
    }
}
