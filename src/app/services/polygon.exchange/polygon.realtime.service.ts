import {Inject, Injectable} from "@angular/core";
import {RealtimeServiceBase} from "../../interfaces/exchange/realtime.service";
import {EExchange} from "../../models/common/exchange";
import {WebsocketBase} from "../../interfaces/socket/socketBase";
import {EMarketType} from "../../models/common/marketType";
import {PolygonSocketService} from "@app/services/socket/polygon.socket.service";

@Injectable()
export class PolygonRealtimeService extends RealtimeServiceBase {

    constructor(@Inject(PolygonSocketService) private ws: WebsocketBase) {
        super(ws);
        this._action = 'polygon/subscribe/realtime';
        this. _level2Channel = 'level2';
        this. _tickerChannel = 'trade';
        this. _level2MessageType = 'L2Update';
        this. _tickerMessageType = 'TickerMessage';
        this._supportedExchanges = [EExchange.Polygon];
        this._supportedMarkets = [EMarketType.Crypto, EMarketType.Forex, EMarketType.Stocks];
    }
}
