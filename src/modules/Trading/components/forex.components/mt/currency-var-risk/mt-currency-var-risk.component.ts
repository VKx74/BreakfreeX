import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { MTItemsComponent } from '../mt-items.component';
import { MTCurrencyRisk, MTCurrencyVarRisk, MTOrder } from 'modules/Trading/models/forex/mt/mt.models';


@Component({
    selector: 'mt-currency-var-risk',
    templateUrl: './mt-currency-var-risk.component.html',
    styleUrls: ['./mt-currency-var-risk.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MTCurrencyVARRiskComponent extends MTItemsComponent<MTCurrencyVarRisk> {
    public groups: string[] = ["Actual", "Pending"];
    public groupingField: string = "Type";

    protected loadItems(): Observable<MTCurrencyVarRisk[]> {
       return of(this._mtBroker.currencyVARRisks);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._mtBroker.onOrdersUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
    
    protected ordersUpdated() {
        this.updateItems();
    }
}
