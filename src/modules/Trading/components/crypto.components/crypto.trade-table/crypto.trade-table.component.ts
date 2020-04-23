import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {BrokerService} from "@app/services/broker.service";
import {ICryptoTrade} from "../../../models/crypto/crypto.models";
import {LocalTimeZone, TimeZoneManager, TzUtils} from "TimeZones";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {TranslateService} from "@ngx-translate/core";
import {EExchange} from "@app/models/common/exchange";
import {Observable, Subject} from "rxjs";
import {IInstrument} from "@app/models/common/instrument";
import {switchMap, takeUntil, tap} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {DataTableComponent} from "../../../../datatable/components/data-table/data-table.component";
import {DirectionTrades} from "../../../models/crypto/bitmex/bitmex.models";
import bind from "bind-decorator";

@Component({
    selector: 'crypto-trade-table',
    templateUrl: './crypto.trade-table.component.html',
    styleUrls: ['./crypto.trade-table.component.scss']
})
export class CryptoTradeTableComponent implements OnInit {
    @Input() showInstrumentSearch: boolean = false;
    @ViewChild('tradesTable', {read: DataTableComponent, static: false}) tradesTable: DataTableComponent;

    private _instrument: IInstrument;
    private _instrumentChange$ = new Subject<IInstrument>();
    trades: ICryptoTrade[] = [];

    get directionsTrades() {
        return DirectionTrades;
    }

    constructor(private _brokerService: BrokerService,
                private _translateService: TranslateService,
                private _timeZoneManager: TimeZoneManager) {
    }

    ngOnInit() {
        const activeBroker = this._brokerService.activeBroker as CryptoBroker;

        activeBroker.onTradesInfoUpdated
            .pipe(
                takeUntil(componentDestroyed(this)),
                switchMap(() => this._loadTrades())
            )
            .subscribe((trades: ICryptoTrade[]) => {
                this.trades = trades;
            });

        this._instrumentChange$
            .pipe(
                takeUntil(componentDestroyed(this)),
                tap((instrument: IInstrument) => {
                    this._instrument = instrument;
                }),
                switchMap((instrument: IInstrument) => this._loadTrades(instrument))
            )
            .subscribe((trades: ICryptoTrade[]) => {
                this.trades = trades;
            });


        if (!this.showInstrumentSearch) {
            this._loadTrades()
                .subscribe((trades: ICryptoTrade[]) => {
                    this.trades = trades;
                });
        }
    }

    getFormattedDate(time: number): string {
        const date = TzUtils.convertDateTz(new Date(time), LocalTimeZone, this._timeZoneManager.timeZone);
        return moment(date).format('MMM DD HH:mm:ss');
    }

    trackByID(index, item: ICryptoTrade) {
        return item.id;
    }

    handleInstrumentChange(instrument: IInstrument) {
        this._instrumentChange$.next(instrument);
    }

    instrumentSearchCallback = (e?: EExchange, s?: string): Observable<IInstrument[]> => {
        return this._brokerService.getInstruments(e, s);
    }

    @bind
    columnCaption(columnName: string): Observable<string> {
        return this._translateService.get(columnName);
    }

    private _loadTrades(instrument?: IInstrument): Observable<ICryptoTrade[]> {
        const params = instrument ? {symbol: instrument.symbol} : {};

        return (this._brokerService.activeBroker as CryptoBroker).getTrades(params);
    }

    ngOnDestroy() {
    }
}
