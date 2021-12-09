import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { BaseLayoutItem } from '@layout/base-layout-item';
import { BinanceScannerService } from 'modules/BreakfreeTrading/services/binance.scanner/binance.scanner.service';
import { ITickerStatistic } from 'modules/BreakfreeTrading/models/binance.scanner/models';

enum SortingType {
    Gainers,
    Losers
}

interface TickerStatistic {
    Symbol: string;
    UpdateTime: number;

    // Price change
    Last1PC: number;
    Last2PC: number;
    Last3PC: number;
    Last5PC: number;

    // Volume change
    Last1VC: number;
    Last2VC: number;
    Last3VC: number;
    Last5VC: number;

    // Trade Count change
    Last1TC: number;
    Last2TC: number;
    Last3TC: number;
    Last5TC: number;

    // Price volatility change
    Last1PV: number;
    Last2PV: number;
    Last3PV: number;
    Last5PV: number;

    // Buy Volume change
    Last1BVC: number;
    Last2BVC: number;
    Last3BVC: number;
    Last5BVC: number;

    // Sell Volume change
    Last1SVC: number;
    Last2SVC: number;
    Last3SVC: number;
    Last5SVC: number;

    // Cumulative Buy Volume
    Last1CumBV: number;
    Last2CumBV: number;
    Last3CumBV: number;
    Last5CumBV: number;

    // Cumulative Sell Volume
    Last1CumSV: number;
    Last2CumSV: number;
    Last3CumSV: number;
    Last5CumSV: number;
}

@Component({
    selector: 'binance-scanner',
    templateUrl: './BinanceScanner.component.html',
    styleUrls: ['./BinanceScanner.component.scss']
})
export class BinanceScannerComponent extends BaseLayoutItem {
    static componentName = 'BinanceScanner';

    private _onUpdateSubscription: Subscription;

    searchText: string;

    sortingType: SortingType = SortingType.Gainers;

    data: TickerStatistic[] = [];

    SortingType = SortingType;

    get componentId(): string {
        return BinanceScannerComponent.componentName;
    }  
    
    get top100(): TickerStatistic[] {
        return this.data.slice(0, 100);
    }
    
    constructor(protected _binanceScannerService: BinanceScannerService) {
        super();
        this._onUpdateSubscription = this._binanceScannerService.onUpdate.subscribe(() => {
            this.statisticUpdated();
        });
    }

    ngOnInit() {
        this.initialized.next(this);
        this._binanceScannerService.open();
    }

    getComponentState(): any {
        return null;
    }

    ngOnDestroy() {
        this.beforeDestroy.next(this);
        this._onUpdateSubscription.unsubscribe();
        this._binanceScannerService.close();
    }

    getState() {
        return null;
    }

    setState(state: any) {
    }

    search() {
        this.fillResults();
    }

    searchTextInput(data: KeyboardEvent) {
        if (data.code === "Enter" && !data.shiftKey) {
            this.fillResults();
        }
    }

    searchIconClick() {
        this.fillResults();
    }

    showDetails(item: TickerStatistic) {

    }

    setSorting(type: SortingType) {
        this.sortingType = type;
        this.sort();
    }

    protected statisticUpdated() {
        if (!this.data || !this.data.length) {
            this.fillResults();
            return;
        }

        let items = this._binanceScannerService.statistics;

        for (const i of this.data) {
            let item = items[i.Symbol];
            if (item) {
                this.updateVM(i, item);
            }
        }

        this.sort();
    }

    protected fillResults() {
        this.data = [];
        
        let items = this._binanceScannerService.statistics;

        for (const key in items) {
            if (this.searchText && key.includes(this.searchText.toUpperCase())) {
                continue;
            }

            let item = items[key];
            this.data.push(this.mapToVM(item));
        }

        this.sort();
    }

    protected mapToVM(item: ITickerStatistic): TickerStatistic {
        return {
            Symbol: item.S,
            UpdateTime: item.UT,

            Last1PC: Math.roundToDecimals((item.L1PC * 100), 1),
            Last2PC: Math.roundToDecimals((item.L2PC * 100), 1),
            Last3PC: Math.roundToDecimals((item.L3PC * 100), 1),
            Last5PC: Math.roundToDecimals((item.L5PC * 100), 1),

            Last1VC: Math.roundToDecimals((item.L1VC * 100), 1),
            Last2VC: Math.roundToDecimals((item.L2VC * 100), 1),
            Last3VC: Math.roundToDecimals((item.L3VC * 100), 1),
            Last5VC: Math.roundToDecimals((item.L5VC * 100), 1),

            Last1TC: Math.roundToDecimals((item.L1TC * 100), 1),
            Last2TC: Math.roundToDecimals((item.L1TC * 100), 1),
            Last3TC: Math.roundToDecimals((item.L1TC * 100), 1),
            Last5TC: Math.roundToDecimals((item.L1TC * 100), 1),

            Last1PV: Math.roundToDecimals((item.L1PV * 100), 1),
            Last2PV: Math.roundToDecimals((item.L2PV * 100), 1),
            Last3PV: Math.roundToDecimals((item.L3PV * 100), 1),
            Last5PV: Math.roundToDecimals((item.L5PV * 100), 1),

            Last1BVC: Math.roundToDecimals((item.L1BVC * 100), 1),
            Last2BVC: Math.roundToDecimals((item.L2BVC * 100), 1),
            Last3BVC: Math.roundToDecimals((item.L3BVC * 100), 1),
            Last5BVC: Math.roundToDecimals((item.L5BVC * 100), 1),

            Last1SVC: Math.roundToDecimals((item.L1SVC * 100), 1),
            Last2SVC: Math.roundToDecimals((item.L2SVC * 100), 1),
            Last3SVC: Math.roundToDecimals((item.L3SVC * 100), 1),
            Last5SVC: Math.roundToDecimals((item.L5SVC * 100), 1),

            Last1CumBV: Math.roundToDecimals((item.L1CumBV * 100), 1),
            Last2CumBV: Math.roundToDecimals((item.L2CumBV * 100), 1),
            Last3CumBV: Math.roundToDecimals((item.L3CumBV * 100), 1),
            Last5CumBV: Math.roundToDecimals((item.L5CumBV * 100), 1),

            Last1CumSV: Math.roundToDecimals((item.L1CumSV * 100), 1),
            Last2CumSV: Math.roundToDecimals((item.L2CumSV * 100), 1),
            Last3CumSV: Math.roundToDecimals((item.L3CumSV * 100), 1),
            Last5CumSV: Math.roundToDecimals((item.L5CumSV * 100), 1),
        };
    }
    
    protected updateVM(item: TickerStatistic, statistic: ITickerStatistic) {
        item.Symbol = statistic.S;
        item.UpdateTime = statistic.UT;

        item.Last1PC = Math.roundToDecimals((statistic.L1PC * 100), 1);
        item.Last2PC = Math.roundToDecimals((statistic.L2PC * 100), 1);
        item.Last3PC = Math.roundToDecimals((statistic.L3PC * 100), 1);
        item.Last5PC = Math.roundToDecimals((statistic.L5PC * 100), 1);

        item.Last1VC = Math.roundToDecimals((statistic.L1VC * 100), 1);
        item.Last2VC = Math.roundToDecimals((statistic.L2VC * 100), 1);
        item.Last3VC = Math.roundToDecimals((statistic.L3VC * 100), 1);
        item.Last5VC = Math.roundToDecimals((statistic.L5VC * 100), 1);

        item.Last1TC = Math.roundToDecimals((statistic.L1TC * 100), 1);
        item.Last2TC = Math.roundToDecimals((statistic.L1TC * 100), 1);
        item.Last3TC = Math.roundToDecimals((statistic.L1TC * 100), 1);
        item.Last5TC = Math.roundToDecimals((statistic.L1TC * 100), 1);

        item.Last1PV = Math.roundToDecimals((statistic.L1PV * 100), 1);
        item.Last2PV = Math.roundToDecimals((statistic.L2PV * 100), 1);
        item.Last3PV = Math.roundToDecimals((statistic.L3PV * 100), 1);
        item.Last5PV = Math.roundToDecimals((statistic.L5PV * 100), 1);

        item.Last1BVC = Math.roundToDecimals((statistic.L1BVC * 100), 1);
        item.Last2BVC = Math.roundToDecimals((statistic.L2BVC * 100), 1);
        item.Last3BVC = Math.roundToDecimals((statistic.L3BVC * 100), 1);
        item.Last5BVC = Math.roundToDecimals((statistic.L5BVC * 100), 1);

        item.Last1SVC = Math.roundToDecimals((statistic.L1SVC * 100), 1);
        item.Last2SVC = Math.roundToDecimals((statistic.L2SVC * 100), 1);
        item.Last3SVC = Math.roundToDecimals((statistic.L3SVC * 100), 1);
        item.Last5SVC = Math.roundToDecimals((statistic.L5SVC * 100), 1);

        item.Last1CumBV = Math.roundToDecimals((statistic.L1CumBV * 100), 1);
        item.Last2CumBV = Math.roundToDecimals((statistic.L2CumBV * 100), 1);
        item.Last3CumBV = Math.roundToDecimals((statistic.L3CumBV * 100), 1);
        item.Last5CumBV = Math.roundToDecimals((statistic.L5CumBV * 100), 1);

        item.Last1CumSV = Math.roundToDecimals((statistic.L1CumSV * 100), 1);
        item.Last2CumSV = Math.roundToDecimals((statistic.L2CumSV * 100), 1);
        item.Last3CumSV = Math.roundToDecimals((statistic.L3CumSV * 100), 1);
        item.Last5CumSV = Math.roundToDecimals((statistic.L5CumSV * 100), 1);
    }

    protected sort() {
        if (this.sortingType === SortingType.Gainers) {
            this.data.sort((a, b) => this.getTickerStatisticIndex(b) - this.getTickerStatisticIndex(a));
        } else {
            this.data.sort((a, b) => this.getTickerStatisticIndex(a) - this.getTickerStatisticIndex(b));
        }
    }

    protected getTickerStatisticIndex(item: TickerStatistic): number {
        let index = item.Last1PC;
        index += item.Last2PC;
        index += item.Last3PC;
        index += item.Last5PC;

        index += item.Last1VC;
        index += item.Last2VC;
        index += item.Last3VC;
        index += item.Last5VC;

        index += item.Last1TC;
        index += item.Last2TC;
        index += item.Last3TC;
        index += item.Last5TC;

        index += item.Last1PV;
        index += item.Last2PV;
        index += item.Last3PV;
        index += item.Last5PV;

        return index;
    }

    protected useLinker(): boolean { 
        return true;
    }
}