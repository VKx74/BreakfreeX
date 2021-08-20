import {Inject, Injectable} from "@angular/core";
import {RealtimeServiceBase} from "../../interfaces/exchange/realtime.service";
import {WebsocketBase} from "../../interfaces/socket/socketBase";
import {EMarketType} from "../../models/common/marketType";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { BinanceSocketService } from "../socket/binance.socket.service";

@Injectable()
export class BinanceRealtimeService extends RealtimeServiceBase {

    get ExchangeInstance(): EExchangeInstance {
        return EExchangeInstance.BinanceExchange;
    }

    constructor(@Inject(BinanceSocketService) private ws: WebsocketBase) {
        super(ws);
        this._action = 'polygon/subscribe/realtime';
        this. _level2Channel = 'level2';
        this. _tickerChannel = 'trade';
        this. _level2MessageType = 'L2Update';
        this. _tickerMessageType = 'TickerMessage';
        this._supportedMarkets = [EMarketType.Crypto];
    }
}
