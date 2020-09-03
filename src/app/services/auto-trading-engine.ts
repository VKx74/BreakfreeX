import {EBrokerInstance} from "../interfaces/broker/broker";
import {OrderSide, OrderTypes, TradeActionType} from "../../modules/Trading/models/models";
import {SignalService} from "./signal.service";
import {ICryptoPlaceOrderAction} from "../../modules/Trading/models/crypto/crypto.models";
import {BrokerService} from "@app/services/broker.service";
import {Injectable} from "@angular/core";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {
    CancelTradeSettings,
    PlaceTradeSettings,
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

        const activeBroker = this._brokerService.activeBroker;
        if (activeBroker.instanceType === EBrokerInstance.BitmexBroker) {
            const broker = activeBroker as CryptoBroker;

            if (value.TradeActionType === TradeActionType.Place) {
                let placeTradeSettings = value as PlaceTradeSettings;
                let orderAction: ICryptoPlaceOrderAction = {
                    symbol: placeTradeSettings.Symbol,
                    type: placeTradeSettings.Type as OrderTypes,
                    side: placeTradeSettings.Side as OrderSide,
                    size: placeTradeSettings.Size,
                    price: placeTradeSettings.Price,
                    stopPrice: placeTradeSettings.StopPrice
                };

                broker.placeOrder(orderAction).subscribe(cryptoPlaceOrderResponse => {

                });
            } else if (value.TradeActionType === TradeActionType.Cancel) {
                broker.cancelOrder({
                    Id: (value as CancelTradeSettings).OrderId
                }).subscribe(cancelCryptoOrder => {
                });
            }
        }
    }
}
