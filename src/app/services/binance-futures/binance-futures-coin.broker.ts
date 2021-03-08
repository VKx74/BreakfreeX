import { Inject } from "@angular/core";
import { EBrokerInstance } from "@app/interfaces/broker/broker";
import { AlgoService } from "../algo.service";
import { InstrumentMappingService } from "../instrument-mapping.service";
import { BinanceFuturesCoinSocketService } from "../socket/binance-futures-coin.socket.service";
import { BinanceFuturesSocketService } from "../socket/binance-futures.socket.service";
import { BinanceFuturesBroker } from "./binance-futures.broker";

export class BinanceFuturesCoinBroker extends BinanceFuturesBroker {
    protected get _accountName(): string {
        return "Binance Futures COIN";
    }
    
    protected get _server(): string {
        return "Binance Futures";
    }

    instanceType: EBrokerInstance = EBrokerInstance.BinanceFuturesCOIN;

    constructor(@Inject(BinanceFuturesCoinSocketService) protected _ws: BinanceFuturesSocketService, protected _algoService: AlgoService, protected _instrumentMappingService: InstrumentMappingService) {
        super(_ws, _algoService, _instrumentMappingService);
    }
}