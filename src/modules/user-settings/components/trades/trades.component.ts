import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {IInstrument} from "@app/models/common/instrument";
import {merge, Observable, of} from "rxjs";
import {ICryptoTrade} from "../../../Trading/models/crypto/crypto.models";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {BrokerService} from "@app/services/broker.service";
import {catchError, filter, map, switchMap} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";
import {TimeZoneManager} from "TimeZones";
import {DirectionTrades} from "../../../Trading/models/crypto/bitmex/bitmex.models";
import {memoize} from "@decorators/memoize";
import bind from "bind-decorator";
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../../Trading/localization/token";

export interface TradesResolverData {
    trades: ICryptoTrade[];
}


@Component({
    selector: 'trades',
    templateUrl: './trades.component.html',
    styleUrls: ['./trades.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class TradesComponent implements OnInit, OnDestroy {
    trades: ICryptoTrade[] = [];
    brokerInitializationState$ = this._brokerService.brokerInitializationState$;
    activeBroker$ = this._brokerService.activeBroker$;
    $initObs: Observable<any>;
    trades$ = this.activeBroker$
        .pipe(
            filter(broker => !!broker),
            switchMap((broker: CryptoBroker) => merge(
                of(broker),
                broker.onTradesInfoUpdated
                    .pipe(map(() => broker))
            )),
            switchMap(broker => broker.getTrades()
                .pipe(catchError(() => [])))
        );

    get DirectionTrades() {
        return DirectionTrades;
    }

    get activeBroker(): CryptoBroker {
        return this._brokerService.activeBroker as CryptoBroker;
    }

    get isBrokerConnected() {
        return !!this._brokerService.activeBroker;
    }


    constructor(private _brokerService: BrokerService,
                private _route: ActivatedRoute,
                private _timeZoneManager: TimeZoneManager,
                private _translateService: TranslateService
    ) {

    }

    ngOnInit() {
        // this.trades = (this._route.snapshot.data as TradesResolverData).trades;
        // const activeBroker = this._brokerService.activeBroker as CryptoBroker;

        // if (activeBroker) {
        //     activeBroker.onTradesInfoUpdated
        //         .pipe(
        //             filter(() => this._brokerService.activeBroker != null),
        //             takeUntil(componentDestroyed(this)),
        //             switchMap(() => {
        //                 return this._loadTrades();
        //             })
        //         )
        //         .subscribe((tradesRes: ICryptoTrade[]) => {
        //             this.trades = tradesRes;
        //         });
        // } else {
        //     this._brokerService.brokerInitializationState$
        //         .pipe(
        //             filter(v => v),
        //             first(),
        //             switchMap(() => {
        //                return this._loadTrades();
        //             }),
        //             takeUntil(componentDestroyed(this))
        //         )
        //         .subscribe((tradesRes: ICryptoTrade[]) => {
        //             this.trades = tradesRes;
        //         });
        // }
    }

    ngOnDestroy() {
    }

    private _loadTrades(instrument?: IInstrument): Observable<ICryptoTrade[]> {
        const params = instrument ? {symbol: instrument.symbol} : {};

        return (this._brokerService.activeBroker as CryptoBroker).getTrades(params);
    }

    @memoize()
    getTradesObs() {
        return this.activeBroker$
            .pipe(
                filter(broker => !!broker),
                switchMap((broker: CryptoBroker) => merge(
                    of(broker),
                    broker.onTradesInfoUpdated
                        .pipe(map(() => broker))
                )),
                switchMap(broker => broker.getTrades())
            );
    }

    @bind
    columnCaption(columnName: string): Observable<string> {
        return this._translateService.get(columnName);
    }

}
