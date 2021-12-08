import {ChangeDetectionStrategy, Component} from '@angular/core';
import { CoinRisk } from 'modules/Trading/models/crypto/binance/binance.models';
import {Observable, Subscription, of} from "rxjs";
import { BinanceItemsComponent } from '../binance-items.component';


@Component({
    selector: 'binance-currency-risk',
    templateUrl: './binance-currency-risk.component.html',
    styleUrls: ['./binance-currency-risk.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceCurrencyRiskComponent extends BinanceItemsComponent<CoinRisk> {
    protected get componentKey(): string {
        return "BinanceCurrencyRiskComponent";
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
