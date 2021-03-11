import { Inject } from "@angular/core";
import { EBrokerInstance } from "@app/interfaces/broker/broker";
import { AlgoService } from "../algo.service";
import { InstrumentMappingService } from "../instrument-mapping.service";
import { BinanceFuturesUsdSocketService } from "../socket/binance-futures-usd.socket.service";
import { BinanceFuturesSocketService } from "../socket/binance-futures.socket.service";
import { BinanceFuturesBroker } from "./binance-futures.broker";

export class BinanceFuturesUsdBroker extends BinanceFuturesBroker {
    protected get _accountName(): string {
        return "10000000000";
    }
    
    protected get _server(): string {
        return "Binance Futures USDT";
    }

    instanceType: EBrokerInstance = EBrokerInstance.BinanceFuturesUSD;
    
    constructor(@Inject(BinanceFuturesUsdSocketService) protected _ws: BinanceFuturesSocketService, protected _algoService: AlgoService, protected _instrumentMappingService: InstrumentMappingService) {
        super(_ws, _algoService, _instrumentMappingService);
    }
}