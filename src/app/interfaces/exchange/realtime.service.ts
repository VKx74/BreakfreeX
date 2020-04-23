import {Observable, Observer, Subject} from "rxjs";
import {IInstrument} from "../../models/common/instrument";
import {ILevel2, ITick} from "../../models/common/tick";
import {EExchange} from "../../models/common/exchange";
import {IHealthable} from "../healthcheck/healthable";
import {EMarketType} from "../../models/common/marketType";
import {
    EUpdateAction,
    ILevel2Response,
    ILevel2UpdateAction,
    ITickerResponse,
    IWSResponseBase,
    IWSSubscriptionBody,
    ILevel2Snapshot
} from "../../models/coinbase.exchange/models";
import {WebsocketBase} from "../socket/socketBase";
import {ReadyStateConstants} from "../socket/WebSocketConfig";
import {ESide} from "../../models/common/side";
export abstract class RealtimeServiceBase implements IHealthable {
    protected _action: string;
    protected _level2Channel: string;
    protected _tickerChannel: string;
    protected _level2MessageType: string;
    protected _tickerMessageType: string;

    protected _counter = 0;
    protected _socket: WebsocketBase;
    protected _tickerSubscriptions: IWSSubscriptionBody[] = [];
    protected _level2Subscriptions: IWSSubscriptionBody[] = [];
    protected _symbolToInstrument:  { [symbol: string]: IInstrument; } = {};
    protected _level2:  { [symbol: string]: ILevel2; } = {};

    protected _supportedExchanges: EExchange[] = [];
    protected _supportedMarkets: EMarketType[] = [];

    get supportedExchanges(): EExchange[] {
        return this._supportedExchanges;
    }

    get supportedMarkets(): EMarketType[] {
        return this._supportedMarkets;
    }


    onlevel2: Subject<ILevel2> = new Subject<ILevel2>();
    onticks: Subject<ITick> = new Subject<ITick>();

    get isHealthy(): boolean {
        return this._socket.readyState === ReadyStateConstants.OPEN;
    }

    constructor(ws: WebsocketBase) {
        this._socket = ws;
    }

    close(): Observable<void> {
        return undefined;
    }

    open(): Observable<void> {
        return new Observable((observer: Observer<void>) => {
            this._socket.onMessage.subscribe(value => {
                const msgData = value as IWSResponseBase;

                try {
                    this._processMessage(msgData);
                } catch (e) {
                    console.log('Failed to parse ws message: ' + this._action);
                    console.log(e);
                }
            });

            this._socket.onReconnect.subscribe(() => {
                this._resubscribe();
            });

            this._socket.open().subscribe(value => {
                observer.next(value);
            }, error => {
                observer.error(error);
            });
        });
    }

    subscribeToLevel2(instrument: IInstrument) {
        if (this._getExistingLevel2Subscribtion(instrument) !== -1) {
            return;
        }

        const subscribeMsg = this._createSubscriptionMessage(this._level2Channel, this._action, instrument);

        this._level2Subscriptions.push(subscribeMsg);

        const hash = this._getInstrumentHash(instrument);

        this._level2[hash] = {
            buys: [],
            sells: [],
            instrument: instrument
        };

        this._symbolToInstrument[hash] = instrument;
        this._socket.send(JSON.stringify(subscribeMsg));
    }

    subscribeToTicks(instrument: IInstrument) {
        if (this._getExistingTickerSubscribtion(instrument) !== -1) {
            return;
        }

        const subscribeMsg = this._createSubscriptionMessage(this._tickerChannel, this._action, instrument);

        const hash = this._getInstrumentHash(instrument);

        this._tickerSubscriptions.push(subscribeMsg);
        this._symbolToInstrument[hash] = instrument;
        this._socket.send(JSON.stringify(subscribeMsg));
    }

    unsubscribeFromLevel2(instrument: IInstrument) {
        const subscribeMsgIndex = this._getExistingLevel2Subscribtion(instrument);

        if (subscribeMsgIndex === -1) {
            return;
        }

        const unsubscribeMsg = this._level2Subscriptions[subscribeMsgIndex];
        this._level2Subscriptions.splice(subscribeMsgIndex, 1);
        unsubscribeMsg.IsSubscribe = false;
        this._socket.send(JSON.stringify(unsubscribeMsg));
    }

    unsubscribeFromTicks(instrument: IInstrument) {
        const subscribeMsgIndex = this._getExistingTickerSubscribtion(instrument);

        if (subscribeMsgIndex === -1) {
            return;
        }


        const unsubscribeMsg = this._tickerSubscriptions[subscribeMsgIndex];
        this._tickerSubscriptions.splice(subscribeMsgIndex, 1);
        unsubscribeMsg.IsSubscribe = false;
        this._socket.send(JSON.stringify(unsubscribeMsg));
    }


    protected _getExistingTickerSubscribtion(instrument: IInstrument): number {
        for (let i = 0; i < this._tickerSubscriptions.length; i++) {
            if (this._tickerSubscriptions[i].Product === instrument.symbol &&
                this._tickerSubscriptions[i].Market === instrument.exchange) {
                return i;
            }
        }

        return -1;
    }

    protected _getExistingLevel2Subscribtion(instrument: IInstrument): number {
        for (let i = 0; i < this._level2Subscriptions.length; i++) {
            if (this._level2Subscriptions[i].Product === instrument.symbol &&
                this._level2Subscriptions[i].Market === instrument.exchange) {
                return i;
            }
        }

        return -1;
    }

    protected _createSubscriptionMessage(channel: string, action: string, instrument: IInstrument): IWSSubscriptionBody {
        const id = this._counter + instrument.symbol + Date.now().toString();
        this._counter++;

        const subscribtionBody: IWSSubscriptionBody = {
            MsgType: 'SubscribeMessage',
            Channel: channel,
            Product: instrument.symbol,
            Market: instrument.exchange,
            IsSubscribe: true
        };

        return subscribtionBody;
    }

    protected _processMessage(msgData: IWSResponseBase) {
        if (msgData.MsgType === this._tickerMessageType) {
            const tick = msgData as ITickerResponse;
            const hash = this._getInstrumentHashFromTick(tick);
            const instrument = this._symbolToInstrument[hash];

            if (!instrument) {
                return;
            }

            this.onticks.next({
                instrument: instrument,
                price: tick.Price ? tick.Price : 0,
                volume: tick.Size ? tick.Size : 0,
                side: tick.Side,
                time: tick.Date ? new Date(tick.Date * 1000).getTime() : new Date().getTime()
            });
        } else if (msgData.MsgType === this._level2MessageType) {
            const l2Response = msgData as ILevel2Snapshot;
            const hash = l2Response.Symbol.toUpperCase();
            const instrument = this._symbolToInstrument[hash];

            if (!instrument || !this._level2[hash] || !l2Response.Data) {
                return;
            }

            this._processLevel2Snapshot(l2Response, instrument);
            this.onlevel2.next(this._level2[hash]);
        }
    }

    protected _processLevel2Snapshot(data: ILevel2Snapshot, instrument: IInstrument) {
        const hash = this._getInstrumentHash(instrument);
        const level2 = this._level2[hash];
        level2.buys = [];
        level2.sells = [];
        const bids = data.Data.Asks;
        const asks = data.Data.Bids;

        for (let i = 0; i < bids.length; i++) {
            const bid = bids[i];
            level2.sells.push({
                instrument: instrument,
                price: bid.Price,
                volume: bid.TotalSize,
                side: ESide.buy,
                time: 0
            });
        }
        for (let i = 0; i < asks.length; i++) {
            const ask = asks[i];
            level2.buys.push({
                instrument: instrument,
                price: ask.Price,
                volume: ask.TotalSize,
                side: ESide.sell,
                time: 0
            });
        }
    }

    protected _processLevel2Updates(updates: ILevel2UpdateAction[], instrument: IInstrument) {
        const hash = this._getInstrumentHash(instrument);
        const level2 = this._level2[hash];
        for (let i = 0; i < updates.length; i++) {
            const update = updates[i];

            if (update.UpdateAction === EUpdateAction.Delete) {
                if (update.OrderSide === ESide.buy) {
                    level2.buys.splice(update.Position, 1);
                } else if (update.OrderSide === ESide.sell) {
                    level2.sells.splice(update.Position, 1);
                }
            }

            if (update.UpdateAction === EUpdateAction.Update) {
                if (update.OrderSide === ESide.buy) {
                    level2.buys.splice(update.Position, 1, this._createLevel2Tick(update, instrument));
                } else if (update.OrderSide === ESide.sell) {
                    level2.sells.splice(update.Position, 1, this._createLevel2Tick(update, instrument));
                }
            }

            if (update.UpdateAction === EUpdateAction.Add) {
                if (update.OrderSide === ESide.buy) {
                    level2.buys.splice(update.Position, 0, this._createLevel2Tick(update, instrument));
                } else if (update.OrderSide === ESide.sell) {
                    level2.sells.splice(update.Position, 0, this._createLevel2Tick(update, instrument));
                }
            }
        }
    }

    protected _createLevel2Tick(l2Update: ILevel2UpdateAction, instrument: IInstrument): ITick {
        return {
            instrument: instrument,
            price: l2Update.Price ? l2Update.Price : 0,
            volume: l2Update.Size ? l2Update.Size : 0,
            side: l2Update.OrderSide,
            time: new Date().getTime()
        };
    }

    protected _getInstrumentHash(instrument: IInstrument) {
        return instrument.symbol.toUpperCase();
    }

    protected _getInstrumentHashFromTick(tick: ITickerResponse) {
        return tick.Product.toUpperCase();
    }

    protected _getInstrumentHashFromL2(l2: ILevel2Response) {
        return l2.Product.toUpperCase();
    }

    protected _resubscribe() {
        this._level2Subscriptions.forEach(msg => {
            try {
                this._socket.send(JSON.stringify(msg));
            } catch (e) {
                console.log("Failed to resubscribe on L2 realtime");
                console.log(e);
            }
        });

        this._tickerSubscriptions.forEach(msg => {
            try {
                this._socket.send(JSON.stringify(msg));
            } catch (e) {
                console.log("Failed to resubscribe on tick realtime");
                console.log(e);
            }
        });
    }
}
