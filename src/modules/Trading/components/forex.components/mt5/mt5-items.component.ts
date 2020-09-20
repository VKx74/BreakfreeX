import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import {EventEmitter, Inject, OnDestroy, OnInit, Output} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import {AlertService} from "@alert/services/alert.service";
import {RealtimeService} from '@app/services/realtime.service';
import {InstrumentService} from '@app/services/instrument.service';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import {MatDialog} from "@angular/material/dialog";
import { MT5OrderEditModalComponent } from './order-edit-modal/mt5-order-edit-modal.component';
import { OrderSide } from 'modules/Trading/models/models';

export abstract class MT5ItemsComponent<T> implements OnInit, OnDestroy {
    private _subscription: Subscription;
    private _instrumentDecimals: { [symbol: string]: number; } = {};


    @Output() onOrderEdit = new EventEmitter<T>();
    @Output() onOrderClose = new EventEmitter<T>();
    @Output() onPositionClose = new EventEmitter<T>();
    @Output() onOpenChart = new EventEmitter<T>();

    items: T[] = [];
    selectedItem: T;
    OrderSide = OrderSide;

    selectItem(item: T) {
        this.selectedItem = item;
    } 

    doubleClicked(item: T) {
        this.raiseOpenChart(item);
    }

    handleContextMenuSelected(menu_id: string) {
        switch (menu_id) {
            case "view": this.raiseOpenChart(this.selectedItem); break;
            case "closePosition": this.raisePositionClose(this.selectedItem); break;
            case "cancelOrder": this.raiseOrderClose(this.selectedItem); break;
            case "closeOrder": this.raiseOrderClose(this.selectedItem); break;
            case "edit": this.raiseEdit(this.selectedItem); break;
        }
    }   

    constructor(@Inject(MT5Broker) protected _mt5Broker: MT5Broker,
                @Inject(AlertService) protected _alertService: AlertService,
                protected _dialog: MatDialog) {

    }

    ngOnInit(): void {
        this.updateItems();
        this._subscription = this._subscribeOnUpdates();
    }

    public raiseEdit(item: T) {
        this.onOrderEdit.next(item);
    }

    public raiseOrderClose(item: T) {
        this.onOrderClose.next(item);
    }
    
    public raiseOpenChart(item: T) {
        this.onOpenChart.next(item);
    }
    
    public raisePositionClose(item: T) {
        this.onPositionClose.next(item);
    }

    public getDecimals(symbol: string): number {
        if (this._instrumentDecimals[symbol]) {
            return this._instrumentDecimals[symbol];
        }

        const decimals = this._mt5Broker.instrumentDecimals(symbol);
        this._instrumentDecimals[symbol] = decimals;
        return decimals;
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
