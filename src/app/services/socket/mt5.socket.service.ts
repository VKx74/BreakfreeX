import { WebsocketBase } from "../../interfaces/socket/socketBase";
import { IWebSocketConfig } from "../../interfaces/socket/WebSocketConfig";
import { AppConfigService } from '../app.config.service';
import { Injectable } from "@angular/core";
import { Observable, Subscriber, Subscription, Subject } from 'rxjs';
import { MT5ResponseMessageBase, MT5LoginRequest, EMT5MessageType, SubscribeQuote, MT5QuoteResponse, MT5PlaceOrderRequest, MT5PlaceOrderResponse, MT5LoginResponse, MT5EditOrderRequest, MT5EditOrderResponse, MT5CloseOrderRequest, MT5CloseOrderResponse, MT5LogoutRequest, MT5RequestMessageBase, MT5GetOrderHistoryRequest, MT5AccountUpdateResponse, IMT5AccountUpdatedData, IMT5OrderData, MT5OrdersUpdateResponse, MT5GetOrderHistoryResponse } from 'modules/Trading/models/forex/mt/mt.communication';
import { IMT5Tick } from '@app/models/common/tick';

@Injectable()
export class MT5SocketService extends WebsocketBase {
  private _subscribers: { [id: string]: Subscriber<MT5ResponseMessageBase>; } = {};
  private _onMessageSubscription: Subscription;
  private _tickSubject: Subject<IMT5Tick> = new Subject<IMT5Tick>();
  private _accountUpdatedSubject: Subject<IMT5AccountUpdatedData> = new Subject<IMT5AccountUpdatedData>();
  private _ordersUpdatedSubject: Subject<IMT5OrderData[]> = new Subject<IMT5OrderData[]>();

  get tickSubject(): Subject<IMT5Tick> {
    return this._tickSubject;
  } 
  
  get accountUpdatedSubject(): Subject<IMT5AccountUpdatedData> {
    return this._accountUpdatedSubject;
  }
  
  get ordersUpdatedSubject(): Subject<IMT5OrderData[]> {
    return this._ordersUpdatedSubject;
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
          this._processNewQuote(msgData);
          return;
        }
        
        if (msgData.Type === EMT5MessageType.AccountUpdate) {
          this._processAccountUpdate(msgData);
          return;
        } 
        
        if (msgData.Type === EMT5MessageType.OrdersUpdate) {
          this._processOrdersUpdate(msgData);
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

  public login(login: MT5LoginRequest): Observable<MT5LoginResponse> {
    return new Observable<MT5LoginResponse>(subscriber => {
      this._subscribers[login.MessageId] = subscriber;
      this.send(login);
    });
  }

  public logout(data: MT5LogoutRequest): Observable<MT5ResponseMessageBase> {
    return new Observable<MT5ResponseMessageBase>(subscriber => {
      this._subscribers[data.MessageId] = subscriber;
      this.send(data);
    });
  }

  public getOrderHistory(data: MT5GetOrderHistoryRequest): Observable<MT5GetOrderHistoryResponse> {
    return new Observable<MT5GetOrderHistoryResponse>(subscriber => {
      this._subscribers[data.MessageId] = subscriber;
      this.send(data);
    });
  }

  public placeOrder(data: MT5PlaceOrderRequest): Observable<MT5PlaceOrderResponse> {
    return new Observable<MT5PlaceOrderResponse>(subscriber => {
      this._subscribers[data.MessageId] = subscriber;
      this.send(data);
    });
  }

  public editOrder(data: MT5EditOrderRequest): Observable<MT5EditOrderResponse> {
    return new Observable<MT5EditOrderResponse>(subscriber => {
      this._subscribers[data.MessageId] = subscriber;
      this.send(data);
    });
  }

  public closeOrder(data: MT5CloseOrderRequest): Observable<MT5CloseOrderResponse> {
    return new Observable<MT5CloseOrderResponse>(subscriber => {
      this._subscribers[data.MessageId] = subscriber;
      this.send(data);
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

  private _processNewQuote(msgData: MT5ResponseMessageBase) {
    const quoteMessage = msgData as MT5QuoteResponse;
    this._tickSubject.next({
      ask: quoteMessage.Data.Ask,
      bid: quoteMessage.Data.Bid,
      last: quoteMessage.Data.Last,
      volume: quoteMessage.Data.Volume,
      symbol: quoteMessage.Data.Symbol
    });
  }
  
  private _processAccountUpdate(msgData: MT5ResponseMessageBase) {
    const quoteMessage = msgData as MT5AccountUpdateResponse;
    this._accountUpdatedSubject.next(quoteMessage.Data);
  }

  private _processOrdersUpdate(msgData: MT5ResponseMessageBase) {
    const quoteMessage = msgData as MT5OrdersUpdateResponse;
    this._ordersUpdatedSubject.next(quoteMessage.Data);
  }
}


