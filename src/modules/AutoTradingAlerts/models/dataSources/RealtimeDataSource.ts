import {AlertDataSourceBase} from "../AlertDataSourceBase";
import {Subscription} from "rxjs";
import {EDataSourceType} from "../Enums";
import {Error} from "tslint/lib/error";
import {IInstrument} from "../../../../app/models/common/instrument";
import {RealtimeService} from "../../../../app/services/realtime.service";
import {ITick} from "../../../../app/models/common/tick";
import {RealtimeSourceSettings} from "../AlertSourceSettingsBase";
import {Injectable} from "@angular/core";
import {InstrumentService} from "@app/services/instrument.service";
import {EExchange} from "@app/models/common/exchange";
import {EMarketType} from "@app/models/common/marketType";

@Injectable()
export class RealtimeDataSource extends AlertDataSourceBase {
    protected _subscription: Subscription;
    protected _symbol: string;
    protected _datafeed: string;
    protected _exchange: EExchange;
    protected _type: EMarketType;
    protected _instrument: IInstrument;

    get dataSourceType(): EDataSourceType {
        return EDataSourceType.RealtimeDataSource;
    }

    get instrument(): IInstrument {
        return this._instrument;
    }

    get relatedSymbol(): string {
        return this._symbol;
    }

    get relatedExchange(): string {
        return this._exchange;
    }

    constructor(private realtimeService: RealtimeService,
                private instrumentService: InstrumentService) {
        super();
    }

    subscribeToSourceChanged(subscription: () => void) {
        if (!this._symbol) {
            return;
        }

        this._subscribers.push(subscription);

        if (this._subscribers.length === 1) {
            this.instrumentService.getInstrumentBySymbol(this._symbol, this._exchange).subscribe((instrument: IInstrument) => {
                this._instrument = instrument;

                this._subscription = this.realtimeService.subscribeToTicks(this._instrument, value => {
                    this._processTick(value);
                });
            });
        }
    }

    unsubscribeFromSourceChanged(subscription: () => void) {
        for (let i = 0; i < this._subscribers.length; i++) {
            if (this._subscribers[i] === subscription) {
                this._subscribers.splice(i, 1);
                i--;
            }
        }

        if (this._subscribers.length === 0 && this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
            this.lastValue = null;
            this.previouseValue = null;
            this.time = null;
        }
    }

    dispose() {
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
            this.lastValue = null;
            this.previouseValue = null;
            this.time = null;
        }

        this._subscribers = [];
    }


    getSettings(): RealtimeSourceSettings {
        return {
            DataSourceType: this.dataSourceType,
            Symbol: this._symbol,
            Type: this._type,
            Exchange: this._exchange,
            Datafeed: this._datafeed
        };
    }

    init(value: RealtimeSourceSettings) {
        if (this._symbol) {
            throw new Error('Data source already initialized');
        }

        this._symbol = value.Symbol;
        this._exchange = value.Exchange;
        this._type = value.Type;
        this._datafeed = value.Datafeed;
    }

    getDescription(): string {
        return this.relatedSymbol;
    }

    protected _processTick(value: ITick) {
        this.previouseValue = this.lastValue;
        this.lastValue = value.price;
        this.time = value.time;

        for (let i = 0; i < this._subscribers.length; i++) {
            try {
                this._subscribers[i]();
            } catch (e) {
                console.log('_processTick - realtime data source');
                console.log(e);
            }

        }
    }
}


