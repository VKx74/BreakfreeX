import { WebsocketBase } from "../../interfaces/socket/socketBase";
import { IWebSocketConfig, ReadyStateConstants } from "../../interfaces/socket/WebSocketConfig";
import { AppConfigService } from '../app.config.service';
import { Injectable } from "@angular/core";
import { Observable, Subscriber, Subscription, Subject } from 'rxjs';
import { MTResponseMessageBase, MTLoginRequest, EMTMessageType, SubscribeQuote, MTQuoteResponse, MTPlaceOrderRequest, MTPlaceOrderResponse, MTLoginResponse, MTEditOrderRequest, MTEditOrderResponse, MTCloseOrderRequest, MTCloseOrderResponse, MTLogoutRequest, MTRequestMessageBase, MTGetOrderHistoryRequest, MTAccountUpdateResponse, IMTAccountUpdatedData, IMTOrderData, MTOrdersUpdateResponse, MTGetOrderHistoryResponse, MTAuthRequest, GetQuote, GetSymbolTradeInfo, MTSymbolTradeInfoResponse } from 'modules/Trading/models/forex/mt/mt.communication';
import { ITradeTick } from '@app/models/common/tick';
import { IdentityService } from '../auth/identity.service';

export abstract class MTSocketService extends WebsocketBase {
  private _subscribers: { [id: string]: Subscriber<MTResponseMessageBase>; } = {};
  private _authSucceeded: boolean;
  private _brokerConnected: boolean;
  private _token: string;
  private _onMessageSubscription: Subscription;
  private _tickSubject: Subject<ITradeTick> = new Subject<ITradeTick>();
  private _accountUpdatedSubject: Subject<IMTAccountUpdatedData> = new Subject<IMTAccountUpdatedData>();
  private _ordersUpdatedSubject: Subject<IMTOrderData[]> = new Subject<IMTOrderData[]>();

  get usePingPongs(): boolean {
    return false;
  }

  get tickSubject(): Subject<ITradeTick> {
    return this._tickSubject;
  }

  get accountUpdatedSubject(): Subject<IMTAccountUpdatedData> {
    return this._accountUpdatedSubject;
  }

  get ordersUpdatedSubject(): Subject<IMTOrderData[]> {
    return this._ordersUpdatedSubject;
  }

  get config(): IWebSocketConfig {
    return {
      url: AppConfigService.config.apiUrls.MT5WS
    };
  }

  constructor(private _identityService: IdentityService) {
    super();
    this._token = "Bearer " + this._identityService.token;
    this._onMessageSubscription = this.onMessage.subscribe(value => {
      try {
        const msgData = value as MTResponseMessageBase;
        const msgTypeString = msgData && msgData.Type ? msgData.Type.toLowerCase() : "";

        if (msgTypeString === EMTMessageType.Quote.toLowerCase()) {
          this._processNewQuote(msgData);
          return;
        }

        if (msgTypeString === EMTMessageType.AccountUpdate.toLowerCase()) {
          this._processAccountUpdate(msgData);
          return;
        }

        if (msgTypeString === EMTMessageType.OrdersUpdate.toLowerCase()) {
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
    // if (this._onMessageSubscription) {
    //   this._onMessageSubscription.unsubscribe();
    // }
    this._brokerConnected = false;
    this.send(new MTLogoutRequest());
    this.close();
  }

  sendAuth(): Observable<void> {
    return new Observable<void>(subscriber => {
      if (this._identityService.isExpired) {
          this._identityService.refreshTokens().subscribe(() => {
            this._open(subscriber);
          }, (error) => {
            this._open(subscriber);
          });
      } else {
        this._open(subscriber);
      }
    });
  }

  setConnectivity(connected: boolean) {
    this._brokerConnected = connected;
  }

  open(): Observable<void> {
    return new Observable<void>(subscriber => {
      if (this.readyState === ReadyStateConstants.OPEN) {
          subscriber.next();
          return;
      }

      if (this._identityService.isExpired) {
          this._identityService.refreshTokens().subscribe(() => {
            this._open(subscriber);
          }, (error) => {
            this._open(subscriber);
          });
      } else {
        this._open(subscriber);
      }

    });
  }

  protected _open(subscriber: Subscriber<void>) {
    super.open().subscribe(() => {
      const authRequest = new MTAuthRequest();
      authRequest.Data = {
        Token: "Bearer " + this._identityService.token
      }; 

      // subscriber.next();
      // subscriber.complete();

      this.auth(authRequest).subscribe((res) => {
        if (res.IsSuccess) {
          this._authSucceeded = true;
          subscriber.next();
          subscriber.complete();
        } else {
          this._authSucceeded = false;
          this.close();
          subscriber.error(res.ErrorMessage);
          subscriber.complete();
        }
      }, (error1) => {
        this._authSucceeded = false;
        this.close();
        subscriber.error(error1);
        subscriber.complete();
      });

    }, (error) => {
      subscriber.error(error);
      subscriber.complete();
    });
  }

  protected _reconnect() {
    if (!this._authSucceeded) {
      return;
    }

    if (!this._brokerConnected) {
      return;
    }
    super._reconnect();
  }

  protected auth(data: MTAuthRequest): Observable<MTResponseMessageBase> {
    return new Observable<MTResponseMessageBase>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public login(data: MTLoginRequest): Observable<MTLoginResponse> {
    return new Observable<MTLoginResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public logout(data: MTLogoutRequest): Observable<MTResponseMessageBase> {
    return new Observable<MTResponseMessageBase>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public getOrderHistory(data: MTGetOrderHistoryRequest): Observable<MTGetOrderHistoryResponse> {
    return new Observable<MTGetOrderHistoryResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public placeOrder(data: MTPlaceOrderRequest): Observable<MTPlaceOrderResponse> {
    return new Observable<MTPlaceOrderResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public editOrder(data: MTEditOrderRequest): Observable<MTEditOrderResponse> {
    return new Observable<MTEditOrderResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public closeOrder(data: MTCloseOrderRequest): Observable<MTCloseOrderResponse> {
    return new Observable<MTCloseOrderResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public getPrice(symbol: string): Observable<MTQuoteResponse> {
    return new Observable<MTQuoteResponse>(subscriber => {
      const message = new GetQuote();
      message.Data = {
        Symbol: symbol
      };
      this._send(message, subscriber);
    });
  }

  public getSymbolTradeInfo(symbol: string): Observable<MTSymbolTradeInfoResponse> {
    return new Observable<MTSymbolTradeInfoResponse>(subscriber => {
      const message = new GetSymbolTradeInfo();
      message.Data = symbol;
      this._send(message, subscriber);
    });
  }

  public subscribeOnQuotes(symbol: string): Observable<MTResponseMessageBase> {
    return new Observable<MTResponseMessageBase>(subscriber => {
      const message = new SubscribeQuote();
      message.Data = {
        Subscribe: true,
        Symbol: symbol
      };
      this._send(message, subscriber);
    });
  }

  public unsubscribeFromQuotes(symbol: string): Observable<MTResponseMessageBase> {
    return new Observable<MTResponseMessageBase>(subscriber => {
      const message = new SubscribeQuote();
      message.Data = {
        Subscribe: false,
        Symbol: symbol
      };
      this._send(message, subscriber);
    });
  }

  private _processNewQuote(msgData: MTResponseMessageBase) {
    const quoteMessage = msgData as MTQuoteResponse;
    this._tickSubject.next({
      ask: quoteMessage.Data.Ask,
      bid: quoteMessage.Data.Bid,
      last: quoteMessage.Data.Last,
      volume: quoteMessage.Data.Volume,
      symbol: quoteMessage.Data.Symbol
    });
  }

  private _send(data: MTRequestMessageBase, subscriber: Subscriber<MTResponseMessageBase>) {
    try {
      this._subscribers[data.MessageId] = subscriber;
      const sent = this.send(data);
      if (!sent) {
        subscriber.error("Failed to send message");
        subscriber.complete();
      }
    } catch (error) {
      subscriber.error(error.message);
      subscriber.complete();
    }
  }

  private _processAccountUpdate(msgData: MTResponseMessageBase) {
    const quoteMessage = msgData as MTAccountUpdateResponse;
    this._accountUpdatedSubject.next(quoteMessage.Data);
  }

  private _processOrdersUpdate(msgData: MTResponseMessageBase) {
    const quoteMessage = msgData as MTOrdersUpdateResponse;
    this._ordersUpdatedSubject.next(quoteMessage.Data);
  }
}


