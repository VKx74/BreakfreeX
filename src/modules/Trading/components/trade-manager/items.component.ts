import { ChangeDetectorRef, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { AlertService } from "@alert/services/alert.service";
import { MatDialog } from "@angular/material/dialog";
import { OrderSide } from 'modules/Trading/models/models';
import { BrokerService } from '@app/services/broker.service';
import { DataHighlightService, ITradePanelDataHighlight } from "modules/Trading/services/dataHighlight.service";
import { IBroker } from "@app/interfaces/broker/broker";


export abstract class ItemsComponent<T> implements OnInit, OnDestroy {
    protected _blinkingTimeout: any;
    protected _subscriptionOnOrderDataChanged: Subscription;
    protected _onTradePanelDataHighlightSubscription: Subscription;
    protected _instrumentDecimals: { [symbol: string]: number; } = {};
    protected _brokerStateChangedSubscription: Subscription;
    protected _subscription: Subscription;
    protected _selectedTabIndex: number;
    protected get _activeBroker(): IBroker {
        return this._broker.activeBroker;
    }

    @Input() set selectedTabIndex(value: number) {
        this._selectedTabIndex = value;
        if (this._selectedTabIndex !== undefined && this.tabIndex !== undefined && this._selectedTabIndex === this.tabIndex) {
            this.cdr.detectChanges();
        }
    }
    @Input() tabIndex: number;
    @Output() onOrderEdit = new EventEmitter<T>();
    @Output() onOrderClose = new EventEmitter<T>();
    @Output() onPositionClose = new EventEmitter<T>();
    @Output() onOpenChart = new EventEmitter<T>();

    items: T[] = [];
    blinking: T[] = [];
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

    constructor(protected _broker: BrokerService,
        protected _dataHighlightService: DataHighlightService,
        protected _alertService: AlertService,
        protected _dialog: MatDialog,
        protected cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.updateItems();
        this._subscription = this._subscribeOnUpdates();
        this._brokerStateChangedSubscription = this._broker.activeBroker$.subscribe((data) => {
            if (this._broker.activeBroker) {
                this.updateItems();
            }
        });
        this._subscriptionOnOrderDataChanged = this._activeBroker.onOrdersParametersUpdated.subscribe(() => {
            this.collectionUpdated();
        });
        this._onTradePanelDataHighlightSubscription = this._dataHighlightService.onTradePanelDataHighlight.subscribe(this._handleHighlight.bind(this));
    }

    ngOnDestroy(): void {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }

        if (this._brokerStateChangedSubscription) {
            this._brokerStateChangedSubscription.unsubscribe();
        }

        if (this._onTradePanelDataHighlightSubscription) {
            this._onTradePanelDataHighlightSubscription.unsubscribe();
            this._onTradePanelDataHighlightSubscription = null;
        }

        if (this._subscriptionOnOrderDataChanged) {
            this._subscriptionOnOrderDataChanged.unsubscribe();
        }
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

        if (!this._activeBroker) {
            return 0;
        }

        const decimals = this._activeBroker.instrumentDecimals(symbol);
        this._instrumentDecimals[symbol] = decimals;
        return decimals;
    }

    protected refresh(): void {
        if (this._selectedTabIndex !== this.tabIndex) {
            return;
        }

        this.cdr.detectChanges();
    }

    protected updateItems(): void {
        this.loadItems()
            .subscribe(
                items => {
                    this.items = items.slice();
                    this.refresh();
                },
                e => this._handleLoadingError(e)
            );
    }

    protected abstract loadItems(): Observable<T[]>;

    protected abstract collectionUpdated();

    protected _subscribeOnUpdates(): Subscription {
        return null;
    }

    private _handleLoadingError(e) {
        this._alertService.error(this._getLoadingError());
    }

    protected _getLoadingError() {
        return 'Can\'t loading items';
    }

    private _handleHighlight(data: ITradePanelDataHighlight) {
        if (!data) {
            return;
        }

        this.blinking = data.Data;

        if (this._blinkingTimeout) {
            clearTimeout(this._blinkingTimeout);
            this._blinkingTimeout = null;
        }

        this._blinkingTimeout = setTimeout(() => {
            this.blinking = [];
            this._blinkingTimeout = null;
        }, 1000 * 15);
    }
}
