import { IWebSocketConfig } from "../../interfaces/socket/WebSocketConfig";
import { AppConfigService } from '../app.config.service';
import { Observable, Subscription, Subject } from 'rxjs';
import { ITradeTick } from '@app/models/common/tick';
import { IdentityService } from '../auth/identity.service';
import { BrokerResponseMessageBase } from "modules/Trading/models/communication";
import { BrokerSocketService } from "./broker.socket.service";
import { BinanceFutureAccountUpdateResponse, BinanceFutureLoginRequest, BinanceFutureLoginResponse, BinanceFutureMessageType, IBinanceFutureAccountUpdatedData } from "modules/Trading/models/crypto/binance-futures/binance-futures.communication";

export abstract class BinanceFuturesSocketService extends BrokerSocketService {
  private _onMessageSubscription: Subscription;
  private _tickSubject: Subject<ITradeTick> = new Subject<ITradeTick>();
  private _accountUpdatedSubject: Subject<IBinanceFutureAccountUpdatedData> = new Subject<IBinanceFutureAccountUpdatedData>();

  get usePingPongs(): boolean {
    return false;
  }

  get tickSubject(): Subject<ITradeTick> {
    return this._tickSubject;
  }

  get accountUpdatedSubject(): Subject<IBinanceFutureAccountUpdatedData> {
    return this._accountUpdatedSubject;
  }

  constructor(protected _identityService: IdentityService) {
    super(_identityService);
    this._token = "Bearer " + this._identityService.token;
    this._onMessageSubscription = this.onMessage.subscribe(value => {
      try {

        const msgData = value as BrokerResponseMessageBase;
        const msgTypeString = msgData && msgData.Type ? msgData.Type.toLowerCase() : "";

        // if (msgTypeString === MTMessageType.Quote.toLowerCase()) {
        //   this._processNewQuote(msgData);
        //   return;
        // }

        if (msgTypeString === BinanceFutureMessageType.AccountUpdate.toLowerCase()) {
          this._processAccountUpdate(msgData);
          return;
        }

        // if (msgTypeString === MTMessageType.OrdersUpdate.toLowerCase()) {
        //   this._processOrdersUpdate(msgData);
        //   return;
        // }

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
    this._brokerConnected = false;
    // this.send(new MTLogoutRequest());
    this.close();
  }

  public login(data: BinanceFutureLoginRequest): Observable<BinanceFutureLoginResponse> {
    return new Observable<BinanceFutureLoginResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  // public subscribeOnQuotes(symbol: string): Observable<BrokerResponseMessageBase> {
  //   return new Observable<BrokerResponseMessageBase>(subscriber => {
  //     const message = new SubscribeQuote();
  //     message.Data = {
  //       Subscribe: true,
  //       Symbol: symbol
  //     };
  //     this._send(message, subscriber);
  //   });
  // }

  // public unsubscribeFromQuotes(symbol: string): Observable<BrokerResponseMessageBase> {
  //   return new Observable<BrokerResponseMessageBase>(subscriber => {
  //     const message = new SubscribeQuote();
  //     message.Data = {
  //       Subscribe: false,
  //       Symbol: symbol
  //     };
  //     this._send(message, subscriber);
  //   });
  // }

  // private _processNewQuote(msgData: BrokerResponseMessageBase) {
  //   const quoteMessage = msgData as MTQuoteResponse;
  //   this._tickSubject.next({
  //     ask: quoteMessage.Data.Ask,
  //     bid: quoteMessage.Data.Bid,
  //     last: quoteMessage.Data.Last,
  //     volume: quoteMessage.Data.Volume,
  //     symbol: quoteMessage.Data.Symbol
  //   });
  // }

  private _processAccountUpdate(msgData: BrokerResponseMessageBase) {
    const quoteMessage = msgData as BinanceFutureAccountUpdateResponse;
    this._accountUpdatedSubject.next(quoteMessage.Data);
  }

  // private _processOrdersUpdate(msgData: BrokerResponseMessageBase) {
  //   const quoteMessage = msgData as MTOrdersUpdateResponse;
  //   this._ordersUpdatedSubject.next(quoteMessage.Data);
  // }
  
  // private _processOrdersUpdate(msgData: BrokerResponseMessageBase) {
  //   const quoteMessage = msgData as MTOrdersUpdateResponse;
  //   this._ordersUpdatedSubject.next(quoteMessage.Data);
  // }
}


