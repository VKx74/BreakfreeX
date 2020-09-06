import { WebsocketBase } from "../../interfaces/socket/socketBase";
import { IWebSocketConfig } from "../../interfaces/socket/WebSocketConfig";
import { AppConfigService } from '../app.config.service';
import { Injectable } from "@angular/core";
import { Observable, Subscriber, Subscription, Subject } from 'rxjs';
import { MT5ResponseMessageBase, MT5LoginRequest, EMT5MessageType, SubscribeQuote, MT5QuoteResponse } from 'modules/Trading/models/forex/mt/mt.communication';
import { IMT5Tick } from '@app/models/common/tick';

@Injectable()
export class MT5SocketService extends WebsocketBase {
  private _subscribers: { [id: string]: Subscriber<MT5ResponseMessageBase>; } = {};
  private _onMessageSubscription: Subscription;
  private _tickSubject: Subject<IMT5Tick> = new Subject<IMT5Tick>();

  get tickSubject(): Subject<IMT5Tick> {
    return this._tickSubject;
  }

  get config(): IWebSocketConfig {
    return {
      url: AppConfigService.config.apiUrls.MT5WS
    };
  }

  constructor() {
    super();
    this._onMessageSubscription = this.onMessage.subscribe(value => {
      try {
        const msgData = value as MT5ResponseMessageBase;

        if (msgData.Type === EMT5MessageType.Quote) {
          const quoteMessage = msgData as MT5QuoteResponse;
          this._tickSubject.next({
            ask: quoteMessage.Data.Ask,
            bid: quoteMessage.Data.Bid,
            last: quoteMessage.Data.Last,
            volume: quoteMessage.Data.Volume,
            symbol: quoteMessage.Data.Symbol
          });
          return;
        }

        if (msgData && msgData.MessageId && this._subscribers[msgData.MessageId]) {
          const subscription = this._subscribers[msgData.MessageId];
          delete this._subscribers[msgData.MessageId];
          subscription.next(msgData);
          subscription.complete();
        }

      } catch (e) {
        console.log('Failed to process ws message in MT5SocketService');
        console.log(e);
      }
    });
  }

  public dispose() {
    if (this._onMessageSubscription) {
      this._onMessageSubscription.unsubscribe();
  }

    this.send(new MT5LoginRequest());
    this.close();
  }

  public login(login: MT5LoginRequest): Observable<MT5ResponseMessageBase> {
    return new Observable<MT5ResponseMessageBase>(subscriber => {
      this._subscribers[login.MessageId] = subscriber;
      this.send(login);
    });
  }

  public subscribeOnQuotes(symbol: string): Observable<MT5ResponseMessageBase> {
    return new Observable<MT5ResponseMessageBase>(subscriber => {
      const message = new SubscribeQuote();
      message.Data = {
        Subscribe: true,
        Symbol: symbol
      };
      this._subscribers[message.MessageId] = subscriber;
      this.send(message);
    });
  }
  
  public unsubscribeFromQuotes(symbol: string): Observable<MT5ResponseMessageBase> {
    return new Observable<MT5ResponseMessageBase>(subscriber => {
      const message = new SubscribeQuote();
      message.Data = {
        Subscribe: true,
        Symbol: symbol
      };
      this._subscribers[message.MessageId] = subscriber;
      this.send(message);
    });
  }
}


