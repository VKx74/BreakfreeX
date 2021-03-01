import { EBrokerInstance } from "@app/interfaces/broker/broker";
import { BinanceFuturesBroker } from "./binance-futures.broker";

export class BinanceFuturesCoinBroker extends BinanceFuturesBroker {
    instanceType: EBrokerInstance = EBrokerInstance.BinanceFuturesCOIN;
}