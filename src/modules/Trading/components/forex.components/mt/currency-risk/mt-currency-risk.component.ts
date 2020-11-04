import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { MTItemsComponent } from '../mt-items.component';
import { MTCurrencyRisk, MTOrder } from 'modules/Trading/models/forex/mt/mt.models';


@Component({
    selector: 'mt-currency-risk',
    templateUrl: './mt-currency-risk.component.html',
    styleUrls: ['./mt-currency-risk.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MTCurrencyRiskComponent extends MTItemsComponent<MTCurrencyRisk> {
    public groups: string[] = ["Actual", "Pending"];
    public groupingField: string = "Type";

    protected loadItems(): Observable<MTCurrencyRisk[]> {
       return of(this._mtBroker.currencyRisks);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._mtBroker.onOrdersParametersUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    riskClass(item: MTCurrencyRisk) {
        if (item.RiskPercentage < 3) {
            return "low-risk";
        }

        if (item.RiskPercentage < 7) {
            return "mid-risk";
        }

        return "high-risk";
    }

    protected ordersUpdated() {
        this.refresh();
    }
}
