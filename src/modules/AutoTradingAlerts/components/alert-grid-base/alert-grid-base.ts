import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmModalComponent } from "UI";
import { AlertBase } from "../../models/AlertBase";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { AlertStatus, AlertType } from 'modules/AutoTradingAlerts/models/EnumsDTO';
import { AlertService } from '@alert/services/alert.service';
import { SonarAlertDialogComponent } from '../sonar-alert-dialog/sonar-alert-dialog.component';
import { PriceAlertDialogComponent } from "../price-alert-dialog/price-alert-dialog.component";

export abstract class AlertGridBase {
    constructor (protected _dialog: MatDialog,
        protected _alertsService: AlertsService,
        protected _alertService: AlertService,
        protected _translateService: TranslateService) {
        this._alertsService.init();
    }

    handleEdit(alert: AlertBase) {
        if (alert.type === AlertType.SonarAlert) {
            this._dialog.open(SonarAlertDialogComponent, {
                data: { alert: alert }
            });
        } else {
            this._dialog.open(PriceAlertDialogComponent, {
                data: { alert: alert }
            });
        }
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

    protected _stopAlert(alert: AlertBase) {
        this._alertsService.stopAlert(alert.id).subscribe(() => {
            this._alertService.success(this._translateService.get('alertStopped'));
        }, (error) => {
            this._alertService.error(this._translateService.get('failedToStopAlert'));
            console.log(error);
        });
    }

    protected _startAlert(alert: AlertBase) {
        this._alertsService.startAlert(alert.id).subscribe(() => {
            this._alertService.success(this._translateService.get('alertStarted'));
        }, (error) => {
            this._alertService.error(this._translateService.get('failedToStartAlert'));
            console.log(error);
        });
    }
}