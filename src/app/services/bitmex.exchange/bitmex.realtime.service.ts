import {Inject, Injectable} from "@angular/core";
import {RealtimeServiceBase} from "../../interfaces/exchange/realtime.service";
import {EExchange} from "../../models/common/exchange";
import {WebsocketBase} from "../../interfaces/socket/socketBase";
import {EMarketType} from "../../models/common/marketType";
import {BitmexSocketService} from "@app/services/socket/bitmex.socket.service";

@Injectable()
export class BitmexRealtimeService extends RealtimeServiceBase {

    constructor(@Inject(BitmexSocketService) private ws: WebsocketBase) {
        super(ws);
        this._action = 'bitmex/subscribe/realtime';
        this. _level2Channel = 'level2';
        this. _tickerChannel = 'trade';
        this. _level2MessageType = 'L2Update';
        this. _tickerMessageType = 'TickerMessage';
        this._supportedExchanges = [EExchange.Bitmex];
        this._supportedMarkets = [EMarketType.Crypto];
    }
}
