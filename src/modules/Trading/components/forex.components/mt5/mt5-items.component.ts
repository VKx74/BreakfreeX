import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import {Inject, OnDestroy, OnInit} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import {AlertService} from "@alert/services/alert.service";
import {RealtimeService} from '@app/services/realtime.service';
import {InstrumentService} from '@app/services/instrument.service';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import {MatDialog} from "@angular/material/dialog";

export abstract class MT5ItemsComponent<T> implements OnInit, OnDestroy {
    private _subscription: Subscription;

    items: T[] = [];

    selectedItem: T;

    selectItem(item: T) {
        this.selectedItem = item;
    }

    constructor(@Inject(MT5Broker) protected _mt5Broker: MT5Broker,
                @Inject(AlertService) protected _alertService: AlertService,
                protected _dialog: MatDialog) {

    }

    ngOnInit(): void {
        this.updateItems();
        this._subscription = this._subscribeOnUpdates();
    }

    protected updateItems(): void {
        this.loadItems()
            .subscribe(
                items => this.items = items.slice(),
                e => this._handleLoadingError(e)
            );
    }

    protected abstract loadItems(): Observable<T[]>;

    protected _subscribeOnUpdates(): Subscription {
        return null;
    }

    private _handleLoadingError(e) {
        this._alertService.error(this._getLoadingError());
    }

    protected _getLoadingError() {
        return 'Can\'t loading items';
    }

    ngOnDestroy(): void {
        if (this._subscription)
            this._subscription.unsubscribe();
    }
}
