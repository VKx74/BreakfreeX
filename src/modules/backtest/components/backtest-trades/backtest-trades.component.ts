import {ChangeDetectorRef, Component} from '@angular/core';
import {IBacktestResultDTO, ISignal, OrderAction} from "../../data/api.models";
import {JsUtil} from "../../../../utils/jsUtil";
import {IBacktestResultOverviewComponent} from "../backtest-result-overview/backtest-result-overview.component";
import {ColumnSortDataAccessor} from "../../../datatable/components/data-table/data-table.component";

interface IExtendSignal extends ISignal {
    index?: number;
}

@Component({
    selector: 'backtest-trades',
    templateUrl: './backtest-trades.component.html',
    styleUrls: ['./backtest-trades.component.scss']
})
export class BacktestTradesComponent implements IBacktestResultOverviewComponent {
    public result: IBacktestResultDTO;
    public records: IExtendSignal[] = [];

    OrderAction = OrderAction;

    constructor(private _cdr: ChangeDetectorRef) {
    }

    public ngOnInit() {
    }

    public resultLoading(): void {
    }

    public showBackTestResult(result: IBacktestResultDTO): void {
        this.result = result;
        this.records = [];

        if (result && result.signals) {
            let records = JsUtil.mapOfArraysToArray<IExtendSignal>(result.signals);
            records.forEach((record, i) => record.index = ++i);
            this.records = records;
        }

        this._cdr.detectChanges();
    }

    symbolDataAccessor: ColumnSortDataAccessor = (item: ISignal) => {
        return item.instrument.symbol;
    }

    roundNumber(value: number): number {
        return JsUtil.roundNumber(value, 8);
    }
}
