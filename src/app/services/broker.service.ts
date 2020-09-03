import {Injectable} from "@angular/core";
import {IInstrument} from "../models/common/instrument";
import {EExchange} from "../models/common/exchange";
import {IHealthable} from "../interfaces/healthcheck/healthable";
import {BehaviorSubject, Observable, of, Subject, Subscription} from "rxjs";
import {ApplicationType} from "../enums/ApplicationType";
import {EBrokerInstance, IBroker, IBrokerState} from "../interfaces/broker/broker";
import {ActionResult, IBrokerUserInfo, OrderTypes} from "../../modules/Trading/models/models";
import {map} from "rxjs/operators";
import {BrokerFactory, CreateBrokerActionResult} from "../factories/broker.factory";
import {ApplicationTypeService} from "@app/services/application-type.service";

export interface IBrokerServiceState {
    activeBrokerState?: IBrokerState;
}

@Injectable()
export class BrokerService implements IHealthable {
    // if initialization failed - false, succeed - true, otherwise - null
    private _brokerInitializationState$ = new BehaviorSubject<boolean>(null);
    public brokerInitializationState$ = this._brokerInitializationState$.asObservable();

    get isInitialized(): boolean {
        return this._brokerInitializationState$.value;
    }

    private _activeBroker: IBroker;
    get activeBroker(): IBroker {
        return this._activeBroker;
    }

    private _isConnected: boolean;
    get isConnected(): boolean {
        return this._isConnected;
    }

    public get isHealthy(): boolean {
        return true;
    }

    private _applicationType: ApplicationType;

    get supportedApplicationType(): ApplicationType {
        return this._applicationType;
    }

    private _activeBroker$ = new BehaviorSubject<IBroker>(null);
    activeBroker$ = this._activeBroker$.asObservable();

    private _subscriptionOnBrokerStateChange: Subscription;
    onSaveStateRequired: Subject<void> = new Subject<void>();

    constructor(private _brokerFactory: BrokerFactory,
                private _applicationTypeService: ApplicationTypeService) {
        // Todo review
        this._applicationType = this._applicationTypeService.applicationType;
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

    isInstrumentAvailable(instrument: IInstrument, orderType: OrderTypes): boolean {
        if (!this._activeBroker) {
            return false;
        } else {
            return this._activeBroker.isInstrumentAvailable(instrument, orderType);
        }
    }

    setActiveBroker(broker: IBroker): Observable<ActionResult> {
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

    getInstruments(exchange?: EExchange, search?: string): Observable<IInstrument[]> {
        if (this._activeBroker) {
            return this._activeBroker.getInstruments(exchange, search);
        }

        return of([]);
    }

    tryMapInstrument(instrument: string, exchange: EExchange): Observable<IInstrument[]> {
        let symbolsSimilar = (s1: string, s2: string): boolean => {
            let _s1 = s1.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            let _s2 = s2.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            return _s1 === _s2;
        };

        if (this._activeBroker) {
            return this._activeBroker.getInstruments(exchange, instrument[0]).pipe(map((instruments: IInstrument[]) => {
                let res: IInstrument[] = [];

                for (let i in instruments) {
                    if (instruments[i].symbol === instrument) {
                        res.unshift(instruments[i]);
                    } else if (symbolsSimilar(instruments[i].symbol, instrument)) {
                        res.push(instruments[i]);
                    }
                }

                return res;
            }));
        }

        return of([]);
    }

    saveState(): Observable<IBrokerServiceState> {
        if (!this._activeBroker) {
            return of({
                activeBrokerState: null
            });
        }

        return this._activeBroker.saveState().pipe(map((value: IBrokerState) => {
            return {
                activeBrokerState: value
            };
        }));
    }

    loadState(state: IBrokerServiceState): Observable<ActionResult> {
        if (!state) {
            return of({
                result: false,
                msg: 'Broker state is empty'
            });
        }

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

        // return this._restoreBrokerFromState(state.activeBrokerState);
    }

    setDefaultBroker(): Observable<ActionResult> {
        switch (this._applicationTypeService.applicationType) {
            // case ApplicationType.Crypto:
            //     return this._restoreBrokerFromState({
            //         brokerType: EBrokerInstance.BitmexBroker,
            //         state: {}
            //     });
            // case ApplicationType.Forex:
            //     return this._restoreBrokerFromState({
            //         brokerType: EBrokerInstance.OandaBroker,
            //         state: {}
            //     });
            default:
                return of({
                    result: true
                });
        }
    }

    public setBrokerInitializationState(state = true) {
        this._brokerInitializationState$.next(state);
    }

    private _restoreBrokerFromState(activeBrokerState: IBrokerState): Observable<ActionResult> {
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
                });
        });
    }
}
