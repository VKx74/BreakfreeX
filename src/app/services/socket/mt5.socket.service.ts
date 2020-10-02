import { WebsocketBase } from "../../interfaces/socket/socketBase";
import { IWebSocketConfig, ReadyStateConstants } from "../../interfaces/socket/WebSocketConfig";
import { AppConfigService } from '../app.config.service';
import { Injectable } from "@angular/core";
import { Observable, Subscriber, Subscription, Subject } from 'rxjs';
import { MT5ResponseMessageBase, MT5LoginRequest, EMT5MessageType, SubscribeQuote, MT5QuoteResponse, MT5PlaceOrderRequest, MT5PlaceOrderResponse, MT5LoginResponse, MT5EditOrderRequest, MT5EditOrderResponse, MT5CloseOrderRequest, MT5CloseOrderResponse, MT5LogoutRequest, MT5RequestMessageBase, MT5GetOrderHistoryRequest, MT5AccountUpdateResponse, IMT5AccountUpdatedData, IMT5OrderData, MT5OrdersUpdateResponse, MT5GetOrderHistoryResponse, MT5AuthRequest, GetQuote } from 'modules/Trading/models/forex/mt/mt.communication';
import { IMT5Tick } from '@app/models/common/tick';
import { IdentityService } from '../auth/identity.service';

@Injectable()
export class MT5SocketService extends WebsocketBase {
  private _subscribers: { [id: string]: Subscriber<MT5ResponseMessageBase>; } = {};
  private _authSucceeded: boolean;
  private _token: string;
  private _onMessageSubscription: Subscription;
  private _tickSubject: Subject<IMT5Tick> = new Subject<IMT5Tick>();
  private _accountUpdatedSubject: Subject<IMT5AccountUpdatedData> = new Subject<IMT5AccountUpdatedData>();
  private _ordersUpdatedSubject: Subject<IMT5OrderData[]> = new Subject<IMT5OrderData[]>();

  get usePingPongs(): boolean {
    return false;
  }

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

  constructor(private _identityService: IdentityService) {
    super();
    this._token = "Bearer " + this._identityService.token;
    this._onMessageSubscription = this.onMessage.subscribe(value => {
      try {
        const msgData = value as MT5ResponseMessageBase;
        const msgTypeString = msgData && msgData.Type ? msgData.Type.toLowerCase() : "";

        if (msgTypeString === EMT5MessageType.Quote.toLowerCase()) {
          this._processNewQuote(msgData);
          return;
        }

        if (msgTypeString === EMT5MessageType.AccountUpdate.toLowerCase()) {
          this._processAccountUpdate(msgData);
          return;
        }

        if (msgTypeString === EMT5MessageType.OrdersUpdate.toLowerCase()) {
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
    this.send(new MT5LogoutRequest());
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
      const authRequest = new MT5AuthRequest();
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
    super._reconnect();
  }

  protected auth(data: MT5AuthRequest): Observable<MT5ResponseMessageBase> {
    return new Observable<MT5ResponseMessageBase>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public login(data: MT5LoginRequest): Observable<MT5LoginResponse> {
    return new Observable<MT5LoginResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public logout(data: MT5LogoutRequest): Observable<MT5ResponseMessageBase> {
    return new Observable<MT5ResponseMessageBase>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public getOrderHistory(data: MT5GetOrderHistoryRequest): Observable<MT5GetOrderHistoryResponse> {
    return new Observable<MT5GetOrderHistoryResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public placeOrder(data: MT5PlaceOrderRequest): Observable<MT5PlaceOrderResponse> {
    return new Observable<MT5PlaceOrderResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public editOrder(data: MT5EditOrderRequest): Observable<MT5EditOrderResponse> {
    return new Observable<MT5EditOrderResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public closeOrder(data: MT5CloseOrderRequest): Observable<MT5CloseOrderResponse> {
    return new Observable<MT5CloseOrderResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public getPrice(symbol: string): Observable<MT5QuoteResponse> {
    return new Observable<MT5QuoteResponse>(subscriber => {
      const message = new GetQuote();
      message.Data = {
        Symbol: symbol
      };
      this._send(message, subscriber);
    });
  }

  public subscribeOnQuotes(symbol: string): Observable<MT5ResponseMessageBase> {
    return new Observable<MT5ResponseMessageBase>(subscriber => {
      const message = new SubscribeQuote();
      message.Data = {
        Subscribe: true,
        Symbol: symbol
      };
      this._send(message, subscriber);
    });
  }

  public unsubscribeFromQuotes(symbol: string): Observable<MT5ResponseMessageBase> {
    return new Observable<MT5ResponseMessageBase>(subscriber => {
      const message = new SubscribeQuote();
      message.Data = {
        Subscribe: false,
        Symbol: symbol
      };
      this._send(message, subscriber);
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

  private _send(data: MT5RequestMessageBase, subscriber: Subscriber<MT5ResponseMessageBase>) {
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

  private _processAccountUpdate(msgData: MT5ResponseMessageBase) {
    const quoteMessage = msgData as MT5AccountUpdateResponse;
    this._accountUpdatedSubject.next(quoteMessage.Data);
  }

  private _processOrdersUpdate(msgData: MT5ResponseMessageBase) {
    const quoteMessage = msgData as MT5OrdersUpdateResponse;
    this._ordersUpdatedSubject.next(quoteMessage.Data);
  }
}


