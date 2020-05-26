import {IInstrument} from "../../../app/models/common/instrument";
import {ITick} from "../../../app/models/common/tick";
import {TimeZone, TzUtils} from "TimeZones";
import {IBarData} from "@app/models/common/barData";
import {JsUtil} from "../../../utils/jsUtil";

export enum TrendDirection {
    Up,
    Down,
    Unknown
}

export class WatchlistInstrumentVM {
    instrument: IInstrument;
    highestPrice = 0;
    lowestPrice = 0;
    volume24h = 0;
    firstPrice = 0;
    priceChange = 0;
    lastClose = 0;
    tick: ITick;
    trendDirection = TrendDirection.Unknown;
    tickTime: string;

    get volume(): number {
        return this.tick ? this.tick.volume : 0;
    }

    get symbol(): string {
        return this.instrument.symbol;
    }

    get price(): number {
        if (this.tick)
            return this.tick.price;

        if (this.lastClose)
            return this.lastClose;

        return null;
    }

    constructor(instrument: IInstrument) {
        this.instrument = instrument;
    }

    handleTick(tick: ITick) {
        this.tick = Object.assign({}, tick, {
            volume: tick.volume != null ? JsUtil.roundNumber(tick.volume, 2) : null,
            price: tick.price != null ? tick.price : null
        });
        this.tickTime = new Date(tick.time).toISOString();

        this._updateData(tick);
    }

    initData(data: IBarData[]) {
        if (data.length) {
            this.lastClose = data[data.length - 1].close;

            this.highestPrice = Math.max(...data.map(value => value.high));
            this.lowestPrice = Math.min(...data.map(value => value.low));
            this.firstPrice = data[0].close;
            this.trendDirection = this._getTrendDirection(this.price, this.firstPrice);
            this.priceChange = this._calculatePriceChange(this.price, this.firstPrice);
            this.volume24h = 0;
            data.forEach(value => this.volume24h += value.volume);
        }
    }

    handleTimeZoneChange(prevTimeZone: TimeZone, currentTimeZone: TimeZone) {
        if (this.tick) {
            this.tick.time = TzUtils.convertDateTz(new Date(this.tick.time), prevTimeZone, currentTimeZone).getTime();
            this.tickTime = new Date(this.tick.time).toISOString();
        }
    }

    getPricePrecision(tickSize: number) {
        const precision = tickSize.toString().split('').reverse().indexOf('.');
        return (precision === -1) ? 0 : precision;
    }

    private _updateData(tick: ITick) {
        let price = tick.price;

        if (!this.firstPrice) {
            this.firstPrice = tick.price;
        } else {
            this.trendDirection = this._getTrendDirection(price, this.firstPrice);
            this.priceChange = this._calculatePriceChange(price, this.firstPrice);
        }

        if (this.highestPrice === 0 && this.highestPrice < price) {
            this.highestPrice = JsUtil.roundNumber(price, 4);
        }

        if (this.lowestPrice === 0 && this.lowestPrice > price) {
            this.lowestPrice = JsUtil.roundNumber(price, 4);
        }
    }

    private _getTrendDirection(currentPrice: number, firstPrice: number): TrendDirection {
        if (currentPrice >= firstPrice) {
            return TrendDirection.Up;
        } else {
            return TrendDirection.Down;
        }
    }

    private _calculatePriceChange(currentPrice: number, firstPrice: number): number {
        return (currentPrice - firstPrice) / firstPrice;
    }
}
