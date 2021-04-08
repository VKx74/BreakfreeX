import { Component, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmModalComponent } from "UI";
import { AlertBase, PriceAlert } from "../../models/AlertBase";
import { Observable } from "rxjs";
import { ComponentIdentifier } from "@app/models/app-config";
import { AutoTradingAlertsTranslateService } from "../../localization/token";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { AlertStatus, AlertType } from 'modules/AutoTradingAlerts/models/EnumsDTO';
import { AlertService } from '@alert/services/alert.service';
import { PriceAlertDialogComponent } from '../price-alert-dialog/price-alert-dialog.component';

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
export class PriceAlertGridComponent implements OnInit {
    AlertStatus = AlertStatus;

    get alerts(): PriceAlert[] {
        return this._alertsService.Alerts.filter(_ => _.type === AlertType.PriceAlert) as PriceAlert[];
    }

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor (private _dialog: MatDialog,
        private _alertsService: AlertsService,
        private _alertService: AlertService,
        private _translateService: TranslateService) {
        this._alertsService.init();
    }

    ngOnInit() {

    }

    ngOnDestroy() {

    }

    handleEdit(alert: AlertBase) {
        this._dialog.open(PriceAlertDialogComponent, {
            data: { alert: alert }
        });
    }

    handleLaunch(alert: AlertBase) {
        if (alert.status === AlertStatus.Running) {
            this._stopAlert(alert);
        } else {
            this._startAlert(alert);
        }
    }

    handleRemove(alert: AlertBase) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get('alertWidget.removeAlert'),
                onConfirm: () => {
                    this._alertsService.deleteAlert(alert.id).subscribe(() => {
                        this._alertService.success(this._translateService.get('alertRemoved'));
                    }, (error) => {
                        this._alertService.error(this._translateService.get('failedToRemoveAlert'));
                        console.log(error);
                    });
                }
            }
        });
    }

    private _stopAlert(alert: AlertBase) {
        this._alertsService.stopAlert(alert.id).subscribe(() => {
            this._alertService.success(this._translateService.get('alertStopped'));
        }, (error) => {
            this._alertService.error(this._translateService.get('failedToStopAlert'));
            console.log(error);
        });
    }

    private _startAlert(alert: AlertBase) {
        this._alertsService.startAlert(alert.id).subscribe(() => {
            this._alertService.success(this._translateService.get('alertStarted'));
        }, (error) => {
            this._alertService.error(this._translateService.get('failedToStartAlert'));
            console.log(error);
        });
    }

    getConditionTitle(priceAlert: PriceAlert): Observable<string> {
        return this._translateService.get(`conditionTitles.${priceAlert.condition}`);
    }
}
