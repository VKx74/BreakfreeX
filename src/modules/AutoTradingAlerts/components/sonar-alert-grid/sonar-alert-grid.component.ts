import { Component, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { SonarAlert } from "../../models/AlertBase";
import { Observable } from "rxjs";
import { ComponentIdentifier } from "@app/models/app-config";
import { AutoTradingAlertsTranslateService } from "../../localization/token";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { AlertType } from 'modules/AutoTradingAlerts/models/EnumsDTO';
import { AlertService } from '@alert/services/alert.service';
import { AlertGridBase } from '../alert-grid-base/alert-grid-base';

@Component({
    selector: 'sonar-alert-grid',
    templateUrl: './sonar-alert-grid.component.html',
    styleUrls: ['./sonar-alert-grid.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AutoTradingAlertsTranslateService
        }
    ]
})
export class SonarAlertGridComponent extends AlertGridBase {
    get alerts(): SonarAlert[] {
        return this._alertsService.Alerts.filter(_ => _.type === AlertType.SonarAlert) as SonarAlert[];
    }

    constructor (protected _dialog: MatDialog,
        protected _alertsService: AlertsService,
        protected _alertService: AlertService,
        protected _translateService: TranslateService) {
            super(_dialog, _alertsService, _alertService, _translateService);
    }

    getTimeframeTitle(sonarAlert: SonarAlert): Observable<string> {
        return this._translateService.get(`timeFrameToStr.${sonarAlert.timeframe}`);
    }

    getTriggerTitle(sonarAlert: SonarAlert): Observable<string> {
        return this._translateService.get(`triggerSetupStr.${sonarAlert.triggerType}`);
    }
}
