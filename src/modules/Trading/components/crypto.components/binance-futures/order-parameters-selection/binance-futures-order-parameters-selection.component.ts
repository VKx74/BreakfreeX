import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EExchange } from '@app/models/common/exchange';
import { IInstrument } from '@app/models/common/instrument';
import { BrokerService } from '@app/services/broker.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'binance-futures-order-parameters-selection',
    templateUrl: './binance-futures-order-parameters-selection.component.html',
    styleUrls: ['./binance-futures-order-parameters-selection.component.scss']
})
export class BinanceFuturesOrderParametersSelectionComponent {
    // private _selectedFromTime: string;
    // private _selectedFromDate: Date;
    // private _selectedToTime: string;
    // private _selectedToDate: Date;

    @Input()  instrument: IInstrument;
    @Output() instrumentChange = new EventEmitter<IInstrument>();

    @Input()  fromTime: string;
    @Output() fromTimeChange = new EventEmitter<string>();
    @Input()  toTime: string;
    @Output() toTimeChange = new EventEmitter<string>();

    @Input()  fromDate: Date;
    @Output() fromDateChange = new EventEmitter<Date>();
    @Input()  toDate: Date;
    @Output() toDateChange = new EventEmitter<Date>();

    @Output() refreshChange = new EventEmitter<void>();

    get instrumentSearchCallback(): (e?: EExchange, s?: string) => Observable<IInstrument[]> {
        return (e, s) => {
            return this._broker.activeBroker.getInstruments(e, s);
        };
    }

    set selectedFromTime(value: string) {
        if (value) {
            this.fromTime = value;
            this.fromTimeChange.emit(this.fromTime);
        }
    }

    get selectedFromTime(): string {
        return this.fromTime;
    }

    set selectedFromDate(value: Date) {
        if (value) {
            this.fromDate = value;
            this.fromDateChange.emit(this.fromDate);
        }
    }

    get selectedFromDate(): Date {
        return this.fromDate;
    }

    set selectedToTime(value: string) {
        if (value) {
            this.toTime = value;
            this.toTimeChange.emit(this.fromTime);
        }
    }

    get selectedToTime(): string {
        return this.toTime;
    }

    set selectedToDate(value: Date) {
        if (value) {
            this.toDate = value;
            this.toDateChange.emit(this.toDate);
        }
    }

    get selectedToDate(): Date {
        return this.toDate;
    }

    constructor(private _broker: BrokerService) {
    }

    handleInstrumentChange(instrument: IInstrument) {
        this.instrument = instrument;
        this.instrumentChange.emit(this.instrument);
    } 
    
    refresh() {
        this.refreshChange.emit();
    }
}
