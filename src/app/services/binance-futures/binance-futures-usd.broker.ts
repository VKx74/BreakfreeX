import { EBrokerInstance } from "@app/interfaces/broker/broker";
import { BinanceFuturesBroker } from "./binance-futures.broker";

export class BinanceFuturesUsdBroker extends BinanceFuturesBroker {
    instanceType: EBrokerInstance = EBrokerInstance.BinanceFuturesUSD;
}