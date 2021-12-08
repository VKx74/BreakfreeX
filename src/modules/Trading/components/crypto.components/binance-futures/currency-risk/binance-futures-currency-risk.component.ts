import {ChangeDetectionStrategy, Component} from '@angular/core';
import { CoinRisk } from 'modules/Trading/models/crypto/binance/binance.models';
import {Observable, Subscription, of} from "rxjs";
import { BinanceFuturesItemsComponent } from '../binance-futures-items.component';


@Component({
    selector: 'binance-futures-currency-risk',
    templateUrl: './binance-futures-currency-risk.component.html',
    styleUrls: ['./binance-futures-currency-risk.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceFuturesCurrencyRiskComponent extends BinanceFuturesItemsComponent<CoinRisk> {
    protected get _defaultHiddenColumns(): string[] {
        return [];
    }
    
    protected get componentKey(): string {
        return "BinanceFuturesCurrencyRiskComponent";
    }

    public groups: string[] = ["Actual", "Pending"];
    public groupingField: string = "Type";
    public maxRisk: number = 5;

    protected loadItems(): Observable<CoinRisk[]> {
       return of(this._binanceBroker.coinRisks);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._binanceBroker.onRisksUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    riskClass(item: CoinRisk) {
        if (item.RiskPercentage < 3.5) {
            return "low-risk";
        }

        if (item.RiskPercentage < this.maxRisk) {
            return "mid-risk";
        }

        return "high-risk";
    }

    protected collectionUpdated() {
        this.updateItems();
    }
}
