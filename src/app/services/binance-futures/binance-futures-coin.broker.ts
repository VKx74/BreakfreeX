import { Inject } from "@angular/core";
import { EBrokerInstance } from "@app/interfaces/broker/broker";
import { BinanceFuturesPosition } from "modules/Trading/models/crypto/binance-futures/binance-futures.models";
import { IBinancePrice } from "modules/Trading/models/crypto/shared/models.communication";
import { OrderSide } from "modules/Trading/models/models";
import { AlgoService } from "../algo.service";
import { InstrumentMappingService } from "../instrument-mapping.service";
import { BinanceFuturesCoinSocketService } from "../socket/binance-futures-coin.socket.service";
import { BinanceFuturesSocketService } from "../socket/binance-futures.socket.service";
import { BinanceFuturesBroker } from "./binance-futures.broker";

export class BinanceFuturesCoinBroker extends BinanceFuturesBroker {
    protected get _accountName(): string {
        return "20000000000";
    }
    
    protected get _server(): string {
        return "Binance Futures COIN";
    }

    instanceType: EBrokerInstance = EBrokerInstance.BinanceFuturesCOIN;

    constructor(@Inject(BinanceFuturesCoinSocketService) protected _ws: BinanceFuturesSocketService, protected _algoService: AlgoService, protected _instrumentMappingService: InstrumentMappingService) {
        super(_ws, _algoService, _instrumentMappingService);
    }

    protected _getQuoteCurrency(symbol: string): string {
        if (this._symbolToAsset[symbol]) {
            return this._symbolToAsset[symbol];
        }
        for (const i of this._instruments) {
            if (i.symbol === symbol) {
                this._symbolToAsset[symbol] = i.baseInstrument;
                return i.baseInstrument;
            }
        }
    }
    
    protected _updatePositionByQuote(position: BinanceFuturesPosition, quote: IBinancePrice) {
        position.CurrentPrice = quote.Price;
        const contractSize = this._instrumentContractSize[position.Symbol];
        if (!contractSize) {
            return;
        }

        if (position.CurrentPrice && position.Price) {
            if (position.Side === OrderSide.Buy) {
                position.NetPL = (1 / position.Price - 1 / position.CurrentPrice) * Math.abs(position.Size) * contractSize;
            } else {
                position.NetPL = (1 / position.CurrentPrice - 1 / position.Price) * Math.abs(position.Size) * contractSize;
            }
        }
    }
}