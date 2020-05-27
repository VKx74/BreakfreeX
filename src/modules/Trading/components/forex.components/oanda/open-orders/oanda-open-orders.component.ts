import {Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import {OandaItemsComponent} from "../oanda-items.component";
import {ITick} from '@app/models/common/tick';
import {EExchange} from '@app/models/common/exchange';
import {EMarketType} from '@app/models/common/marketType';
import {map} from 'rxjs/operators';
import {OandaOrder} from 'modules/Trading/models/forex/oanda/oanda.models';
import {ColumnSortDataAccessor} from "../../../../../datatable/components/data-table/data-table.component";
import {OrderSide} from "../../../../models/models";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';


@Component({
    selector: 'oanda-open-orders',
    templateUrl: './oanda-open-orders.component.html',
    styleUrls: ['./oanda-open-orders.component.scss']
})
export class OandaOpenOrdersComponent extends OandaItemsComponent<OandaOrder> {
    private _realtimeSubscription: Subscription[] = [];
    private _realtimeCache: { [symbol: string]: ITick; } = {};
    OrderSide = OrderSide;

    protected loadItems(): Observable<OandaOrder[]> {
        if (!this._oandaBrokerService.userInfo) {
            return of([]);
        }
        return this._oandaBrokerService.getOrders().pipe(map((orders: OandaOrder[]) => {
            this._resubscribe(orders);
            return orders;
        }));
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._oandaBrokerService.onOrderUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    closeOrder(selectedItem: OandaOrder) {
        if (selectedItem) {
            this._oandaBrokerService.cancelOrder({
                Id: selectedItem.id
            }).subscribe(
                () => {
                },
                () => {
                }
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

    public getLastPrice(symbol: string): any {
        return this._realtimeCache[symbol] ? this._realtimeCache[symbol].price : "-";
    }

    trackById(index, item: OandaOrder) {
        return item.id;
    }

    lastPriceDataAccessor: ColumnSortDataAccessor = (item: OandaOrder) => {
        return this.getLastPrice(item.symbol);
    }

    private _resubscribe(orders: OandaOrder[]) {
        for (let i = 0; i < this._realtimeSubscription.length; i++) {
            this._realtimeSubscription[i].unsubscribe();
        }

        this._realtimeSubscription = [];

        for (let i = 0; i < orders.length; i++) {
            const subscription = this._realtimeService.subscribeToTicks({
                baseInstrument: "",
                dependInstrument: "",
                exchange: EExchange.Oanda,
                datafeed: EExchangeInstance.OandaExchange,
                id: orders[i].symbol,
                pricePrecision: 0,
                symbol: orders[i].symbol,
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
