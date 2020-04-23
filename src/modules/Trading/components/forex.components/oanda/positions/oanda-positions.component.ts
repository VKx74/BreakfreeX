import {Component, EventEmitter} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import {OandaItemsComponent} from "../oanda-items.component";
import { ITick } from '@app/models/common/tick';
import { EMarketType } from '@app/models/common/marketType';
import { EExchange } from '@app/models/common/exchange';
import { map } from 'rxjs/operators';
import {OandaPosition} from 'modules/Trading/models/forex/oanda/oanda.models';
import {ColumnSortDataAccessor} from "../../../../../datatable/components/data-table/data-table.component";
import {OrderSide} from "../../../../models/models";

@Component({
    selector: 'oanda-positions',
    templateUrl: './oanda-positions.component.html',
    styleUrls: ['./oanda-positions.component.scss']
})
export class OandaPositionsComponent extends OandaItemsComponent<OandaPosition> {
    private _realtimeSubscription: Subscription[] = [];
    private _realtimeCache: { [symbol: string]: ITick; } = {};
    OrderSide = OrderSide;
    onCancelPendingSymbol: EventEmitter<string> = new EventEmitter();

    protected loadItems(): Observable<OandaPosition[]> {
        if (!this._oandaBrokerService.userInfo) {
            return of([]);
        }
        return this._oandaBrokerService.getPositions().pipe(map((positions: OandaPosition[]) => {
            this._resubscribe(positions);
            return positions;
        }));
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._oandaBrokerService.onPositionUpdated.subscribe(orderResp => {
            this.updateItems();
        });
    }

    closePosition(position: OandaPosition) {
        if (position) {
            this._oandaBrokerService.closePosition({
                Symbol: position.symbol,
            }).subscribe(
                () => {
                    // Response in socket
                },
                (e) => console.log(e)
            );
        }
    }

    ngOnDestroy(): void {
        for (let i = 0; i < this._realtimeSubscription.length; i++) {
            this._realtimeSubscription[i].unsubscribe();
        }
        this._realtimeSubscription = [];

        super.ngOnDestroy();
    }

    lastPriceDataAccessor: ColumnSortDataAccessor = (item: OandaPosition) => {
        return this.getLastPrice(item.symbol);
    }

    unrealizedDataAccessor: ColumnSortDataAccessor = (item: OandaPosition) => {
        return this.getLastUpl(item);
    }

    public getLastPrice(symbol: string): any {
        return this._realtimeCache[symbol] ? this._realtimeCache[symbol].price : "-";
    }

    public getLastUpl(position: OandaPosition): number {
        const lastPrice = this._realtimeCache[position.symbol];

        if (!lastPrice) {
            return 0;
        }

        return (lastPrice.price - position.avgPrice) * position.units;
    }

    trackById(index, item: OandaPosition) {
        return index;
    }

    private _resubscribe(positions: OandaPosition[]) {
        for (let i = 0; i < this._realtimeSubscription.length; i++) {
            this._realtimeSubscription[i].unsubscribe();
        }

        this._realtimeSubscription = [];

        for (let i = 0; i < positions.length; i++) {
            const subscription = this._realtimeService.subscribeToTicks({
                baseInstrument: "",
                dependInstrument: "",
                exchange: EExchange.Oanda,
                id: positions[i].symbol,
                pricePrecision: 0,
                symbol: positions[i].symbol,
                tickSize: 0,
                type: EMarketType.Forex,
            }, (value: ITick) => this._handleTicks(value));

            this._realtimeSubscription.push(subscription);
        }
    }

    private _handleTicks(tick: ITick) {
        this._realtimeCache[tick.instrument.symbol] = tick;
    }
}
