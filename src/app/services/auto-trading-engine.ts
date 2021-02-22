import { SignalService } from "./signal.service";
import { BrokerService } from "@app/services/broker.service";
import { Injectable } from "@angular/core";
import {
    TradeSettings
} from "../../modules/AutoTradingAlerts/models/TradeSettingsBase";

@Injectable()
export class AutoTradingEngine {

    private _messageQueue: TradeSettings[] = [];

    constructor(private _brokerService: BrokerService,
        private _signalService: SignalService) {

        this._brokerService.brokerInitializationState$
            .subscribe(value => {
                if (!this._brokerService.isConnected || !this._brokerService.activeBroker) {
                    return;
                }

                for (let i in this._messageQueue) {
                    this._processOrderSignal(this._messageQueue[i]);
                }

                this._messageQueue = [];
            });

        this._signalService.onTradeSignal.subscribe(value => {
            if (!this._brokerService.isInitialized) {
                this._messageQueue.push(value);
                return;
            }

            if (!this._brokerService.isConnected || !this._brokerService.activeBroker) {
                return;
            }

            this._processOrderSignal(value);
        });
    }

    private _processOrderSignal(value: TradeSettings) {
        if (!this._brokerService.activeBroker) {
            return;
        }
    }
}
