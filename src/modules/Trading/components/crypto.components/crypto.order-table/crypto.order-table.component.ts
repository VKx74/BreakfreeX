import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {BrokerService} from "@app/services/broker.service";
import {EOrderStatus, ICryptoOrder} from "../../../models/crypto/crypto.models";
import {LocalTimeZone, TimeZoneManager, TzUtils} from "TimeZones";
import {TranslateService} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {AlertService} from "../../../../Alert";
import {DataTableComponent} from "../../../../datatable/components/data-table/data-table.component";
import bind from "bind-decorator";
import {Observable} from "rxjs";

@Component({
    selector: 'crypto-order-table',
    templateUrl: './crypto.order-table.component.html',
    styleUrls: ['./crypto.order-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CryptoOrderTableComponent implements OnInit {
    // readonly ORDER_STATUS_COLUMN_NAME = 'orderStatus';
    @Input() rows: ICryptoOrder[];
    @Output() orderClose = new EventEmitter<ICryptoOrder>();
    @ViewChild(DataTableComponent, {static: false}) dataTable: DataTableComponent;
    template: TemplateRef<any>;
    EOrderStatus = EOrderStatus;

    constructor(private _brokerService: BrokerService,
                private _dialog: MatDialog,
                private _alertService: AlertService,
                private _translateService: TranslateService,
                private _timeZoneManager: TimeZoneManager) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    closeOrder(order: ICryptoOrder) {
        this.orderClose.emit(order);
    }

    getFormattedDate(time: number): string {
        const date = TzUtils.convertDateTz(new Date(time), LocalTimeZone, this._timeZoneManager.timeZone);
        return moment(date).format('MMM DD HH:mm:ss');
    }

    trackByID(index, item: ICryptoOrder) {
        return item.id;
    }

    @bind
    columnCaption(columnName: string): Observable<string> {
        return this._translateService.get(columnName);
    }

    ngOnDestroy() {
    }
}
