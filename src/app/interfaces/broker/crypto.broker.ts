import {EBrokerInstance, IBroker, IBrokerState} from "./broker";
import {ActionResult, OrderTypes} from "../../../modules/Trading/models/models";
import {
    EActionDataType, EActionType,
    ECryptoOperation, EOrderStatus, ICryptoActionUpdate,
    ICryptoCancelOrderAction, ICryptoCancelWithdrawAction,
    ICryptoOrder,
    ICryptoPlaceOrderAction,
    ICryptoTrade,
    ICryptoUserInfo,
    ICryptoWithdrawAction, ICryptoLoadOrdersAction,
    IWallet, IWalletTransaction, ICryptoLoadTradesAction
} from "../../../modules/Trading/models/crypto/crypto.models";
import {BehaviorSubject, Observable, of, Subject, Subscription, throwError} from "rxjs";
import {EExchange} from "@app/models/common/exchange";
import {EMarketType} from "@app/models/common/marketType";
import {IInstrument} from "@app/models/common/instrument";
import {UssWsRequestDto, UssWsResponseDto} from "@app/models/uss.ws/uss.ws.dto";
import {IWSRequestMessageBody} from "@app/models/coinbase.exchange/models";
import {WebsocketBase} from "@app/interfaces/socket/socketBase";
import {catchError, map, tap, debounceTime} from "rxjs/operators";
import {InstrumentServiceBase} from "@app/interfaces/exchange/instrument.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {IdentityService} from "@app/services/auth/identity.service";
import {OnInit} from "@angular/core";
import {BrokerStorage} from "@app/services/broker.storage";
import {RealtimeService} from "@app/services/realtime.service";
import {IBrokerServiceState} from "@app/services/broker.service";
import { EExchangeInstance } from '../exchange/exchange';

export const SATOSHI = 100000000;

export interface IFeeInfo {
    fee: number;
    minFee: number;
    maxFee: number;
}

export abstract class CryptoBroker implements IBroker {
    protected _counter = 0;
    protected _serviceEndpoint = "";
    protected _realtimeAction = "";
    protected _accessToken = "";
    protected _refreshToken = "";
    protected _isWalletsInfoUpdating = false;
    protected _isWalletTransactionsUpdating = false;
    protected _tokenExpiration = 3 * 60 * 1000; // 10 mins
    protected _timeIntervalMark: any;
    protected _socketSubscription: Subscription;
    protected _subscriptionMsg: UssWsRequestDto;
    protected _userInfo: ICryptoUserInfo;
    protected _fees: { [symbol: string]: IFeeInfo } = {};
    protected _cachedWallets: IWallet[];
    protected _debounceSubject: Subject<void> = new Subject<void>();
    protected _activeWallet$ = new BehaviorSubject<IWallet>(null);
    public activeWallet$ = this._activeWallet$.asObservable();

    abstract get instanceType(): EBrokerInstance;

    abstract get supportedMarkets(): EMarketType[];

    abstract get supportedExchanges(): EExchange[];

    abstract get supportedOrderTypes(): OrderTypes[];

    abstract get operationRequires2FA(): ECryptoOperation[];

    abstract get ExchangeInstance(): EExchangeInstance;

    get accessToken(): string {
        return this._accessToken;
    }

    get withdrawFeeRequired(): boolean {
        return true;
    }

    get userInfo(): ICryptoUserInfo {
        return this._userInfo;
    }

    get activeWallet() {
        if (this._activeWallet$.value) {
            return this._activeWallet$.value;
        }
    }

    onSaveStateRequired: Subject<void> = new Subject<void>();
    onWalletsInfoUpdated: Subject<void> = new Subject<void>();
    onOrdersInfoUpdated: Subject<void> = new Subject<void>();
    onTradesInfoUpdated: Subject<void> = new Subject<void>();

    constructor(protected _socket: WebsocketBase,
                protected _realtimeService: RealtimeService,
                protected _instrumentService: InstrumentServiceBase,
                protected _http: HttpClient,
                protected _brokerStorage: BrokerStorage,
                protected _identity: IdentityService
                ) {

        this._debounceSubject.pipe(debounceTime(1000)).subscribe(() => {
            this._cachedWallets = null;
            this.onOrdersInfoUpdated.next();
            this.onTradesInfoUpdated.next();
            this.onWalletsInfoUpdated.next();
        });
        this._accessToken = this._identity.token;
    }

    // Orders region

    cancelOrder(data: ICryptoCancelOrderAction): Observable<ActionResult> {
        return this._http.post(`${this._serviceEndpoint}trading/cancelorder`, data)
            .pipe(
                catchError(error => {
                    return of({
                        errorCode: error.status,
                        description: error.error
                    });
                }), map((response: any) => {
                    if (response && response.errorCode) {
                        return {
                            result: false,
                            msg: response.description
                        };
                    }

                    this._raiseDataChanged();

                    return {
                        result: true
                    };
                })
            );
    }

    placeOrder(data: ICryptoPlaceOrderAction): Observable<ActionResult> {
        return this._http.post(`${this._serviceEndpoint}trading/placeorder`, data).pipe(
            catchError(error => {
                return of({
                    errorCode: error.status,
                    description: error.error
                });
            }), map((response: any) => {
                if (response && response.errorCode) {
                    return {
                        result: false,
                        msg: response.description,
                    };
                }

                this._raiseDataChanged();

                return {
                    result: true,
                    data: response,
                } as ActionResult;
            }));
    }

    getOrders(data: ICryptoLoadOrdersAction = {}): Observable<ICryptoOrder[]> {
        if (!this._accessToken) {
            return throwError(new Error('Broker not authorized'));
        }

        let params = new HttpParams({
            fromObject: {
                accesstoken: this._accessToken
            }
        });

        if (data.symbol) {
            params = params.append('symbol', data.symbol);
        }

        return this._http.get(`${this._serviceEndpoint}trading/orders`, {params: params})
            .pipe(
                map((orders: any[]) => {
                    if (orders && orders.length) {
                        return orders.map((order: any) => this._convertDataToOrder(order));
                    } else {
                        return [];
                    }
                })
            );
    }
    // End Orders region

    // Trades region

    getTrades(data: ICryptoLoadTradesAction = {}): Observable<ICryptoTrade[]> {
        if (!this._accessToken) {
            return throwError('Broker not authorized');
        }

        let params = new HttpParams({
            fromObject: {
                accesstoken: this._accessToken
            }
        });

        if (data.symbol) {
            params = params.append('symbol', data.symbol);
        }

        return this._http.get(`${this._serviceEndpoint}trading/executions`, {params: params})
            .pipe(
                map((trades: any[]) => {
                    if (trades && trades.length) {
                        return trades.map((trade: any) => this._convertDataToTrade(trade));
                    }

                    return [];
                })
            );
    }

    // End Trades region

    // Wallet Transactions region

    getTransaction(): Observable<IWalletTransaction[]> {
        if (!this._accessToken) {
            return throwError('Broker not authorized');
        }

        const params = new HttpParams()
            .append('accesstoken', this._accessToken);

        this._http.get(`${this._serviceEndpoint}user/walletshistory`, {params: params})
            .pipe(
                map((transactions: any[]) => {
                    if (transactions && transactions.length) {
                        return transactions.map((transaction: any) => this._convertDataToTransaction(transaction));
                    }

                    return [];
                })
            );
    }

    setActiveWallet(wallet: IWallet) {
        if (wallet) {
            this._activeWallet$.next(wallet);
        }
    }

    getWalletTransaction(currency: string): Observable<IWalletTransaction[]> {
        if (!this._accessToken) {
            return throwError('Broker not authorized');
        }

        const params = new HttpParams()
            .append('accesstoken', this._accessToken)
            .append('currency', currency);

        return this._http.get(`${this._serviceEndpoint}user/walletshistory`, {params: params})
            .pipe(
                map((transactions: any[]) => {
                    if (transactions && transactions.length) {
                        return transactions.map((transaction: any) => this._convertDataToTransaction(transaction)).filter((transaction) => {
                            return transaction.currency.toUpperCase() === currency.toUpperCase();
                        });
                    }

                    return [];
                })
            );
    }

    getWallets(useCache: boolean = false): Observable<IWallet[]> {
        if (!this._accessToken) {
            return;
        }

        if (useCache && this._cachedWallets) {
            return of(this._cachedWallets);
        }

        const params = new HttpParams()
            .append('accesstoken', this._accessToken);

        return this._http.get(`${this._serviceEndpoint}user/userinfo`, {params: params}).pipe(catchError(error => {
            return of(null);
        }), map((value: any) => {
            if (value) {
                if (value.errorCode) {
                    return [];
                }

                const wallets: IWallet[] = [];

                if (value.Wallets && value.Wallets.length) {
                    for (let i in value.Wallets) {
                        const wallet = value.Wallets[i];
                        wallets.push({
                            address: wallet.Address,
                            locked: Number(wallet.Locked),
                            currency: wallet.Currency.toUpperCase(),
                            balance: Number(wallet.Balance)
                        });
                    }
                }

                if (wallets.length && !this.activeWallet) {
                    this._activeWallet$.next(wallets[0]);
                } else {
                    this._activeWallet$.next(wallets.find(wallet => wallet.address === this.activeWallet.address));
                }

                this._cachedWallets = wallets;
                return wallets;
            }

            return [];
        }));
    }

    // End Wallet Transactions region

    // Withdraw region

    withdraw(data: ICryptoWithdrawAction): Observable<ActionResult> {
        const headers = new HttpHeaders({
            'accesstoken': this._accessToken
        });

        return this._http.post(`${this._serviceEndpoint}user/requestwithdrawal`, data, {headers: headers})
            .pipe(
                catchError(error => {
                    return of({
                        errorCode: error.status,
                        description: error.error
                    });
                }), map((response: any) => {
                    if (response && response.errorCode) {
                        return {
                            result: false,
                            msg: response.description
                        };
                    }

                    this._cachedWallets = null;
                    this.onWalletsInfoUpdated.next();

                    return {
                        result: true
                    };
                })
            );
    }

    cancelWithdraw(data: ICryptoCancelWithdrawAction): Observable<ActionResult> {
        const headers = new HttpHeaders({
            'accesstoken': this._accessToken
        });

        return this._http.post(`${this._serviceEndpoint}user/cancelwithdrawal`, data, {headers: headers}).pipe(
            catchError(error => {
                return of({
                    errorCode: error.status,
                    description: error.error
                });
            }), map((response: any) => {
                if (response && response.errorCode) {
                    return {
                        result: false,
                        msg: response.description
                    };
                }

                this._cachedWallets = null;
                this.onWalletsInfoUpdated.next();

                return {
                    result: true
                };
            }));
    }

    getDefaultWithdrawalFee(symbol: string): Observable<IFeeInfo> {
        return of({
            fee: 0,
            minFee: 0,
            maxFee: 10000000
        });
    }

    // End Withdraw region

    dispose(): Observable<ActionResult> {
        this._userInfo = null;
        this._fees = {};
        this._disposeSocket();

        return of({
            result: true
        });
    }

    abstract init(initData: any): Observable<ActionResult>;

    abstract loadSate(state: IBrokerState): Observable<ActionResult>;

    abstract saveState(): Observable<IBrokerState>;

    getInstruments(exchange?: EExchange, search?: string): Observable<IInstrument[]> {
        return this._instrumentService.getInstruments(exchange, search).pipe(map((values: IInstrument[]) => {
            return values.filter(instrument => instrument.tradable);
        }));
    }

    isInstrumentAvailable(instrument: IInstrument, orderType: OrderTypes): boolean {
        const isMarketTypeAvailable = this.supportedMarkets.find((i) => i === instrument.type) || null;
        const isExchangeSupported = this.supportedExchanges.find((i) => i === instrument.exchange) || null;
        const isOrderTypeAvailable = this.supportedOrderTypes.find((type) => {
            return (type === orderType || type === OrderTypes[orderType]);
        }) || null;
        return !!(isMarketTypeAvailable && isOrderTypeAvailable && isExchangeSupported);
    }

    protected _logout(): Observable<ActionResult> {
        return this._http.post<ActionResult>(`${this._serviceEndpoint}Auth/Logout`, {}).pipe(catchError(error => {
            let msg = error && error.error ? error.error : "Fail to logout";
            return of(msg);
        }), map((error) => {
            if (!error) {
                return {
                    result: true
                };
            } else {
                return {
                    result: false,
                    msg: error
                };
            }
        }));
    }

    protected _loginWithAPIKey(initData: object) {
        return this._http.post<ActionResult>(`${this._serviceEndpoint}Auth/Login`, initData).pipe(catchError(error => {
            let msg = error && error.error ? error.error : "Fail to validate credentials";
            return of(msg);
        }), map((error) => {
            if (!error) {
                return {
                    result: true
                };
            } else {
                return {
                    result: false,
                    msg: error
                };
            }
        }));
    }
    protected _loginWithRefreshToken(token: string, refreshToken: string): Observable<ActionResult> {
        const data = {
            AccessToken: token,
            RefreshToken: refreshToken
        };

        return this._http.post<ActionResult>(`${this._serviceEndpoint}auth/refresh`, data).pipe(catchError(error => {
            return of(error);
        }), map((response) => {
            const responseData = response.Data;


            let brokerState: IBrokerServiceState = this._brokerStorage.getBrokerState();


            if (responseData) {
                const newBrokerState: IBrokerServiceState = {
                    activeBrokerState: {
                        brokerType: brokerState.activeBrokerState.brokerType,
                        state: {
                            apiKey: brokerState.activeBrokerState.state.apiKey,
                            refreshToken: responseData.RefreshToken,
                            secretKey: brokerState.activeBrokerState.state.secretKey,
                            token: responseData.AccessToken,
                        }
                    }
                };

                this._brokerStorage.saveBrokerState(newBrokerState);
            }

            if (responseData && responseData.AccessToken && responseData.RefreshToken) {
                this._setTokens(responseData.AccessToken, responseData.RefreshToken, Number(responseData.ExpiresIn));
                return {
                    result: true
                };
            } else {
                return {
                    result: false,
                    msg: response.message || "Fail to validate refresh token"
                };
            }
        }));
    }

    // expiresIn in miliseconds
    protected _setTokens(accessToken: string, refreshToken: string, expiresIn?: number) {
        this._accessToken = accessToken;
        this._refreshToken = refreshToken;
        if (expiresIn) {
            this._tokenExpiration = expiresIn * 1000;
        }

        this._initRefreshTokenTimer();
        this.onSaveStateRequired.next();
    }

    protected _initRefreshTokenTimer() {
        if (this._timeIntervalMark) {
            clearInterval(this._timeIntervalMark);
        }

        this._timeIntervalMark = setInterval(() => this._refreshTokenTimerCallback(), this._tokenExpiration);
    }

    protected _refreshTokenTimerCallback() {
        if (!this._refreshToken || !this._accessToken) {
            return;
        }

        this._loginWithRefreshToken(this._accessToken, this._refreshToken).subscribe(value => {
            if (!value.result) {
                this.dispose().subscribe(disposeValue => {
                });
                console.log('Failed to refresh OKEx token');
            }
        }, error => {
            this.dispose().subscribe(disposeValue => {
            });
        });
    }

    protected _getOrderStatus(statuses: string): EOrderStatus {
        switch (statuses) {
            case 'Filled':
                return EOrderStatus.Filled;
            case 'Open':
                return EOrderStatus.Open;
            case 'Canceled':
                return EOrderStatus.Canceled;
        }
    }

    protected _loadUserInfo(): Observable<ActionResult> {
        return this._http.get(`${this._serviceEndpoint}user/userinfo`).pipe(catchError(error => {
            return of(null);
        }), map((value: any) => {
            if (value) {
                if (value.errorCode) {
                    return {
                        result: false,
                        msg: value.description
                    };
                }

                this._userInfo = {
                    username: value.Email || 'default@gmail.com',
                };

                return {
                    result: true
                };
            }

            return {
                result: false,
                msg: 'Failed to load user info'
            };
        }));
    }

    protected _convertDataToTransaction(item: any): IWalletTransaction {
        return {
            id: item.Id,
            currency: item.Currency.toUpperCase(),
            amount: item.Amount,
            fee: item.Fee ? item.Fee : 0,
            transactID: item.TxId,
            created_at: item.CreatedAt ? new Date(item.CreatedAt * 1000).getTime() : null,
            completed_at: item.CompletedAt ? new Date(item.CompletedAt * 1000).getTime() : null,
            state: item.State,
            transactType: item.Type,
            address: item.Address

        };
    }

    protected _convertDataToOrder(item: any): ICryptoOrder {
        return {
            id: item.Id,
            symbol: item.Symbol.toUpperCase(),
            size: Number(item.Size),
            remainedSize: item.RemainingSize ? Number(item.RemainingSize) : 0,
            price: Number(item.Price),
            stopPrice: item.StopPrice ? item.StopPrice : 0,
            avgPrice: item.AveragePrice ? item.AveragePrice : 0,
            side: item.Side,
            type: item.OrderType,
            status: this._getOrderStatus(item.OrderStatus),
            time: new Date(item.Time * 1000).getTime()
        };
    }

    protected _convertDataToTrade(item: any): ICryptoTrade {
        return {
            id: item.Id,
            orderID: item.OrderId ? item.OrderId : '',
            symbol: item.Symbol.toUpperCase(),
            size: Number(item.Size),
            filledSize: item.FilledSize ? Number(item.FilledSize) : Number(item.Size),
            remainedSize: item.RemainingSize ? Number(item.RemainingSize) : 0,
            price: item.Price,
            avgPrice: item.AveragePrice ? item.AveragePrice : 0,
            side: item.Side,
            type: item.OrderType ? item.OrderType : '',
            time: item.Time ? new Date(item.Time * 1000).getTime() : new Date().getTime()
        };
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


            if (action && msg.Action !== action) {
                return;
            }

            if (!msg || !msg.Body) {
                return;
            }

            try {
                const msgData: ICryptoActionUpdate = JSON.parse(msg.Body);

                if (msgData.MsgType !== 'PrivateDataUpdateMessage') {
                    return;
                }

                this._processMessage(msgData);
            } catch (e) {
                console.log(e);
            }
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
                accessToken: this._accessToken
            },
            Action: action ? action : undefined,
            Id: id
        };

        return subscribeMsg;
    }

    protected _processMessage(msgData: ICryptoActionUpdate) {
        if (!msgData.Data.length) {
            return;
        }

        if (msgData.DataType === EActionDataType.Order ||
            msgData.DataType === EActionDataType.Execution ||
            msgData.DataType === EActionDataType.Wallet ||
            msgData.DataType === EActionDataType.Transact) {
            this._raiseDataChanged();
        }
    }

    protected _raiseDataChanged() {
        this._debounceSubject.next();
    }
}
