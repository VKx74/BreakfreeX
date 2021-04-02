import { Component, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmModalComponent } from "UI";
import { AlertBase } from "../../models/AlertBase";
import { BehaviorSubject, Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { AppState } from "@app/store/reducer";
import { ComponentIdentifier } from "@app/models/app-config";
import { AutoTradingAlertsTranslateService } from "../../localization/token";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { AlertHistory } from 'modules/AutoTradingAlerts/models/AlertHistory';

@Component({
    selector: 'app-alert',
    templateUrl: './app-alert.component.html',
    styleUrls: ['./app-alert.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AutoTradingAlertsTranslateService
        }
    ]
})
export class AppAlertComponent implements OnInit {
    alertsLaunchProcessing: string[] = [];
    $initObs: Observable<any>;
    alerts$: BehaviorSubject<AlertBase[]> = new BehaviorSubject(null);
    filteredAlerts$: BehaviorSubject<AlertBase[]> = new BehaviorSubject(null);
    alertsHistory$: Observable<AlertHistory[]>;
    isInactiveAlertsHidden$ = new BehaviorSubject(false);

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(private _store: Store<AppState>,
        private _dialog: MatDialog,
        private _alertsService: AlertsService,
        private _translateService: TranslateService) {
    }

    ngOnInit() {

    }

    showStartAlertDialog(alert: AlertBase) {
        this._startAlert(alert, true);
    }

    handleAlertLaunchButtonClick(alert: AlertBase) {
        // if (alert.isStarted) {
        //     this._stopAlert(alert);
        // } else {
        //     this.showStartAlertDialog(alert);
        // }
    }

    removeAlert(alert: AlertBase) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get('alertWidget.removeAlert'),
                onConfirm: () => {
                    // this._processAlertAction(this._autoTradingAlertService.deleteAlert(alert.externalId), alert.externalId)
                    //     .subscribe({
                    //         next: () => {
                    //             this._alertService.success(this._translateService.get('alertRemoved'));
                    //         },
                    //         error: (error) => {
                    //             this._alertService.error(this._translateService.get('failedToRemoveAlert'));
                    //             console.log(error);
                    //         }
                    //     });
                }
            }
        });
    }

    handleHideInactiveAlerts(event: any) {
        this.isInactiveAlertsHidden$.next((event.target as HTMLInputElement).checked);
    }

    private _stopAlert(alert: AlertBase) {
        // this._processAlertAction(
        //     this._autoTradingAlertService.stopAlert(alert), alert.externalId
        // ).subscribe({
        //     next: () => {
        //         this._alertService.success(this._translateService.get('alertStopped'));
        //     },
        //     error: (error) => {
        //         this._alertService.error(this._translateService.get('failedToStopAlert'));
        //         console.log(error);
        //     }
        // });
    }

    private _startAlert(alert: AlertBase, onCloud: boolean) {
        // this._processAlertAction(
        //     this._autoTradingAlertService.startAlert(alert, onCloud), alert.externalId
        // ).subscribe({
        //     next: () => {
        //         this._alertService.success(this._translateService.get('alertStarted'));
        //     },
        //     error: (error) => {
        //         this.alertsLaunchProcessing = this.alertsLaunchProcessing.filter(id => id !== alert.externalId);
        //         let message = (error && (typeof (error.error) === 'string') ? error.error : error.statusText);

        //         if (!message || typeof (message) !== 'string') {
        //             message = this._translateService.get('failedToStartAlert');
        //         }

        //         this._alertService.error(message);
        //         console.log(error);
        //     }
        // });
    }

    ngOnDestroy() {

    }

    showAlertDialog() {

    }
}
