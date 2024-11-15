import {ChangeDetectionStrategy, Component} from '@angular/core';
import { CurrencyRisk } from 'modules/Trading/models/models';
import {Observable, Subscription, of} from "rxjs";
import { MTItemsComponent } from '../mt-items.component';


@Component({
    selector: 'mt-currency-risk',
    templateUrl: './mt-currency-risk.component.html',
    styleUrls: ['./mt-currency-risk.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MTCurrencyRiskComponent extends MTItemsComponent<CurrencyRisk> {
    protected get _defaultHiddenColumns(): string[] {
        return [];
    }
    
    protected get componentKey(): string {
        return "MTCurrencyRiskComponent";
    }

    public groups: string[] = ["Actual", "Pending"];
    public groupingField: string = "Type";
    public maxRisk: number = 5;

    protected loadItems(): Observable<CurrencyRisk[]> {
       return of(this._mtBroker.currencyRisks);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._mtBroker.onOrdersUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    riskClass(item: CurrencyRisk) {
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
