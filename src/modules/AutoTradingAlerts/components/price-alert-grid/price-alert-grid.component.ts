import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { PriceAlert } from "../../models/AlertBase";
import { Observable, of, Subscription } from "rxjs";
import { AutoTradingAlertsTranslateService } from "../../localization/token";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { AlertType } from 'modules/AutoTradingAlerts/models/EnumsDTO';
import { AlertService } from '@alert/services/alert.service';
import { AlertGridBase } from '../alert-grid-base/alert-grid-base';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'price-alert-grid',
    templateUrl: './price-alert-grid.component.html',
    styleUrls: ['./price-alert-grid.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AutoTradingAlertsTranslateService
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceAlertGridComponent extends AlertGridBase<PriceAlert> {

    constructor (protected _dialog: MatDialog,
        protected _alertsService: AlertsService,
        protected _alertService: AlertService,
        @Inject(AutoTradingAlertsTranslateService) protected _translateService: TranslateService,
        protected _cdr: ChangeDetectorRef) {
            super(_dialog, _alertsService, _alertService, _translateService, _cdr);
    }

    getConditionTitle(priceAlert: PriceAlert): Observable<string> {
        return this._translateService.get(`conditionTitles.${priceAlert.condition}`);
    }

    protected loadItems(): Observable<PriceAlert[]> {
        return of(this._alertsService.Alerts.filter(_ => _.type === AlertType.PriceAlert) as PriceAlert[]);
    }
 
     protected _subscribeOnUpdates(): Subscription {
         return this._alertsService.onAlertsChanged.subscribe(() => {
             this.updateItems();
         });
    }
}
