import { Injectable } from "@angular/core";
import { IInstrument } from "../models/common/instrument";
import { EExchange } from "../models/common/exchange";
import { IHealthable } from "../interfaces/healthcheck/healthable";
import { BehaviorSubject, Observable, of, Subject, Subscription } from "rxjs";
import { EBrokerInstance, IBroker, IBrokerState } from "../interfaces/broker/broker";
import { ActionResult, OrderTypes } from "../../modules/Trading/models/models";
import { catchError, map, switchMap } from "rxjs/operators";
import { BrokerFactory, CreateBrokerActionResult } from "../factories/broker.factory";
import { IdentityService } from './auth/identity.service';
import { InstrumentMappingService } from "./instrument-mapping.service";
import { HttpClient } from "@angular/common/http";
import { AppConfigService } from "./app.config.service";
import { MTConnectionData } from "modules/Trading/models/forex/mt/mt.models";

export interface IBrokerServiceState {
    activeBrokerState?: IBrokerState;
    previousConnected?: IBrokerState[];
}

export interface IBFTTradingAccount {
    id: string;
    isLive: boolean;
}

@Injectable()
export class BrokerService {
    private _activeState: IBrokerServiceState = {};
    private _brokerInitializationState$ = new BehaviorSubject<boolean>(null);
    public brokerInitializationState$ = this._brokerInitializationState$.asObservable();

    get isInitialized(): boolean {
        return this._brokerInitializationState$.value;
    }

    private _activeBroker: IBroker;
    get activeBroker(): IBroker {
        return this._activeBroker;
    }

    get isGuest(): boolean {
        return this._identityService.isGuestMode;
    }

    private _isConnected: boolean;
    get isConnected(): boolean {
        return this._isConnected;
    }

    private _defaultAccounts: IBFTTradingAccount[] = [];
    get defaultAccounts(): IBFTTradingAccount[] {
        return this._defaultAccounts;
    }

    public get isTradingAllowed(): boolean {
        // show MT Bridge for all users even without subscriptions
        return true;
        return this._identityService.isAuthorizedCustomer;
    }

    private _activeBroker$ = new BehaviorSubject<IBroker>(null);
    activeBroker$ = this._activeBroker$.asObservable();

    private _subscriptionOnBrokerStateChange: Subscription;
    onSaveStateRequired: Subject<void> = new Subject<void>();

    constructor(private _brokerFactory: BrokerFactory,
        private _identityService: IdentityService,
        private _http: HttpClient,
        private _instrumentMappingService: InstrumentMappingService) {
        this._isConnected = false;
    }

    disposeActiveBroker(): Observable<ActionResult> {
        if (this._activeBroker) {
            return this._activeBroker.dispose().pipe(map(value => {
                if (value.result) {
                    this._activeBroker = null;
                    this._isConnected = false;
                    this._activeBroker$.next(null);
                    this.onSaveStateRequired.next();

                    if (this._subscriptionOnBrokerStateChange) {
                        this._subscriptionOnBrokerStateChange.unsubscribe();
                        this._subscriptionOnBrokerStateChange = null;
                    }
                }
                return value;
            }));
        } else {
            return of({
                result: false,
                msg: 'You have no connected broker'
            });
        }
    }

    setActiveBroker(broker: IBroker): Observable<ActionResult> {
        if (!this.isTradingAllowed) {
            return of({
                result: false,
                msg: 'Trading not allowed'
            });
        }

        if (!this._activeBroker) {
            this._activeBroker = broker;
            this._isConnected = true;
            this._activeBroker$.next(broker);
            this.onSaveStateRequired.next();

            if (this._subscriptionOnBrokerStateChange) {
                this._subscriptionOnBrokerStateChange.unsubscribe();
            }

            this._subscriptionOnBrokerStateChange = this._activeBroker.onSaveStateRequired.subscribe(() => {
                this.onSaveStateRequired.next();
            });
            return of({
                result: true
            });
        } else {
            return of({
                result: false,
                msg: 'You already have connected broker'
            });
        }
    }

    removeSavedBroker(state: IBrokerState) {
        if (this._activeState.previousConnected) {
            const index = this._activeState.previousConnected.indexOf(state);
            if (index !== -1) {
                this._activeState.previousConnected.splice(index, 1);
                this.onSaveStateRequired.next();
            }
        }
    }

    getSavedBroker(brokerType?: EBrokerInstance): IBrokerState[] {
        const res = [];
        if (this._activeState.previousConnected) {
            for (const account of this._activeState.previousConnected) {
                if (!brokerType || account.brokerType === brokerType) {
                    res.push(account);
                }
            }
        }

        return res;
    }

    getActiveBroker(): IBrokerState {
        return this._activeState.activeBrokerState;
    }

    getInstruments(exchange?: EExchange, search?: string): Observable<IInstrument[]> {
        if (this._activeBroker) {
            return this._activeBroker.getInstruments(exchange, search);
        }

        return of([]);
    }

    saveState(): Observable<IBrokerServiceState> {
        if (!this._activeBroker) {
            this._activeState.activeBrokerState = null;
            this._instrumentMappingService.setActiveBroker(null);
            return of(this._activeState);
        }

        return this._activeBroker.saveState().pipe(map((value: IBrokerState) => {
            this._activeState.activeBrokerState = value;
            this._instrumentMappingService.setActiveBroker(value);
            this._setSavedAccounts();
            return {
                ...this._activeState
            };
        }));
    }

    loadState(state: IBrokerServiceState): Observable<ActionResult> {
        if (this._identityService.isGuestMode) {
            return of({
                result: false,
                msg: 'Guest mode'
            });
        }

        return this._loadState(state);
    }

    reconnect(): Observable<ActionResult> {
        return new Observable<ActionResult>(subscriber => {
            this.setBrokerInitializationState(null);
            this.saveState().subscribe((state) => {
                this.loadState(state).subscribe((loadStateResult) => {
                    subscriber.next(loadStateResult);
                    subscriber.complete();

                    if (loadStateResult.result) {
                        this.setBrokerInitializationState(true);
                    } else {
                        this.setBrokerInitializationState(false);
                    }
                }, (error) => {
                    this.setBrokerInitializationState(false);
                    subscriber.error(error);
                    subscriber.complete();
                });
            }, (error) => {
                this.setBrokerInitializationState(false);
                subscriber.error(error);
                subscriber.complete();
            });
        });
    }

    initialize(): Observable<any> {
        return this._loadDefaultTradingAccount().pipe(map((data) => {
            if (data) {
                this._defaultAccounts = data;
            }
        }));
    }

    connectDefaultDemoAccount(): Observable<ActionResult> {
        const demoAccount = this._defaultAccounts.find(_ => !_.isLive);
        if (!demoAccount) {
            return of({
                result: false,
                msg: "Demo account not exist"
            });
        }

        const initData: MTConnectionData = {
            Password: "",
            ServerName: EBrokerInstance.BFTDemo,
            Login: Number(demoAccount.id)
        };

        return this._connectDefaultAccount(EBrokerInstance.BFTDemo, initData);
    }

    connectDefaultLiveAccount(): Observable<ActionResult> {
        const liveAccount = this._defaultAccounts.find(_ => _.isLive);
        if (!liveAccount) {
            return of({
                result: false,
                msg: "Live account not exist"
            });
        }

        const initData: MTConnectionData = {
            Password: "",
            ServerName: EBrokerInstance.BFTLive,
            Login: Number(liveAccount.id)
        };

        return this._connectDefaultAccount(EBrokerInstance.BFTLive, initData);
    }

    public setBrokerInitializationState(state = true) {
        this._brokerInitializationState$.next(state);
    }

    private _connectDefaultAccount(broker: EBrokerInstance, initData: any): Observable<ActionResult> {
        return this._brokerFactory.tryCreateInstance(broker, initData).pipe(switchMap((value: CreateBrokerActionResult) => {
            const brokerInstance = value.brokerInstance;
            if (brokerInstance) {
                return this.setActiveBroker(brokerInstance).pipe(map((setBrokerResult) => {
                    if (!setBrokerResult.result) {
                        brokerInstance.dispose().subscribe(disposeResult => { });
                    }
                    return setBrokerResult;
                }));
            } 
            return of({
                result: false,
                msg: "Failed to connect default broker account"
            });
        }), catchError((error) => {
            console.log(error);
            return of({
                result: false,
                msg: "Failed to connect default broker account"
            });
        }));
    }

    private _loadDefaultTradingAccount(): Observable<IBFTTradingAccount[]> {
        return this._http.get<IBFTTradingAccount[]>(`${AppConfigService.config.apiUrls.identityUrl}TradingAccount`, {
            withCredentials: true
        });
    }

    private _setSavedAccounts() {
        if (!this._activeState.previousConnected) {
            this._activeState.previousConnected = [];
        }

        const currentState = this._activeState.activeBrokerState;

        if (!currentState) {
            return;
        }

        let acctExist = false;
        for (const acct of this._activeState.previousConnected) {
            try {
                let acc1 = JSON.stringify(acct);
                let acc2 = JSON.stringify(currentState);
                if (acc1 === acc2) {
                    acctExist = true;
                    break;
                }
            } catch (ex) {
                acctExist = true;
                break;
            }
        }

        if (!acctExist) {
            this._activeState.previousConnected.push(currentState);
        }
    }

    private _loadState(state: IBrokerServiceState): Observable<ActionResult> {
        if (!state) {
            return of({
                result: false,
                msg: 'Broker state is empty'
            });
        }

        this._activeState.previousConnected = state.previousConnected || [];
        this._activeState.activeBrokerState = state.activeBrokerState;
        this._instrumentMappingService.setActiveBroker(state.activeBrokerState);

        if (!state.activeBrokerState) {
            return of({
                result: true
            });
        }

        if (this._activeBroker) {
            return new Observable<ActionResult>(subscriber => {
                this.disposeActiveBroker().subscribe(value => {
                    if (value.result) {
                        this._restoreBrokerFromState(state.activeBrokerState).subscribe(restoreRes => {
                            subscriber.next(restoreRes);
                            subscriber.complete();
                        });
                    } else {
                        subscriber.next(value);
                        subscriber.complete();
                    }
                });
            });
        } else {
            return this._restoreBrokerFromState(state.activeBrokerState);
        }
    }

    private _restoreBrokerFromState(activeBrokerState: IBrokerState): Observable<ActionResult> {
        if (!this.isTradingAllowed) {
            return of({
                result: false,
                msg: 'Trading not allowed'
            });
        }
        return new Observable<ActionResult>(subscriber => {
            this._brokerFactory.tryRestoreInstance(activeBrokerState.brokerType, activeBrokerState)
                .subscribe((value: CreateBrokerActionResult) => {
                    if (value.result) {
                        const brokerInstance = value.brokerInstance;
                        if (brokerInstance) {
                            this.setActiveBroker(brokerInstance).subscribe(setBrokerResult => {
                                if (!setBrokerResult.result) {
                                    brokerInstance.dispose().subscribe(disposeResult => {
                                    });
                                    subscriber.next({
                                        result: false,
                                        msg: 'Failed to restore broker from saved state'
                                    });
                                    subscriber.complete();
                                }
                                subscriber.next(setBrokerResult);
                                subscriber.complete();
                            });
                        } else {
                            subscriber.next({
                                result: false,
                                msg: 'Failed to restore broker from saved state'
                            });
                            subscriber.complete();
                        }
                    } else {
                        subscriber.next(value);
                        subscriber.complete();
                    }
                }, (error) => {
                    subscriber.next({
                        result: false,
                        msg: 'Failed to restore broker from saved state'
                    });
                    subscriber.complete();
                });
        });
    }
}
