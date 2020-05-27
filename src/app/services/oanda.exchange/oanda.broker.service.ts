import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {Observable, of, Subject, throwError, Subscription} from "rxjs";
import {catchError, map, debounceTime} from 'rxjs/operators';
import {AppConfigService} from "../app.config.service";
import {UssSocketService} from "../socket/uss.socket.service";
import {WebsocketBase} from "../../interfaces/socket/socketBase";
import {EBrokerInstance, IBroker, IBrokerState} from "@app/interfaces/broker/broker";
import {ActionResult, OrderTypes, OrderSide, ICancelOrderAction} from "../../../modules/Trading/models/models";
import {EExchange} from "@app/models/common/exchange";
import {IInstrument} from "@app/models/common/instrument";
import {EMarketType} from "@app/models/common/marketType";
import { OandaInstrumentService } from './oanda.instrument.service';
import { EOrderStatus } from 'modules/Trading/models/crypto/crypto.models';
import { OandaTradingAccount, OandaOrder, OandaPosition, ICloseOandaPositionAction } from 'modules/Trading/models/forex/oanda/oanda.models';
import { IForexCancelOrderAction, IForexPlaceOrderAction } from 'modules/Trading/models/forex/forex.models';
import { UssWsRequestDto, UssWsResponseDto } from '@app/models/uss.ws/uss.ws.dto';
import { IWSRequestMessageBody } from '@app/models/coinbase.exchange/models';
import {RealtimeService} from "@app/services/realtime.service";
import {OandaRealtimeService} from "@app/services/oanda.exchange/oanda.realtime.service";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';

export interface OandaBrokerState {
    ApiToken: string;
    AccountKey: string;
}

export interface IOandaLoginAction {
    ApiToken: string;
}

@Injectable()
export class OandaBrokerService implements IBroker {

    private _apiToken: string;
    private _accountKey: string;
    private _serviceEndpoint: string;
    private _realtimeAction: string;
    private _timeout: any;
    private _counter = 0;
    private _subscriptionMsg: UssWsRequestDto;
    private _socketSubscription: Subscription;
    private _debounceSubject: Subject<void> = new Subject<void>();
    
    tradingAccounts: string[] = [];

    onBrokerAccountChange = new Subject<void>();
    onAccountInfoUpdated = new Subject<void>();
    onPositionUpdated: Subject<void> = new Subject();
    onOrderUpdated: Subject<void> = new Subject();
    onSaveStateRequired: Subject<void> = new Subject<void>();

    accessToken: string;
    brokerKey: string;
    userInfo: OandaTradingAccount;
    instanceType = EBrokerInstance.OandaBroker;
    supportedMarkets: EMarketType[] = [EMarketType.Forex];

    get ExchangeInstance(): EExchangeInstance {
        return EExchangeInstance.OandaExchange;
    }


    public get supportedOrderTypes(): OrderTypes[] {
        return [OrderTypes.Market, OrderTypes.Limit, OrderTypes.Stop];
    }

    public get activeAccount(): string {
        return this._apiToken;
    
    }
    public get activeSubAccount(): string {
        return this.userInfo.Id;
    }

     constructor(@Inject(UssSocketService) protected _socket: WebsocketBase,
                protected _instrumentService: OandaInstrumentService,
                protected _http: HttpClient) {
        this._serviceEndpoint = AppConfigService.config.apiUrls.oandabrokerREST;
        this._realtimeAction = 'oanda/subscribe/realtime';

        this._debounceSubject.pipe(debounceTime(1000)).subscribe(() => {
            this.onBrokerAccountChange.next();
            this.onPositionUpdated.next();
            this.onOrderUpdated.next();
        });
    }

    init(initData: IOandaLoginAction): Observable<ActionResult> {
        return new Observable<ActionResult>(subscriber => {
            if (!initData.ApiToken) {
                subscriber.next({result: false, msg: 'Login data missed'});
                subscriber.complete();
                return;
            }

            this._loginWithAPIKey(initData.ApiToken).subscribe(res => {
                if (res.result) {
                    return this._loadUserInfo().subscribe(value => {
                        subscriber.next(value);
                        subscriber.complete();

                        this._raiseAllDataChangedEvents();
                        this._initSocket();
                    });
                } else {
                    subscriber.next(res);
                    subscriber.complete();
                }
            });
        });
    }

    getOrders(symbol?: string): Observable<OandaOrder[]> {
        return this._getOrders((order: OandaOrder) => {
            return order.status === EOrderStatus.Open;
        }, symbol);
    }

    getHistoryOrders(symbol?: string): Observable<OandaOrder[]> {
        return this._getOrders((order: OandaOrder) => {
            return order.status !== EOrderStatus.Open;
        }, symbol);
    }

    getPositions(symbol?: string): Observable<OandaPosition[]> {
        if (!this.accessToken) {
            return throwError(new Error('Broker not authorized'));
        }

        const headers = new HttpHeaders({
            'brokerKey': this.brokerKey
        });

        return this._http.get(`${this._serviceEndpoint}trading/positions`, {headers: headers})
            .pipe(
                map((positions: any[]) => {
                    return this._convertDataToPosition(positions, (pos: OandaPosition) => {
                        return pos.units !== 0;
                    });
                })
            );
    }

    closePosition(closePositionAction: ICloseOandaPositionAction): Observable<ActionResult> {
        const params = {
            symbol: closePositionAction.Symbol,
            'brokerKey': this.brokerKey,
        };

        return this._http.post(`${this._serviceEndpoint}trading/closeposition`, params)
            .pipe(
                map((response: any) => {
                    if (response.errorCode) {
                        return {
                            result: false,
                            msg: response.description
                        };
                    }

                    this._raiseAllDataChangedEvents();
                    
                    return {
                        result: true
                    };
                })
            );
    }

    cancelOrder(order: IForexCancelOrderAction): Observable<ActionResult> {
        const params = {
            orderId: order.Id,
            'brokerKey': this.brokerKey,
        };

        return this._http.post(`${this._serviceEndpoint}trading/cancelorder`, params)
            .pipe(
                map((response: any) => {
                    if (response.errorCode) {
                        return {
                            result: false,
                            msg: response.description
                        };
                    }

                    this._raiseAllDataChangedEvents();

                    return {
                        result: true
                    };
                })
            );
    }

    placeOrder(order: IForexPlaceOrderAction): Observable<ActionResult> {
        const paramsOrder = Object.assign(order, {"brokerKey": this.brokerKey});

        return this._http.post(`${this._serviceEndpoint}trading/placeorder`, paramsOrder).pipe(map((response: any) => {
            if (response.errorCode) {
                return {
                    result: false,
                    msg: response.description
                };
            }

            this._raiseAllDataChangedEvents();

            return {
                result: true
            };
        }));
    }

    selectTradingAccount(account: string): Observable<ActionResult> {
        return new Observable<ActionResult>(subscriber => {
            const params = {
                'AccountId': account,
                'brokerKey': this.brokerKey,
            };

            this._http.post<ActionResult>(`${this._serviceEndpoint}user/switchAccount`, params).subscribe((responseData: any) => {
                if (responseData && responseData.AccessToken && responseData.CurrenctAccountId) {
                    this.accessToken = responseData.AccessToken;
                    this._accountKey = responseData.CurrenctAccountId;
                    this._loadUserInfo().subscribe(value => {
                        subscriber.next(value);
                        subscriber.complete();
                        this._raiseAllDataChangedEvents();
                    });
                } else {
                    subscriber.next({
                        result: false,
                        msg: "Fail to change account"
                    });
                }
            }, error => {
                subscriber.next({
                    result: false,
                    msg: "Fail to change account"
                });
            });
        });
    }

    dispose(): Observable<ActionResult> {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        this._disposeSocket();
        return this._logout();
    }

    getInstruments(search?: string): Observable<IInstrument[]> {
        return this._instrumentService.getInstruments(EExchange.Oanda, search).pipe(map((values: IInstrument[]) => {
            return values.filter(instrument => instrument.tradable);
        }));
    }

    loadSate(brokerState: IBrokerState<OandaBrokerState>): Observable<ActionResult> {
        return this.init(brokerState.state);
    }

    saveState(): Observable<IBrokerState<OandaBrokerState>> {
        return of({brokerType: EBrokerInstance.OandaBroker, state: {
            ApiToken: this._apiToken,
            AccountKey: this._accountKey
        }});
    }

    isInstrumentAvailable(instrument: IInstrument, orderType: OrderTypes): boolean {
        const isMarketTypeAvailable = this.supportedMarkets.find((i) => i === instrument.type) || null;
        const isOrderTypeAvailable = this.supportedOrderTypes.find((type) => {
            return (type === orderType || type === OrderTypes[orderType]);
        }) || null;
        return !!(isMarketTypeAvailable && isOrderTypeAvailable && instrument.exchange === EExchange.Oanda);
    }

    protected _raiseAllDataChangedEvents() {
        this._debounceSubject.next();
    }

    protected _loadUserInfo(): Observable<ActionResult> {
        if (!this.accessToken) {
            return of({
                result: false
            });
        }
        const data = {
            accessToken : this.brokerKey
        };
        return this._http.get<ActionResult>(`${this._serviceEndpoint}user/userinfo`, {
            headers: data
        }).pipe(catchError(error => {
            return of(error);
        }), map((responseData) => {
            if (responseData && responseData.AccountId) {
               
                this.userInfo = {
                    Id: responseData.AccountId,
                    Balance: responseData.Balance,
                    Currency: responseData.Currency,
                    MarginAvailable: responseData.MarginAvailable,
                    MarginRate: responseData.MarginRate,
                    MarginUsed: responseData.MarginUsed,
                    Pl: responseData.Pl,
                    UnrealizedPL: responseData.UnrealizedPL,
                    username: "Oanda broker"
                };

                this.onAccountInfoUpdated.next();

                this._timeout = setTimeout(() => {
                    this._loadUserInfo().subscribe();
                }, 5 * 1000);

                return {
                    result: true
                };
            } else {
                return {
                    result: false,
                    msg: responseData.message || "Fail to load user info"
                };
            }
        }));
    }

    protected _loginWithAPIKey(token: string) {
        const data = {
            accessToken : token
        };
        return this._http.post<ActionResult>(`${this._serviceEndpoint}auth/login`, data).pipe(catchError(error => {
            return of(error);
        }), map((responseData) => {
            if (responseData && responseData.BrokerKey && responseData.CurrenctAccountId) {
                this.accessToken = token;
                this._apiToken = token;
                this.brokerKey = responseData.BrokerKey;
                this._accountKey = responseData.CurrenctAccountId;
                
                if (responseData.AccountIds) {
                    for (let i = 0; i < responseData.AccountIds.length; i++) {
                        const account = responseData.AccountIds[i];
                        this.tradingAccounts.push(account);
                    }
                }

                return {
                    result: true
                };
            } else {
                return {
                    result: false,
                    msg: responseData.message || "Fail to validate credentials"
                };
            }
        }));
    }

    protected _logout(): Observable<ActionResult> {
        const data = {
                "brokerKey": this.brokerKey
        };

        return this._http.post<ActionResult>(`${this._serviceEndpoint}auth/logout`, data).pipe(catchError(error => {
            return of(error);
        }), map((response) => {
                this._apiToken = '';
                this._accountKey = '';
                this.accessToken = '';
                this.userInfo = null;
                this.onSaveStateRequired.next();
                return {
                    result: true
                };
        }));
    }

    protected _getOrders(filer: (order: OandaOrder) => boolean, symbol?: string): Observable<OandaOrder[]> {
        if (!this.accessToken) {
            return throwError(new Error('Broker not authorized'));
        }

        let params = new HttpParams({
            fromObject: {
                accesstoken: this.brokerKey
            }
        });

        if (symbol) {
            params = params.append('symbol', symbol);
        }

        return this._http.get(`${this._serviceEndpoint}trading/orders`, {params: params})
            .pipe(
                map((orders: any[]) => {
                    if (orders && orders.length) {
                        return this._convertDataToOrder(orders, filer);
                    } else {
                        return [];
                    }
                })
            );
    }

    protected _convertDataToOrder(data: any, filer: (order: OandaOrder) => boolean): OandaOrder[] {
        const res: OandaOrder[] = [];

        for (let i = 0; i < data.length; i++) {
            const order = data[i];
            const oandaOrder = {
                id: order.Id,
                filledTradeId: order.FilledTradeId,
                price: order.AveragePrice || order.Price,
                side: this._getOrderSide(order.Side),
                size: order.Size,
                symbol: order.Symbol,
                time: order.Time,
                type: this._getOrderType(order.OrderType),
                status: order.OrderStatus,
            } as OandaOrder;

            if (!filer(oandaOrder)) {
                continue;
            }

            res.push(oandaOrder);    
        }

        return res;
    }

    protected _convertDataToPosition(data: any, filer: (order: OandaPosition) => boolean): OandaPosition[] {
        const res: OandaPosition[] = [];

        for (let i = 0; i < data.length; i++) {
            const position = data[i];
            const oandaPosition = {
                avgPrice: position.AvgPrice,
                closePrice: position.ClosePrice,
                ordersIds: position.OrdersIds,
                pl: position.Pl,
                side: this._getOrderSide(position.Side),
                symbol: position.Symbol,
                units: position.Units,
                upl: position.Upl,
                totalClosedUnits: position.TotalClosedUnits
            } as OandaPosition;

            if (!filer(oandaPosition)) {
                continue;
            }

            res.push(oandaPosition);    
        }

        return res;
    }

    private _getOrderType(type: string): OrderTypes {
        switch (type) {
            case "Limit": return OrderTypes.Limit;
            case "Stop": return OrderTypes.Stop;
            default: return OrderTypes.Market;
        }
    }

    private _getOrderSide(side: string): OrderSide {
        switch (side) {
            case "Buy": return OrderSide.Buy;
            default: return OrderSide.Sell;
        }
    }

    protected _initSocket() {
        const action = this._realtimeAction;
        this._socket.open().subscribe(value => {
            this._subscriptionMsg = this._createSubscriptionMessage('private', action);
            this._socket.send(JSON.stringify(this._subscriptionMsg));
        }, error => {

        });

        this._socketSubscription = this._socket.onMessage.subscribe(value => {
            const msg = value as UssWsResponseDto;

            if (msg.Action !== action) {
                return;
            }

            const msgData = JSON.parse(msg.Body);

            if (msgData.MsgType !== 'PrivateDataUpdateMessage') {
                return;
            }

            this._processMessage(msgData);
        });
    }

    protected _disposeSocket() {
        if (this._socketSubscription) {
            this._socketSubscription.unsubscribe();
            this._socketSubscription = null;
        }

        if (this._subscriptionMsg) {
            this._subscriptionMsg.Subscribe = false;
            this._socket.send(JSON.stringify(this._subscriptionMsg));
            this._subscriptionMsg = null;
        }
    }

    protected _createSubscriptionMessage(channel: string, action: string): UssWsRequestDto {
        const id = this._counter + Date.now().toString();
        this._counter++;

        const subscribtionBody: IWSRequestMessageBody = {
            MsgType: 'SubscriptionMessage',
            Channel: channel,
            Id: id
        };

        const subscribeMsg: UssWsRequestDto = {
            Subscribe: true,
            Body: {
                data: subscribtionBody,
            },
            Headers: {
                accessToken: this.accessToken
            },
            Action: action,
            Id: id
        };

        return subscribeMsg;
    }

    protected _processMessage(msgData: any) {
       this._raiseAllDataChangedEvents();
    }
}

