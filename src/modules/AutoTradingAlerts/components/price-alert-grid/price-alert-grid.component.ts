import { Component } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { PriceAlert } from "../../models/AlertBase";
import { Observable } from "rxjs";
import { AutoTradingAlertsTranslateService } from "../../localization/token";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { AlertType } from 'modules/AutoTradingAlerts/models/EnumsDTO';
import { AlertService } from '@alert/services/alert.service';
import { AlertGridBase } from '../alert-grid-base/alert-grid-base';

@Component({
    selector: 'price-alert-grid',
    templateUrl: './price-alert-grid.component.html',
    styleUrls: ['./price-alert-grid.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AutoTradingAlertsTranslateService
        }
    ]
})
export class PriceAlertGridComponent extends AlertGridBase {
    get alerts(): PriceAlert[] {
        return this._alertsService.Alerts.filter(_ => _.type === AlertType.PriceAlert) as PriceAlert[];
    }

    constructor (protected _dialog: MatDialog,
        protected _alertsService: AlertsService,
        protected _alertService: AlertService,
        protected _translateService: TranslateService) {
            super(_dialog, _alertsService, _alertService, _translateService);
    }

    getConditionTitle(priceAlert: PriceAlert): Observable<string> {
        return this._translateService.get(`conditionTitles.${priceAlert.condition}`);
    }
}
