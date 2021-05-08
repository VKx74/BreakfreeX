import { IWebSocketConfig } from "../../interfaces/socket/WebSocketConfig";
import { AppConfigService } from '../app.config.service';
import { Observable, Subscription, Subject } from 'rxjs';
import { MTLoginRequest, SubscribeQuote, MTQuoteResponse, MTPlaceOrderRequest, MTPlaceOrderResponse, MTLoginResponse, MTEditOrderRequest, MTEditOrderResponse, MTCloseOrderRequest, MTCloseOrderResponse, MTLogoutRequest, MTGetOrderHistoryRequest, MTAccountUpdateResponse, IMTAccountUpdatedData, IMTOrderData, MTOrdersUpdateResponse, MTGetOrderHistoryResponse, GetQuote, GetSymbolTradeInfo, MTSymbolTradeInfoResponse, MTMessageType } from 'modules/Trading/models/forex/mt/mt.communication';
import { ITradeTick } from '@app/models/common/tick';
import { IdentityService } from '../auth/identity.service';
import { BrokerResponseMessageBase } from "modules/Trading/models/communication";
import { BrokerSocketService } from "./broker.socket.service";

export abstract class MTSocketService extends BrokerSocketService {
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

  constructor(protected _identityService: IdentityService) {
    super(_identityService);
    this._token = "Bearer " + this._identityService.token;
    this._onMessageSubscription = this.onMessage.subscribe(value => {
      try {
        const msgData = value as BrokerResponseMessageBase;
        const msgTypeString = msgData && msgData.Type ? msgData.Type.toLowerCase() : "";

        if (msgTypeString === MTMessageType.Quote.toLowerCase()) {
          this._processNewQuote(msgData);
          return;
        }

        if (msgTypeString === MTMessageType.AccountUpdate.toLowerCase()) {
          this._processAccountUpdate(msgData);
          return;
        }

        if (msgTypeString === MTMessageType.OrdersUpdate.toLowerCase()) {
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
    this._brokerConnected = false;
    this.send(new MTLogoutRequest());
    this.close();
  }

  public login(data: MTLoginRequest): Observable<MTLoginResponse> {
    return new Observable<MTLoginResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public logout(data: MTLogoutRequest): Observable<BrokerResponseMessageBase> {
    return new Observable<BrokerResponseMessageBase>(subscriber => {
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

  public subscribeOnQuotes(symbol: string): Observable<BrokerResponseMessageBase> {
    return new Observable<BrokerResponseMessageBase>(subscriber => {
      const message = new SubscribeQuote();
      message.Data = {
        Subscribe: true,
        Symbol: symbol
      };
      this._send(message, subscriber);
    });
  }

  public unsubscribeFromQuotes(symbol: string): Observable<BrokerResponseMessageBase> {
    return new Observable<BrokerResponseMessageBase>(subscriber => {
      const message = new SubscribeQuote();
      message.Data = {
        Subscribe: false,
        Symbol: symbol
      };
      this._send(message, subscriber);
    });
  }

  private _processNewQuote(msgData: BrokerResponseMessageBase) {
    const quoteMessage = msgData as MTQuoteResponse;
    this._tickSubject.next({
      ask: quoteMessage.Data.Ask,
      bid: quoteMessage.Data.Bid,
      last: quoteMessage.Data.Last,
      volume: quoteMessage.Data.Volume,
      symbol: quoteMessage.Data.Symbol
    });
  }

  private _processAccountUpdate(msgData: BrokerResponseMessageBase) {
    const quoteMessage = msgData as MTAccountUpdateResponse;
    this._accountUpdatedSubject.next(quoteMessage.Data);
  }

  private _processOrdersUpdate(msgData: BrokerResponseMessageBase) {
    const quoteMessage = msgData as MTOrdersUpdateResponse;
    this._ordersUpdatedSubject.next(quoteMessage.Data);
  }
}


