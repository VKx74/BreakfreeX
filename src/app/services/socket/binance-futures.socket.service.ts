import { Observable, Subscription, Subject } from 'rxjs';
import { ITradeTick } from '@app/models/common/tick';
import { IdentityService } from '../auth/identity.service';
import { BrokerResponseMessageBase } from "modules/Trading/models/communication";
import { BrokerSocketService } from "./broker.socket.service";
import { BinanceFutureAccountInfoResponse, BinanceFutureAccountUpdateResponse, BinanceFutureBookPriceRequest, BinanceFutureBookPriceResponse, BinanceFutureCloseOrderRequest, BinanceFutureCloseOrderResponse, BinanceFutureLoginRequest, BinanceFutureLoginResponse, BinanceFutureMarketTradeResponse, BinanceFutureMarketTradesRequest, BinanceFutureUsdtMessageType, BinanceFutureOpenOrderRequest, BinanceFutureOpenOrderResponse, BinanceFutureOrderBookItemResponse, BinanceFutureOrderHistoryResponse, BinanceFutureOrderInfoRequest, BinanceFutureOrderInfoResponse, BinanceFutureOrderUpdateResponse, BinanceFuturePlaceOrderRequest, BinanceFuturePlaceOrderResponse, BinanceFutureSubscribeOrderBookRequest, BinanceFutureSubscribeOrderBookResponse, BinanceFutureSubscribeQuoteRequest, BinanceFutureSubscribeQuoteResponse, BinanceFutureTickResponse, BinanceFutureTradeHistoryRequest, BinanceFutureTradeHistoryResponse, BinanceOrderHistoryRequest as BinanceFutureOrderHistoryRequest, IBinanceFutureAccountInfoData, IBinanceFuturesAccountUpdateData, IBinanceFuturesOrderUpdateData, BinanceFutureBrokerType, BinanceFuturePositionDetailsResponse, IBinanceFuturePosition, BinanceFutureSubscribeMarketPriceRequest, BinanceFutureSubscribeMarketPriceResponse, BinanceFutureMarketPriceResponse, IBinanceLastPrice } from "modules/Trading/models/crypto/binance-futures/binance-futures.communication";

export abstract class BinanceFuturesSocketService extends BrokerSocketService {
  private _onMessageSubscription: Subscription;
  private _tickSubject: Subject<ITradeTick> = new Subject<ITradeTick>();
  private _lastPriceSubject: Subject<IBinanceLastPrice> = new Subject<IBinanceLastPrice>();
  private _orderUpdateSubject: Subject<IBinanceFuturesOrderUpdateData> = new Subject<IBinanceFuturesOrderUpdateData>();
  private _positionsUpdateSubject: Subject<IBinanceFuturePosition[]> = new Subject<IBinanceFuturePosition[]>();
  private _accountUpdateSubject: Subject<IBinanceFuturesAccountUpdateData> = new Subject<IBinanceFuturesAccountUpdateData>();
  private _accountUpdatedSubject: Subject<IBinanceFutureAccountInfoData> = new Subject<IBinanceFutureAccountInfoData>();

  abstract get type(): BinanceFutureBrokerType;

  get usePingPongs(): boolean {
    return true;
  }

  get orderUpdateSubject(): Subject<IBinanceFuturesOrderUpdateData> {
    return this._orderUpdateSubject;
  }

  get positionsUpdateSubject(): Subject<IBinanceFuturePosition[]> {
    return this._positionsUpdateSubject;
  }

  get accountUpdateSubject(): Subject<IBinanceFuturesAccountUpdateData> {
    return this._accountUpdateSubject;
  }

  get tickSubject(): Subject<ITradeTick> {
    return this._tickSubject;
  }

  get lastPriceSubject(): Subject<IBinanceLastPrice> {
    return this._lastPriceSubject;
  }

  get accountUpdatedSubject(): Subject<IBinanceFutureAccountInfoData> {
    return this._accountUpdatedSubject;
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
        
        // if (msgTypeString === "quote") {
        //   this._processLastPrice(msgData);
        //   return;
        // }  
        
        if (msgTypeString === "markprice") {
          this._processMarketPrice(msgData);
          return;
        }  
        
        if (msgTypeString === "positiondetails") {
          this._processPositionsDetailsUpdated(msgData);
          return;
        }

        if (msgTypeString === "futuresorderupdate") {
          this._processOrderUpdated(msgData);
          return;
        }

        if (msgTypeString === "accountupdate") {
          this._processAccountUpdated(msgData);
          return;
        }

        if (msgTypeString === "accountinfo") {
          this._processAccountUpdate(msgData);
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

  public login(data: BinanceFutureLoginRequest): Observable<BinanceFutureLoginResponse> {
    return new Observable<BinanceFutureLoginResponse>(subscriber => {
      this._send(data, subscriber);
    });
  }

  public getOrdersHistory(symbol: string, from: number, to: number): Observable<BinanceFutureOrderHistoryResponse> {
    return new Observable<BinanceFutureOrderHistoryResponse>(subscriber => {
      const message = new BinanceFutureOrderHistoryRequest(this.type);
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
      const message = new BinanceFutureTradeHistoryRequest(this.type);
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
      const message = new BinanceFutureMarketTradesRequest(this.type);
      message.Data = {
        Symbol: symbol
      };
      this._send(message, subscriber);
    });
  }

  public getBookPrice(symbol: string): Observable<BinanceFutureBookPriceResponse> {
    return new Observable<BinanceFutureBookPriceResponse>(subscriber => {
      const message = new BinanceFutureBookPriceRequest(this.type);
      message.Data = {
        Symbol: symbol
      };
      this._send(message, subscriber);
    });
  }

  // public subscribeOnQuotes(symbol: string): Observable<BinanceFutureSubscribeQuoteResponse> {
  //   return new Observable<BinanceFutureSubscribeQuoteResponse>(subscriber => {
  //     const message = new BinanceFutureSubscribeQuoteRequest(this.type);
  //     message.Data = {
  //       Symbol: symbol,
  //       Subscribe: true
  //     };
  //     this._send(message, subscriber);
  //   });
  // }

  // public unsubscribeFromQuotes(symbol: string): Observable<BinanceFutureSubscribeQuoteResponse> {
  //   return new Observable<BinanceFutureSubscribeQuoteResponse>(subscriber => {
  //     const message = new BinanceFutureSubscribeQuoteRequest(this.type);
  //     message.Data = {
  //       Symbol: symbol,
  //       Subscribe: false
  //     };
  //     this._send(message, subscriber);
  //   });
  // }

  public subscribeOnMarketPrice(symbol: string): Observable<BinanceFutureSubscribeMarketPriceResponse> {
    return new Observable<BinanceFutureSubscribeMarketPriceResponse>(subscriber => {
      const message = new BinanceFutureSubscribeMarketPriceRequest(this.type);
      message.Data = {
        Symbol: symbol,
        Subscribe: true
      };
      this._send(message, subscriber);
    });
  }

  public unsubscribeFromMarketPrice(symbol: string): Observable<BinanceFutureSubscribeMarketPriceResponse> {
    return new Observable<BinanceFutureSubscribeMarketPriceResponse>(subscriber => {
      const message = new BinanceFutureSubscribeMarketPriceRequest(this.type);
      message.Data = {
        Symbol: symbol,
        Subscribe: false
      };
      this._send(message, subscriber);
    });
  }

  public subscribeOnOrderBook(symbol: string): Observable<BinanceFutureSubscribeOrderBookResponse> {
    return new Observable<BinanceFutureSubscribeOrderBookResponse>(subscriber => {
      const message = new BinanceFutureSubscribeOrderBookRequest(this.type);
      message.Data = {
        Symbol: symbol,
        Subscribe: true
      };
      this._send(message, subscriber);
    });
  }

  public unsubscribeOrderBook(symbol: string): Observable<BinanceFutureSubscribeOrderBookResponse> {
    return new Observable<BinanceFutureSubscribeOrderBookResponse>(subscriber => {
      const message = new BinanceFutureSubscribeOrderBookRequest(this.type);
      message.Data = {
        Symbol: symbol,
        Subscribe: false
      };
      this._send(message, subscriber);
    });
  }

  public getOpenOrders(): Observable<BinanceFutureOpenOrderResponse> {
    return new Observable<BinanceFutureOpenOrderResponse>(subscriber => {
      const message = new BinanceFutureOpenOrderRequest(this.type);
      this._send(message, subscriber);
    });
  }

  public closeOrder(symbol: string, orderId: any): Observable<BinanceFutureCloseOrderResponse> {
    return new Observable<BinanceFutureCloseOrderResponse>(subscriber => {
      const message = new BinanceFutureCloseOrderRequest(this.type);
      message.Data = {
        Symbol: symbol,
        OrderId: orderId
      };
      this._send(message, subscriber);
    });
  }

  public orderInfo(symbol: string, orderId: string): Observable<BinanceFutureOrderInfoResponse> {
    return new Observable<BinanceFutureOrderInfoResponse>(subscriber => {
      const message = new BinanceFutureOrderInfoRequest(this.type);
      message.Data = {
        Symbol: symbol,
        OrderId: orderId
      };
      this._send(message, subscriber);
    });
  }

  public placeOrder(orderData: any): Observable<BinanceFuturePlaceOrderResponse> {
    return new Observable<BinanceFuturePlaceOrderResponse>(subscriber => {
      const message = new BinanceFuturePlaceOrderRequest(this.type);
      message.Data = orderData;
      this._send(message, subscriber);
    });
  }

  private _processAccountUpdate(msgData: BrokerResponseMessageBase) {
    const quoteMessage = msgData as BinanceFutureAccountInfoResponse;
    this._accountUpdatedSubject.next(quoteMessage.Data);
  }

  private _processNewQuote(msgData: BrokerResponseMessageBase) {
    const quoteMessage = msgData as BinanceFutureOrderBookItemResponse;
    this._tickSubject.next({
      ask: quoteMessage.Data.BestAskPrice,
      bid: quoteMessage.Data.BestBidPrice,
      last: (quoteMessage.Data.BestAskPrice + quoteMessage.Data.BestBidPrice) / 2,
      volume: quoteMessage.Data.BestAskQuantity + quoteMessage.Data.BestBidQuantity,
      symbol: quoteMessage.Data.Symbol
    });
  }

  // private _processLastPrice(msgData: BrokerResponseMessageBase) {
  //   const quoteMessage = msgData as BinanceFutureTickResponse;
  //   this._lastPriceSubject.next({
  //     ask: quoteMessage.Data.AskPrice,
  //     bid: quoteMessage.Data.BidPrice,
  //     last: quoteMessage.Data.LastPrice,
  //     volume: quoteMessage.Data.LastQuantity,
  //     symbol: quoteMessage.Data.Symbol
  //   });
  // }

  private _processMarketPrice(msgData: BrokerResponseMessageBase) {
    const quoteMessage = msgData as BinanceFutureMarketPriceResponse;
    const lastPrice = quoteMessage.Data;
    this._lastPriceSubject.next({
      Price: lastPrice.MarkPrice,
      Symbol: lastPrice.Symbol
    });
  }

  private _processOrderUpdated(msgData: BrokerResponseMessageBase) {
    const updateMessage = msgData as BinanceFutureOrderUpdateResponse;
    this._orderUpdateSubject.next(updateMessage.Data.UpdateData);
  }

  private _processPositionsDetailsUpdated(msgData: BrokerResponseMessageBase) {
    const updateMessage = msgData as BinanceFuturePositionDetailsResponse;
    this._positionsUpdateSubject.next(updateMessage.Data);
  }

  private _processAccountUpdated(msgData: BrokerResponseMessageBase) {
    const updateMessage = msgData as BinanceFutureAccountUpdateResponse;
    this._accountUpdateSubject.next(updateMessage.Data.UpdateData);
  }
}


