import {ChangeDetectorRef, Component} from '@angular/core';
import {IBacktestResultDTO, IOrder, ISignal, OrderAction} from "../../data/api.models";
import {IBacktestResultOverviewComponent} from "../backtest-result-overview/backtest-result-overview.component";
import {JsUtil} from "../../../../utils/jsUtil";
import {ColumnSortDataAccessor} from "../../../datatable/components/data-table/data-table.component";

interface IExtendOrder extends IOrder {
    index?: number;
}

@Component({
    selector: 'backtest-orders',
    templateUrl: './backtest-orders.component.html',
    styleUrls: ['./backtest-orders.component.scss']
})
export class BacktestOrdersComponent implements IBacktestResultOverviewComponent {
    public result: IBacktestResultDTO;
    public records: IExtendOrder[]  = [];
    OrderAction = OrderAction;

    constructor(private _cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
    }

    symbolDataAccessor: ColumnSortDataAccessor = (item: ISignal) => {
        return item.instrument.symbol;
    }

    public showBackTestResult(result: IBacktestResultDTO): void {
        this.result = result;
        this.records = [];

        if (result && result.orders) {
            let records = JsUtil.mapOfArraysToArray<IExtendOrder>(result.orders);
            records.forEach((record, i) => record.index = ++i);
            this.records = records;
        }

        this._cdr.detectChanges();
    }
}
