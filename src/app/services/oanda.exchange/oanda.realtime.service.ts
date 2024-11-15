import {Inject, Injectable} from "@angular/core";
import {RealtimeServiceBase} from "../../interfaces/exchange/realtime.service";
import {WebsocketBase} from "../../interfaces/socket/socketBase";
import {EExchange} from "../../models/common/exchange";
import {EMarketType} from "../../models/common/marketType";
import {OandaSocketService} from "@app/services/socket/oanda.socket.service";
import {IInstrument} from "@app/models/common/instrument";
import {IWSSubscriptionBody} from "@app/models/coinbase.exchange/models";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';

@Injectable()
export class OandaRealtimeService extends RealtimeServiceBase {

    get ExchangeInstance(): EExchangeInstance {
        return EExchangeInstance.OandaExchange;
    }

    constructor(@Inject(OandaSocketService) private ws: WebsocketBase) {
        super(ws);
        this._action = 'oanda/subscribe/realtime';
        this._level2Channel = '';
        this._tickerChannel = 'trade';
        this._level2MessageType = '';
        this._tickerMessageType = 'TickerMessage';
        this._supportedMarkets = [EMarketType.Forex];
    }

    protected _createSubscriptionMessage(channel: string, action: string, instrument: IInstrument): IWSSubscriptionBody {
        const id = this._counter + instrument.id + Date.now().toString();
        this._counter++;

        const subscribtionBody: IWSSubscriptionBody = {
            MsgType: 'SubscribeMessage',
            Channel: channel,
            Product: instrument.id,
            Market: instrument.exchange,
            IsSubscribe: true
        };

        return subscribtionBody;
    }
}
