import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { MTItemsComponent } from '../mt-items.component';
import { MTOrder, MTOrderRecommendation, MTPEndingOrderRecommendation } from 'modules/Trading/models/forex/mt/mt.models';
import { MTHelper } from '@app/services/mt/mt.helper';


@Component({
    selector: 'mt-pending-orders',
    templateUrl: './mt-pending-orders.component.html',
    styleUrls: ['./mt-pending-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MTPendingOrdersComponent extends MTItemsComponent<MTOrder> {

    protected loadItems(): Observable<MTOrder[]> {
       return of(this._mtBroker.pendingOrders);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._mtBroker.onOrdersUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    cancelOrder(selectedItem: MTOrder) {
        if (selectedItem) {
            this.raiseOrderClose(selectedItem);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    trackById(index, item: MTOrder) {
        return item.Id;
    }

    getRecommendationsText(rec: MTPEndingOrderRecommendation) {
        if (rec === undefined) {
            return "Calculating...";
        }
        
        if (!rec) {
            return "No recommendations";
        }

        if (!rec.FailedChecks || !rec.FailedChecks.length) {
            return "Keep this order";
        }

        return rec.FailedChecks[0].Recommendation;
    }
    
    getRecommendationsTooltip(rec: MTPEndingOrderRecommendation) {
        if (!rec) {
            return "";
        }

        let globalTrendPerformance = "";
        let localTrendPerformance = "";
        if (rec.GlobalRTDSpread) {
            globalTrendPerformance = MTHelper.getGlobalTrendPerformanceDescription(rec.GlobalRTDSpread);
        }
        if (rec.LocalRTDSpread) {
            localTrendPerformance = MTHelper.getLocalTrendPerformanceDescription(rec.LocalRTDSpread);
        }
        let desc = "Trend --------------------\n\r";
        desc += `${globalTrendPerformance} Global RTD trend - ${rec.GlobalRTDValue}\n\r`;
        desc += `${localTrendPerformance} Local RTD trend - ${rec.LocalRTDValue}\n\r`;

        if (rec.Timeframe || rec.OrderTradeType) {
            desc += `Setup --------------------\n\r`;

            if (rec.Timeframe) {
                const tfText = MTHelper.toGranularityToTimeframeText(rec.Timeframe);
                desc += `Trade Timeframe - ${tfText}\n\r`;
            }

            if (rec.OrderTradeType) {
                desc += `Trade Setup - ${rec.OrderTradeType}\n\r`;
            }
        } 
        
        if (rec.FailedChecks && rec.FailedChecks.length) {
            desc += `Issues -------------------\n\r`;
            let count = 1;

            for (const item of rec.FailedChecks) {
                desc += `${count}. ${item.Issue}\n\r`;
                count++;
            }
        }

        return desc;

    }

    protected ordersUpdated() {
        this.refresh();
    }
}
