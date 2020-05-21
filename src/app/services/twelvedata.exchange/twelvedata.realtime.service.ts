import {Inject, Injectable} from "@angular/core";
import {RealtimeServiceBase} from "../../interfaces/exchange/realtime.service";
import {EExchange} from "../../models/common/exchange";
import {WebsocketBase} from "../../interfaces/socket/socketBase";
import {EMarketType} from "../../models/common/marketType";
import {TwelvedataSocketService} from "@app/services/socket/twelvedata.socket.service";

@Injectable()
export class TwelvedataRealtimeService extends RealtimeServiceBase {

    constructor(@Inject(TwelvedataSocketService) private ws: WebsocketBase) {
        super(ws);
        this._action = 'polygon/subscribe/realtime';
        this. _level2Channel = 'level2';
        this. _tickerChannel = 'trade';
        this. _level2MessageType = 'L2Update';
        this. _tickerMessageType = 'TickerMessage';
        this._supportedExchanges = [EExchange.Twelvedata];
        this._supportedMarkets = [EMarketType.Crypto, EMarketType.Forex, EMarketType.Stocks];
    }
}
