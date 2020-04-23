import {Component, Input, OnInit} from '@angular/core';
import {EOrderStatus, ICryptoLoadOrdersAction, ICryptoOrder} from "../../../models/crypto/crypto.models";
import {IInstrument} from "@app/models/common/instrument";
import {Observable, Subject} from "rxjs";
import {JsUtil} from "../../../../../utils/jsUtil";
import {BrokerService} from "@app/services/broker.service";
import {MatDialog} from "@angular/material/dialog";
import {AlertService} from "@alert/services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {LocalTimeZone, TimeZoneManager, TzUtils} from "TimeZones";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {switchMap, takeUntil, tap} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {ConfirmModalComponent} from "UI";
import {EExchange} from "@app/models/common/exchange";

@Component({
    selector: 'orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
    @Input() showInstrumentSearch: boolean = false;

    private _orders: ICryptoOrder[] = [];
    public filteredOrders: ICryptoOrder[] = [];
    private _instrument: IInstrument;
    // CryptoOrdersTableType = CryptoOrdersTableType;

    private _instrumentChange$ = new Subject<IInstrument>();
    private _orderStatusChange$ = new Subject<EOrderStatus>();
    private _selectedOrderStatus: EOrderStatus;

    orderStatuses: EOrderStatus[] = JsUtil.stringEnumToArray(EOrderStatus);

    get EOrderStatus() {
        return EOrderStatus;
    }

    get selectedOrderStatus(): EOrderStatus {
        return this._selectedOrderStatus;
    }

    get openedOrders() {
        return this.filteredOrders.filter(order => order.status === EOrderStatus.Open);
    }

    get closedOrders() {
        return this.filteredOrders.filter(order => order.status !== EOrderStatus.Open);
    }

    constructor(private _brokerService: BrokerService,
                private _dialog: MatDialog,
                private _alertService: AlertService,
                private _translateService: TranslateService,
                private _timeZoneManager: TimeZoneManager) {
        this._selectedOrderStatus = EOrderStatus.Open;
    }

    ngOnInit() {
        const activeBroker: CryptoBroker = this._brokerService.activeBroker as CryptoBroker;

        activeBroker.onOrdersInfoUpdated
            .pipe(
                takeUntil(componentDestroyed(this)),
                switchMap(() => this._loadOrders(this._instrument))
            )
            .subscribe((orders: ICryptoOrder[]) => {
                this._handleLoadedOrders(orders);
            });

        this._orderStatusChange$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe((status: EOrderStatus) => {
                this.filteredOrders = this._filterOrders(this._orders, status);
            });

        this._instrumentChange$
            .pipe(
                takeUntil(componentDestroyed(this)),
                tap(() => this._clearOrders()),
                switchMap((instrument: IInstrument) => this._loadOrders(instrument))
            )
            .subscribe({
                next: (orders: ICryptoOrder[]) => {
                    this._handleLoadedOrders(orders);
                },
                error: (e) => {
                    console.error(e);
                }
            });

        if (!this.showInstrumentSearch) {
            this._loadOrders()
                .subscribe({
                    next: (orders: ICryptoOrder[]) => {
                        this._handleLoadedOrders(orders);
                    },
                    error: (e) => {
                        console.error(e);
                    }
                });
        }
    }

    private _handleLoadedOrders(orders: ICryptoOrder[]) {
        this._orders = orders;
        this.filteredOrders = this._filterOrders(this._orders, this.selectedOrderStatus);
    }

    handleInstrumentSelected(instrument: IInstrument) {
        this._instrument = instrument;
        this._instrumentChange$.next(instrument);
    }

    handleStatusChanged(status: EOrderStatus) {
        this._selectedOrderStatus = status;
        this._orderStatusChange$.next(status);
    }

    statusCaption = (status: EOrderStatus) => {
        return this._translateService.get(`orderStatus${status}`);
    }

    closeOrder(order: ICryptoOrder) {
        const activeBroker = this._brokerService.activeBroker as CryptoBroker;

        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get(`cancelOrderConfirmation`),
                onConfirm: () => {
                    const ord = this.filteredOrders.find(o => o.id === order.id);
                    ord.status = EOrderStatus.Canceled;

                    // TODO: Uncomment
                    // activeBroker.cancelOrder({
                    //     Id: order.id
                    // }).subscribe(value => {
                    //     if (value.result) {
                    //         this._alertService.success(this._translateService.get('tradeManager.orderCanceled'));
                    //         this.filteredOrders = this.filteredOrders.filter(fo => fo.id !== order.id);
                    //     } else {
                    //         this._alertService.error(value.msg);
                    //     }
                    // }, error => {
                    //     this._alertService.error(error.message);
                    // });
                }
            }
        } as any).beforeClosed();
    }

    getFormattedDate(time: number): string {
        const date = TzUtils.convertDateTz(new Date(time), LocalTimeZone, this._timeZoneManager.timeZone);
        return moment(date).format('MMM DD HH:mm:ss');
    }

    trackByID(index, item: ICryptoOrder) {
        return item.id;
    }

    instrumentSearchCallback = (e?: EExchange, s?: string): Observable<IInstrument[]> => {
        return this._brokerService.getInstruments(e, s);
    }

    private _loadOrders(instrument?: IInstrument): Observable<ICryptoOrder[]> {
        const params: ICryptoLoadOrdersAction = instrument ? {symbol: instrument.symbol} : {};

        return (this._brokerService.activeBroker as CryptoBroker).getOrders(params);
    }

    private _filterOrders(orders: ICryptoOrder[], status: EOrderStatus): ICryptoOrder[] {
        return orders.filter((order) => order.status === status);
    }

    private _clearOrders() {
        this._orders = [];
        this.filteredOrders = [];
    }

    ngOnDestroy() {
    }
}
