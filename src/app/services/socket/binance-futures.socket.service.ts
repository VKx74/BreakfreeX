import { IWebSocketConfig } from "../../interfaces/socket/WebSocketConfig";
import { AppConfigService } from '../app.config.service';
import { Observable, Subscription, Subject } from 'rxjs';
import { ITradeTick } from '@app/models/common/tick';
import { IdentityService } from '../auth/identity.service';
import { BrokerResponseMessageBase } from "modules/Trading/models/communication";
import { BrokerSocketService } from "./broker.socket.service";
import { BinanceFutureAccountUpdateResponse, BinanceFutureCloseOrderRequest, BinanceFutureCloseOrderResponse, BinanceFutureLoginRequest, BinanceFutureLoginResponse, BinanceFutureMarketTradeResponse, BinanceFutureMarketTradesRequest, BinanceFutureMessageType, BinanceFutureOpenOrderRequest, BinanceFutureOpenOrderResponse, BinanceFutureOrderHistoryResponse, BinanceFutureOrderInfoRequest, BinanceFutureOrderInfoResponse, BinanceFuturePlaceOrderRequest, BinanceFuturePlaceOrderResponse, BinanceFutureTradeHistoryRequest, BinanceFutureTradeHistoryResponse, BinanceOrderHistoryRequest as BinanceFutureOrderHistoryRequest, IBinanceFutureAccountUpdatedData } from "modules/Trading/models/crypto/binance-futures/binance-futures.communication";

export abstract class BinanceFuturesSocketService extends BrokerSocketService {
  private _onMessageSubscription: Subscription;
  private _tickSubject: Subject<ITradeTick> = new Subject<ITradeTick>();
  private _accountUpdatedSubject: Subject<IBinanceFutureAccountUpdatedData> = new Subject<IBinanceFutureAccountUpdatedData>();

  get usePingPongs(): boolean {
    return true;
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

  public getOrdersHistory(symbol: string, from: number, to: number): Observable<BinanceFutureOrderHistoryResponse> {
    return new Observable<BinanceFutureOrderHistoryResponse>(subscriber => {
      const message = new BinanceFutureOrderHistoryRequest();
      message.Data = {
        Symbol: symbol,
        From: from,
        To: to
      };
      this._send(message, subscriber);
    });
  }

  public getTradesHistory(symbol: string, from: number, to: number): Observable<BinanceFutureTradeHistoryResponse> {
    return new Observable<BinanceFutureTradeHistoryResponse>(subscriber => {
      const message = new BinanceFutureTradeHistoryRequest();
      message.Data = {
        Symbol: symbol,
        From: from,
        To: to
      };
      this._send(message, subscriber);
    });
  }

  public getMarketTrades(symbol: string): Observable<BinanceFutureMarketTradeResponse> {
    return new Observable<BinanceFutureMarketTradeResponse>(subscriber => {
      const message = new BinanceFutureMarketTradesRequest();
      message.Data = {
        Symbol: symbol
      };
      this._send(message, subscriber);
    });
  }

  public getOpenOrders(): Observable<BinanceFutureOpenOrderResponse> {
    return new Observable<BinanceFutureOpenOrderResponse>(subscriber => {
      const message = new BinanceFutureOpenOrderRequest();
      this._send(message, subscriber);
    });
  }

  public closeOrder(symbol: string, orderId: any): Observable<BinanceFutureCloseOrderResponse> {
    return new Observable<BinanceFutureCloseOrderResponse>(subscriber => {
      const message = new BinanceFutureCloseOrderRequest();
      message.Data = {
        Symbol: symbol,
        OrderId: orderId
      };
      this._send(message, subscriber);
    });
  }

  public orderInfo(symbol: string, orderId: string): Observable<BinanceFutureOrderInfoResponse> {
    return new Observable<BinanceFutureOrderInfoResponse>(subscriber => {
      const message = new BinanceFutureOrderInfoRequest();
      message.Data = {
        Symbol: symbol,
        OrderId: orderId
      };
      this._send(message, subscriber);
    });
  }

  public placeOrder(orderData: any): Observable<BinanceFuturePlaceOrderResponse> {
    return new Observable<BinanceFuturePlaceOrderResponse>(subscriber => {
      const message = new BinanceFuturePlaceOrderRequest();
      message.Data = orderData;
      this._send(message, subscriber);
    });
  }

  private _processAccountUpdate(msgData: BrokerResponseMessageBase) {
    const quoteMessage = msgData as BinanceFutureAccountUpdateResponse;
    this._accountUpdatedSubject.next(quoteMessage.Data);
  }
}


