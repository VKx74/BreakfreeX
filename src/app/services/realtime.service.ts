import {Injectable} from "@angular/core";
import {IInstrument} from "../models/common/instrument";
import {EExchange} from "../models/common/exchange";
import {RealtimeServiceBase} from "../interfaces/exchange/realtime.service";
import {ILevel2, ITick} from "../models/common/tick";
import {Subject, Subscription} from "rxjs";
import {auditTime} from 'rxjs/operators';
import {JsUtil} from "../../utils/jsUtil";
import {IHealthable} from "../interfaces/healthcheck/healthable";
import {TimeZoneManager, TzUtils, UTCTimeZone} from "TimeZones";
import {APP_TYPE_EXCHANGES} from "../enums/ApplicationType";
import {ExchangeFactory} from "../factories/exchange.factory";
import {ApplicationTypeService} from "./application-type.service";

@Injectable()
export class RealtimeService implements IHealthable {
    private services: RealtimeServiceBase[] = [];
    private _tickSubscribers: { [symbol: string]: Subject<ITick>; } = {};
    private _l2Subscribers: { [symbol: string]: Subject<ILevel2>; } = {};
    private _ticksSubscriptionQueue: IInstrument[] = [];
    private _l2SubscriptionQueue: IInstrument[] = [];
    private _tickCache: { [symbol: string]: ITick; } = {};
    private _tradesCache: { [symbol: string]: ITick[]; } = {};
    private _l2Cache: { [symbol: string]: ILevel2; } = {};

    public get isHealthy(): boolean {
        let _isHealthy = true;

        for (let i = 0; i < this.services.length; i++) {
            if (!this.services[i].isHealthy) {
                _isHealthy = false;
                break;
            }
        }

        return _isHealthy;
    }

    constructor(private exchangeFactory: ExchangeFactory,
                private _timeZoneManager: TimeZoneManager,
                private applicationTypeService: ApplicationTypeService) {
        this._init();
    }

    static getInstrumentHash(instrument: IInstrument): string {
        return JsUtil.getInstrumentHash(instrument);
    }

    private _init() {
        setTimeout(() => {
            let exchanges = APP_TYPE_EXCHANGES[this.applicationTypeService.applicationType];
            if (exchanges) {
                exchanges.forEach(value => {
                    this.exchangeFactory.tryCreateRealtimeServiceInstance(value).subscribe(result => {
                        if (result.serviceInstance && result.result) {
                            const specificService = result.serviceInstance;
                            specificService.open().subscribe(() => {
                                specificService.onticks.subscribe(this._processTicks.bind(this));
                                specificService.onlevel2.pipe(auditTime(500)).subscribe(this._processLevel2.bind(this));
                                this.services.push(specificService);
                                this._trySubscribe();
                            }, error => {
                                console.table(error);
                            });
                        } else {
                            console.table(result);
                        }
                    }, error => {
                        console.table(error);
                    });
                });
            }
        });
    }

    subscribeToTicks(instrument: IInstrument, subscription: (value: ITick) => void): Subscription {
        const hash = RealtimeService.getInstrumentHash(instrument);

        if (!this._tickSubscribers[hash]) {
            this._tickSubscribers[hash] = new Subject<ITick>();
            const service = this._getService(instrument.exchange);
            if (service) {
                service.subscribeToTicks(instrument);
            } else {
                let exist = false;
                for (let i = 0; i < this._ticksSubscriptionQueue.length; i++) {
                    if (this._ticksSubscriptionQueue[i].id === instrument.id &&
                        this._ticksSubscriptionQueue[i].exchange === instrument.exchange) {
                        exist = true;
                        break;
                    }
                }

                if (!exist) {
                    this._ticksSubscriptionQueue.push(instrument);
                }
            }
        }

        return this._tickSubscribers[hash].subscribe(subscription);
    }

    subscribeToL2(instrument: IInstrument, subscription: (value: ILevel2) => void): Subscription {
        const hash = RealtimeService.getInstrumentHash(instrument);

        if (!this._l2Subscribers[hash]) {
            this._l2Subscribers[hash] = new Subject<ILevel2>();
            const service = this._getService(instrument.exchange);
            if (service) {
                service.subscribeToLevel2(instrument);
            } else {
                let exist = false;
                for (let i = 0; i < this._l2SubscriptionQueue.length; i++) {
                    if (this._l2SubscriptionQueue[i].id === instrument.id &&
                        this._l2SubscriptionQueue[i].exchange === instrument.exchange) {
                        exist = true;
                        break;
                    }
                }

                if (!exist) {
                    this._l2SubscriptionQueue.push(instrument);
                }
            }
        }

        return this._l2Subscribers[hash].subscribe(subscription);
    }

    getLastTick(instrument: IInstrument): ITick {
        const hash = RealtimeService.getInstrumentHash(instrument);
        return this._tickCache[hash];
    }

    getLastL2Ticks(instrument: IInstrument): ILevel2 {
        const hash = RealtimeService.getInstrumentHash(instrument);
        return this._cloneL2(this._l2Cache[hash]);
    }

    getLastTicks(instrument: IInstrument): ITick[] {
        const hash = RealtimeService.getInstrumentHash(instrument);
        return this._tradesCache[hash];
    }

    private _tryUnsubscribeFromTicks(instrument: IInstrument) {
        const hash = RealtimeService.getInstrumentHash(instrument);
        const subject = this._tickSubscribers[hash];
        if (subject && subject.observers.length === 0) {
            const service = this._getService(instrument.exchange);
            if (service) {
                service.unsubscribeFromTicks(instrument);
            }
            this._tickSubscribers[hash].unsubscribe();
            delete this._tickSubscribers[hash];

            if (this._tradesCache[hash]) {
                delete this._tradesCache[hash];
            }

            if (this._tickCache[hash]) {
                delete this._tickCache[hash];
            }
        }
    }

    private _tryUnsubscribeFromL2(instrument: IInstrument) {
        const hash = RealtimeService.getInstrumentHash(instrument);
        const subject = this._l2Subscribers[hash];
        if (subject && subject.observers.length === 0) {
            const service = this._getService(instrument.exchange);
            if (service) {
                service.unsubscribeFromLevel2(instrument);
            }
            this._l2Subscribers[hash].unsubscribe();
            delete this._l2Subscribers[hash];
            delete this._l2Cache[hash];
        }
    }

    private _trySubscribe() {
        for (let i = 0; i < this._ticksSubscriptionQueue.length; i++) {
            const instrument = this._ticksSubscriptionQueue[i];
            const service = this._getService(instrument.exchange);
            if (service) {
                service.subscribeToTicks(instrument);
                this._ticksSubscriptionQueue.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < this._l2SubscriptionQueue.length; i++) {
            const instrument = this._l2SubscriptionQueue[i];
            const service = this._getService(instrument.exchange);
            if (service) {
                service.subscribeToLevel2(instrument);
                this._l2SubscriptionQueue.splice(i, 1);
                i--;
            }
        }
    }

    private _getService(exchange: EExchange): RealtimeServiceBase {
        for (let i = 0; i < this.services.length; i++) {
            if (this.services[i].supportedExchanges.indexOf(exchange) !== -1) {
                return this.services[i];
            }
        }
    }

    private _processTicks(tick: ITick) {
        const instrument = tick.instrument;
        const hash = RealtimeService.getInstrumentHash(instrument);

        // update timestamp according to timeZone
        tick.time = TzUtils.convertDateTz(JsUtil.UTCDate(tick.time),
            UTCTimeZone, this._timeZoneManager.timeZone).getTime();

        this._tickCache[hash] = tick;

        if (!this._tradesCache[hash]) {
            this._tradesCache[hash] = [];
        }

        this._tradesCache[hash].unshift(tick);

        if (this._tradesCache[hash].length > 20) {
            this._tradesCache[hash] = this._tradesCache[hash].slice(0, 20);
        }

            if (this._tickSubscribers[hash] && this._tickSubscribers[hash].observers.length) {
                this._tickSubscribers[hash].next(tick);
            } else {
                this._tryUnsubscribeFromTicks(instrument);
            }
    }

    private _processLevel2(l2: ILevel2) {
        const instrument = l2.instrument;
        const hash = RealtimeService.getInstrumentHash(instrument);
        this._l2Cache[hash] = l2;

        if (this._l2Subscribers[hash] && this._l2Subscribers[hash].observers.length) {
            this._l2Subscribers[hash].next(this._cloneL2(l2));
        } else {
            this._tryUnsubscribeFromL2(instrument);
        }
    }

    private _cloneL2(l2: ILevel2): ILevel2 {
        return l2 ? {
            instrument: l2.instrument,
            buys: l2.buys.slice(),
            sells: l2.sells.slice()
        } : null;
    }
}
