import { Injectable } from "@angular/core";
import { IdentityService } from "../../../app/services/auth/identity.service";
import { TemplatesStorageService } from './templates-storage.service';
import { AlertService } from '@alert/services/alert.service';
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from '@app/services/broker.service';
import { MT5OrderConfiguratorModalComponent } from 'modules/Trading/components/forex.components/mt5/order-configurator-modal/mt5-order-configurator-modal.component';
import { MT5OrderConfig } from 'modules/Trading/components/forex.components/mt5/order-configurator/mt5-order-configurator.component';
import { OrderTypes } from 'modules/Trading/models/models';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import { IInstrument } from '@app/models/common/instrument';

@Injectable()
export class TradeFromChartService {
    private _chart: TradingChartDesigner.Chart;

    constructor(private _brokerService: BrokerService, private _dialog: MatDialog) {
       
    }

    public setChart(chart: TradingChartDesigner.Chart) {
        this._chart = chart;
    }
    
    public IsTradingEnabledHandler(): boolean {
        if (!this._brokerService.activeBroker || !this._chart) {
            return false;
        }

        if (this._brokerService.activeBroker instanceof MT5Broker) {
            const mt5Broker = this._brokerService.activeBroker as MT5Broker;
            return mt5Broker.isInstrumentAvailable(this._chart.instrument as IInstrument);
        } else {
            return false;
        }
    }

    public PlaceLimitOrder(price: number): void {
        if (this._brokerService.activeBroker instanceof MT5Broker) {
            const mt5Broker = this._brokerService.activeBroker as MT5Broker;
            const orderConfig = MT5OrderConfig.create();
            const pricePrecision = mt5Broker.instrumentDecimals(this._chart.instrument.symbol);
            orderConfig.type = OrderTypes.Limit;
            orderConfig.instrument = this._chart.instrument as IInstrument;
            orderConfig.price = Math.roundToDecimals(price, pricePrecision);
            this._dialog.open(MT5OrderConfiguratorModalComponent, {
                data: {
                    tradeConfig: orderConfig
                }
            });
        }
        
    }
}
