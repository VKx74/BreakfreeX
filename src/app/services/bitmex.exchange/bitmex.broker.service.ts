import {Observable, of} from "rxjs";
import {map} from "rxjs/operators";
import {Inject, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {EExchange} from "../../models/common/exchange";
import {EMarketType} from "../../models/common/marketType";
import {CryptoBroker, IFeeInfo} from "../../interfaces/broker/crypto.broker";
import {EBrokerInstance, IBrokerState} from "../../interfaces/broker/broker";
import {
    ECryptoOperation, ICryptoActionUpdate,
} from "../../../modules/Trading/models/crypto/crypto.models";
import {ActionResult, OrderTypes} from "../../../modules/Trading/models/models";
import {UssSocketService} from "../socket/uss.socket.service";
import {WebsocketBase} from "../../interfaces/socket/socketBase";
import {BitmexInstrumentService} from "./bitmex.instrument.service";
import {IBitmexLoginAction} from "../../../modules/Trading/models/crypto/bitmex/bitmex.models";
import {AppConfigService} from "../app.config.service";
import {RealtimeService} from "@app/services/realtime.service";
import {IBrokerServiceState} from "@app/services/broker.service";
import {BrokerStorage} from "@app/services/broker.storage";
import {IdentityService} from "@app/services/auth/identity.service";

@Injectable()
export class BitmexBrokerService extends CryptoBroker {
    private _secretKey: string;
    private _apiKey: string;

    get instanceType(): EBrokerInstance {
        return EBrokerInstance.BitmexBroker;
    }

    get supportedMarkets(): EMarketType[] {
        return [EMarketType.Crypto];
    }
    get supportedExchanges(): EExchange[] {
        return [EExchange.Bitmex];
    }

    get supportedOrderTypes(): OrderTypes[] {
        return [OrderTypes.Market, OrderTypes.Limit, OrderTypes.Stop, OrderTypes.StopLimit];
    }

    get operationRequires2FA(): ECryptoOperation[] {
        return [ECryptoOperation.Withdraw];
    }

    constructor(@Inject(UssSocketService) protected _socket: WebsocketBase,
                protected _instrumentService: BitmexInstrumentService,
                protected _realtimeService: RealtimeService,
                protected _http: HttpClient,
                protected _brokerStorage: BrokerStorage,
                protected _identity: IdentityService
                ) {
        super(_socket, _realtimeService, _instrumentService, _http, _brokerStorage, _identity);
        this._serviceEndpoint = AppConfigService.config.apiUrls.bitmexREST;
        this._realtimeAction = 'bitmex/subscribe/realtime';
    }

    dispose(): Observable<ActionResult> {
        super.dispose();
        return this._logout();
    }

    init(initData: IBitmexLoginAction): Observable<ActionResult> {
        return new Observable<ActionResult>(subscriber => {
            if (!initData.secret || !initData.apiKey) {
                subscriber.next({result: false, msg: 'Login data missed'});
                subscriber.complete();
                return;
            }
            this._loginWithAPIKey(initData).subscribe(res => {
                if (res.result) {
                    this._apiKey = initData.apiKey;
                    this._secretKey = initData.secret;

                    return this._loadUserInfo().subscribe(value => {
                        if (value.result) {
                            this._init();
                        }
                        subscriber.next(value);
                        subscriber.complete();
                    });
                } else {
                    subscriber.next(res);
                    subscriber.complete();
                }
            });
        });
    }

    loadSate(state: IBrokerState): Observable<ActionResult> {
        const initData: IBitmexLoginAction = {
            apiKey: state.state.apiKey,
            secret: state.state.secretKey
        };

        return new Observable<ActionResult>(subscriber => {
            if (!state.state.secretKey || !state.state.apiKey) {
                subscriber.next({result: false, msg: 'Login data missed'});
                subscriber.complete();
                return;
            }

            this._loginWithAPIKey(initData).subscribe(res => {
                if (res.result) {
                    this._apiKey = initData.apiKey;
                    this._secretKey = initData.secret;

                    return this._loadUserInfo().subscribe(value => {
                        if (value.result) {
                            this._init();
                        }
                        subscriber.next(value);
                        subscriber.complete();
                    });
                } else {
                    subscriber.next(res);
                    subscriber.complete();
                }
            });
        });
    }

    saveState(): Observable<IBrokerState> {
        return of({
            brokerType: EBrokerInstance.BitmexBroker,
            state: {
                apiKey: this._apiKey,
                secretKey: this._secretKey,
                token: this._accessToken,
                refreshToken: this._refreshToken,
            }
        });
    }

    private _init() {
        this._initSocket();
    }

    protected _loginWithAPIKey(initData: IBitmexLoginAction) {
        return super._loginWithAPIKey(initData);
    }

    getDefaultWithdrawalFee(symbol: string): Observable<IFeeInfo> {
        if (!this._accessToken) {
            return null;
        }

        if (this._fees[symbol]) {
            return of(this._fees[symbol]);
        }

        const params = new HttpParams()
            .append('accesstoken', this._accessToken)
            .append('currency', symbol);

        return this._http.get(`${this._serviceEndpoint}user/withdrawalfeeinfo`, { params: params }).pipe(map((value: any) => {
            if (value && value.Currency) {
                const feeValue = Number(value.Fee);
                const minFeeValue = Number(value.MinFee);
                const maxFeeValue = Number(value.MaxFee);

                if (!Number.isNaN(feeValue) && !Number.isNaN(minFeeValue) && !Number.isNaN(maxFeeValue)) {
                    this._fees[symbol] = {
                        fee: feeValue,
                        minFee: minFeeValue,
                        maxFee: maxFeeValue
                    };
                    return this._fees[symbol];
                } else {
                    return null;
                }
            }
        }));
    }
}
