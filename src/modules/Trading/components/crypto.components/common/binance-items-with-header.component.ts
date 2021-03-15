import { IInstrument } from "@app/models/common/instrument";
import { ItemsComponent } from "../../trade-manager/items-component/items.component";
import { BinanceFuturesItemsComponent } from "../binance-futures/binance-futures-items.component";

export abstract class BinanceItemsComponentWithHeader<T> extends ItemsComponent<T> {
    protected _instrument: IInstrument;
    protected _fromTime: string;
    protected _toTime: string;
    protected _fromDate: Date;
    protected _toDate: Date;

    get instrument(): IInstrument {
        return this._instrument;
    }

    set instrument(data: IInstrument) {
        this._instrument = data;
        this.updateItems();
    }
     
    get fromTime(): string {
        return this._fromTime;
    }

    set fromTime(data: string) {
        this._fromTime = data;
        this.updateItems();
    }
     
    get toTime(): string {
        return this._toTime;
    }

    set toTime(data: string) {
        this._toTime = data;
        this.updateItems();
    }

    get fromDate(): Date {
        return this._fromDate;
    }

    set fromDate(data: Date) {
        this._fromDate = data;
        this.updateItems();
    }

    get toDate(): Date {
        return this._toDate;
    }

    set toDate(data: Date) {
        this._toDate = data;
        this.updateItems();
    }

    protected _getDate(time: string, date: Date): number {
        const hourMin = time.split(":");
        let h = hourMin[0];
        let m = hourMin[1];

        if (h.length === 1) {
            h = `0${h}`;
        }
        if (m.length === 1) {
            m = `0${m}`;
        }

        const dateString = date.toISOString().split("T")[0];
        const timeString = `${h}:${m}:00.500Z`;
        const exp = new Date(`${dateString}T${timeString}`).getTime() / 1000;
        return Math.roundToDecimals(exp, 0);
    }

    refreshRequired() {
        this.updateItems();
    }
    
    ngOnInit() {
        super.ngOnInit();
    }
}