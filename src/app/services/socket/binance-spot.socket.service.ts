import { Observable, Subscription, Subject } from 'rxjs';
import { ITradeTick } from '@app/models/common/tick';
import { IdentityService } from '../auth/identity.service';
import { BrokerResponseMessageBase } from "modules/Trading/models/communication";
import { BrokerSocketService } from "./broker.socket.service";
import { BinanceEnvironment, IBinancePrice } from 'modules/Trading/models/crypto/shared/models.communication';
import { BinanceSpotAccountInfoResponse, BinanceSpotAccountUpdateResponse, BinanceSpotBookPriceRequest, BinanceSpotBookPriceResponse, BinanceSpotCloseOrderRequest, BinanceSpotLoginRequest, BinanceSpotLoginResponse, BinanceSpotMarketPriceResponse, BinanceSpotMarketTradeResponse, BinanceSpotMarketTradesRequest, BinanceSpotOpenOrderResponse, BinanceSpotOpenOrdersRequest, BinanceSpotOrderBookItemResponse, BinanceSpotOrderHistoryRequest, BinanceSpotOrderHistoryResponse, BinanceSpotOrderInfoRequest, BinanceSpotOrderUpdateResponse, BinanceSpotPlaceOrderRequest, BinanceSpotSubscribeMarketPriceRequest, BinanceSpotSubscribeOrderBookRequest, BinanceSpotSubscribeOrderBookResponse, BinanceSpotTradeHistoryRequest, BinanceSpotTradeHistoryResponse, IBinanceSpotAccountInfoData, IBinanceSpotAccountBalance, IBinanceSpotOrderUpdateData, BinanceSpotPlaceOCOOrderRequest } from 'modules/Trading/models/crypto/binance/binance.models.communication';
import { IWebSocketConfig } from '@app/interfaces/socket/WebSocketConfig';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../app.config.service';

@Injectable()
export class BinanceSpotSocketService extends BrokerSocketService {
  protected _environment: BinanceEnvironment = BinanceEnvironment.Testnet;
   
  get config(): IWebSocketConfig {
    return {
      url: this._environment === BinanceEnvironment.Real ? AppConfigService.config.apiUrls.BinanceBrokerWS : AppConfigService.config.apiUrls.BinanceTestnetBrokerWS
    };
  }

  private _onMessageSubscription: Subscription;
  private _tickSubject: Subject<ITradeTick> = new Subject<ITradeTick>();
  private _lastPriceSubject: Subject<IBinancePrice> = new Subject<IBinancePrice>();
  private _orderUpdateSubject: Subject<IBinanceSpotOrderUpdateData> = new Subject<IBinanceSpotOrderUpdateData>();
  private _accountUpdateSubject: Subject<IBinanceSpotAccountBalance[]> = new Subject<IBinanceSpotAccountBalance[]>();
  private _accountInfoReceivedSubject: Subject<IBinanceSpotAccountInfoData> = new Subject<IBinanceSpotAccountInfoData>();

  get usePingPongs(): boolean {
    return true;
  }

  get orderUpdateSubject(): Subject<IBinanceSpotOrderUpdateData> {
    return this._orderUpdateSubject;
  }

  get accountUpdateSubject(): Subject<IBinanceSpotAccountBalance[]> {
    return this._accountUpdateSubject;
  }

  get tickSubject(): Subject<ITradeTick> {
    return this._tickSubject;
  }

  get lastPriceSubject(): Subject<IBinancePrice> {
    return this._lastPriceSubject;
  }

  get accountInfoReceivedSubject(): Subject<IBinanceSpotAccountInfoData> {
    return this._accountInfoReceivedSubject;
  }

  constructor(protected _identityService: IdentityService) {
    super(_identityService);
    this._token = "Bearer " + this._identityService.token;
    this._onMessageSubscription = this.onMessage.subscribe(value => {
      try {
        const msgData = value as BrokerResponseMessageBase;
        const msgTypeString = msgData && msgData.Type ? msgData.Type.toLowerCase() : "";

        if (msgTypeString === "tick") {
          this._processNewQuote(msgData);
          return;
        }    
        
        if (msgTypeString === "markprice") {
          this._processMarketPrice(msgData);
          return;
        }  

        if (msgTypeString === "spotorderupdate") {
          this._processOrderUpdated(msgData);
          return;
        }

        if (msgTypeString === "spotaccountposition") {
          this._processAccountUpdated(msgData);
          return;
        }

        if (msgTypeString === "accountinfo") {
          this._processAccountInfoReceived(msgData);
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
    // this.send(new MTLogoutRequest());
    this.close();
  }

  public setEnvironment(environment: BinanceEnvironment) {
    this._environment = environment;
  }

  public login(data: BinanceSpotLoginRequest): Observable<BinanceSpotLoginResponse> {
    console.log(this._environment);
    return new Observable<BinanceSpotLoginResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public getOrdersHistory(symbol: string, from: number, to: number): Observable<BinanceSpotOrderHistoryResponse> {
    return new Observable<BinanceSpotOrderHistoryResponse>(subscriber => {
      const message = new BinanceSpotOrderHistoryRequest();
      message.Data = {
        Symbol: symbol,
        From: from,
        To: to
      };
      this._send(message, subscriber);
    });
  }

  public getTradesHistory(symbol: string, from: number, to: number): Observable<BinanceSpotTradeHistoryResponse> {
    return new Observable<BinanceSpotTradeHistoryResponse>(subscriber => {
      const message = new BinanceSpotTradeHistoryRequest();
      message.Data = {
        Symbol: symbol,
        From: from,
        To: to
      };
      this._send(message, subscriber);
    });
  }

  public getMarketTrades(symbol: string): Observable<BinanceSpotMarketTradeResponse> {
    return new Observable<BinanceSpotMarketTradeResponse>(subscriber => {
      const message = new BinanceSpotMarketTradesRequest();
      message.Data = {
        Symbol: symbol
      };
      this._send(message, subscriber);
    });
  }

  public getBookPrice(symbol: string): Observable<BinanceSpotBookPriceResponse> {
    return new Observable<BinanceSpotBookPriceResponse>(subscriber => {
      const message = new BinanceSpotBookPriceRequest();
      message.Data = {
        Symbol: symbol
      };
      this._send(message, subscriber);
    });
  }
  public subscribeOnOrderBook(symbol: string): Observable<BinanceSpotSubscribeOrderBookResponse> {
    return new Observable<BinanceSpotSubscribeOrderBookResponse>(subscriber => {
      const message = new BinanceSpotSubscribeOrderBookRequest();
      message.Data = {
        Symbol: symbol,
        Subscribe: true
      };
      this._send(message, subscriber);
    });
  }

  public unsubscribeOrderBook(symbol: string): Observable<BinanceSpotSubscribeOrderBookResponse> {
    return new Observable<BinanceSpotSubscribeOrderBookResponse>(subscriber => {
      const message = new BinanceSpotSubscribeOrderBookRequest();
      message.Data = {
        Symbol: symbol,
        Subscribe: false
      };
      this._send(message, subscriber);
    });
  }

  public getOpenOrders(): Observable<BinanceSpotOpenOrderResponse> {
    return new Observable<BinanceSpotOpenOrderResponse>(subscriber => {
      const message = new BinanceSpotOpenOrdersRequest();
      this._send(message, subscriber);
    });
  }

  public closeOrder(symbol: string, orderId: any): Observable<BrokerResponseMessageBase> {
    return new Observable<BrokerResponseMessageBase>(subscriber => {
      const message = new BinanceSpotCloseOrderRequest();
      message.Data = {
        Symbol: symbol,
        OrderId: orderId
      };
      this._send(message, subscriber);
    });
  }

  public orderInfo(symbol: string, orderId: string): Observable<BrokerResponseMessageBase> {
    return new Observable<BrokerResponseMessageBase>(subscriber => {
      const message = new BinanceSpotOrderInfoRequest();
      message.Data = {
        Symbol: symbol,
        OrderId: orderId
      };
      this._send(message, subscriber);
    });
  }

  public placeOrder(orderData: any): Observable<BrokerResponseMessageBase> {
    return new Observable<BrokerResponseMessageBase>(subscriber => {
      const message = new BinanceSpotPlaceOrderRequest();
      message.Data = orderData;
      this._send(message, subscriber);
    });
  }

  public placeOCOOrder(orderData: any): Observable<BrokerResponseMessageBase> {
    return new Observable<BrokerResponseMessageBase>(subscriber => {
      const message = new BinanceSpotPlaceOCOOrderRequest();
      message.Data = orderData;
      this._send(message, subscriber);
    });
  }

  private _processAccountInfoReceived(msgData: BrokerResponseMessageBase) {
    const quoteMessage = msgData as BinanceSpotAccountInfoResponse;
    this._accountInfoReceivedSubject.next(quoteMessage.Data);
  }

  private _processNewQuote(msgData: BrokerResponseMessageBase) {
    const quoteMessage = msgData as BinanceSpotOrderBookItemResponse;
    this._tickSubject.next({
      ask: quoteMessage.Data.BestAskPrice,
      bid: quoteMessage.Data.BestBidPrice,
      last: (quoteMessage.Data.BestAskPrice + quoteMessage.Data.BestBidPrice) / 2,
      volume: quoteMessage.Data.BestAskQuantity + quoteMessage.Data.BestBidQuantity,
      symbol: quoteMessage.Data.Symbol
    });
  }

  private _processMarketPrice(msgData: BrokerResponseMessageBase) {
    const quoteMessage = msgData as BinanceSpotMarketPriceResponse;
    const lastPrice = quoteMessage.Data;
    this._lastPriceSubject.next({
      Price: lastPrice.MarkPrice,
      Symbol: lastPrice.Symbol
    });
  }

  private _processOrderUpdated(msgData: BrokerResponseMessageBase) {
    const updateMessage = msgData as BinanceSpotOrderUpdateResponse;
    this._orderUpdateSubject.next(updateMessage.Data);
  }

  private _processAccountUpdated(msgData: BrokerResponseMessageBase) {
    const updateMessage = msgData as BinanceSpotAccountUpdateResponse;
    this._accountUpdateSubject.next(updateMessage.Data.Balances);
  }
}


