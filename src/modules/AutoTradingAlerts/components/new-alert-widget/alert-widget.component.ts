import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmModalComponent} from "UI";
import {AutoTradingAlertService} from "../../services/auto-trading-alert.service";
import {AlertBase, EAlertState} from "../../models/AlertBase";
import {AlertHistory} from "../../models/AlertHistory";
import {AlertService} from "@alert/services/alert.service";
import {BehaviorSubject, combineLatest, forkJoin, merge, Observable, of} from "rxjs";
import {AutoTradingAlertConfigurationService} from 'modules/AutoTradingAlerts/services/auto-trading-alert-configuration.service';
import {StartAlertComponent} from "../start-alert/start-alert.component";
import {AlertCloudRepositoryService} from "../../services/alert-cloud-repository.service";
import {Store} from "@ngrx/store";
import {ShowCodeAction} from "@platform/store/actions/platform.actions";
import {AppState} from "@app/store/reducer";
import {ComponentIdentifier} from "@app/models/app-config";
import {map, mapTo, switchMap, takeUntil, tap} from "rxjs/operators";
import {switchmap} from "@decorators/switchmap";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {AutoTradingAlertsTranslateService} from "../../localization/token";
import {ModalAlertCodeComponent} from "../modal-alert-code/modal-alert-code.component";

@Component({
    selector: 'app-alert-widget',
    templateUrl: './alert-widget.component.html',
    styleUrls: ['./alert-widget.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AutoTradingAlertsTranslateService
        }
    ]
})
export class AlertWidgetComponent implements OnInit {
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
                private _autoTradingAlertService: AutoTradingAlertService,
                private _alertRepository: AlertCloudRepositoryService,
                private _autoTradingAlertConfigurationService: AutoTradingAlertConfigurationService,
                private _alertService: AlertService,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        const alerts$ = this._autoTradingAlertService.getAlertsStream();
        const alertsHistory$ = this._autoTradingAlertService.getAlertsHistoryStream();

        this.$initObs = combineLatest(
            alerts$,
            alertsHistory$
        );

        combineLatest(
            merge(
                alerts$,
                alerts$.pipe(
                    switchMap((alerts: AlertBase[]) => {
                        return merge(
                            ...alerts.map(a => a.updated$
                                .pipe(mapTo(alerts))
                            )
                        );
                    })
                )
            ),
            this.isInactiveAlertsHidden$
        )
            .pipe(
                map(([alerts, hideInactive]: [AlertBase[], boolean]) => {
                    if (!hideInactive) {
                        return alerts;
                    }

                    return alerts.filter(a => a.state !== EAlertState.Stopped);
                }),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(this.filteredAlerts$);

        alerts$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(this.alerts$);

        this.alertsHistory$ = alertsHistory$;
    }

    showAlertDialog(alert?: AlertBase) {
        if (alert) {
            this._autoTradingAlertConfigurationService.editAlert(alert);
        } else {
            this._autoTradingAlertConfigurationService.createDefaultPriceAlert();
        }
    }
    @switchmap()
    showAlertCode(alert: AlertBase) {
        return this._alertRepository.getAlertCode(alert.externalId)
            .subscribe((code: string) => {
                this._store.dispatch(new ShowCodeAction(code));
                return this._dialog.open(ModalAlertCodeComponent);
            });
    }

    showStartAlertDialog(alert: AlertBase) {
        if (!alert.canRunOnFrontend) {
            this._startAlert(alert, true);
            return;
        }

        this._dialog.open(StartAlertComponent, {
            data: {
                onConfirm: this._startAlert.bind(this, alert)
            }
        });
    }

    handleAlertLaunchButtonClick(alert: AlertBase) {
        if (alert.isStarted) {
            this._stopAlert(alert);
        } else {
            this.showStartAlertDialog(alert);
        }
    }

    removeAlert(alert: AlertBase) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get('alertWidget.removeAlert'),
                onConfirm: () => {
                    this._processAlertAction(this._autoTradingAlertService.deleteAlert(alert.externalId), alert.externalId)
                        .subscribe({
                            next: () => {
                                this._alertService.success(this._translateService.get('alertRemoved'));
                            },
                            error: (error) => {
                                this._alertService.error(this._translateService.get('failedToRemoveAlert'));
                                console.log(error);
                            }
                        });
                }
            }
        });
    }

    restartAllInactive() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get('alertWidget.restartAllInactiveQuestion'),
                onConfirm: () => {
                    this._restartAll();
                }
            }
        });
    }

    stopAll() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get('alertWidget.stopAllQuestion'),
                onConfirm: () => {
                    this._stopAll();
                }
            }
        });
    }

    deleteAllInactive() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get('alertWidget.deleteAllInactiveQuestion'),
                onConfirm: () => {
                    this._deleteAllInactive();
                }
            }
        });
    }

    handleHideInactiveAlerts(event: any) {
        this.isInactiveAlertsHidden$.next((event.target as HTMLInputElement).checked);
    }

    private _stopAlert(alert: AlertBase) {
        this._processAlertAction(
            this._autoTradingAlertService.stopAlert(alert), alert.externalId
        ).subscribe({
            next: () => {
                this._alertService.success(this._translateService.get('alertStopped'));
            },
            error: (error) => {
                this._alertService.error(this._translateService.get('failedToStopAlert'));
                console.log(error);
            }
        });
    }

    private _startAlert(alert: AlertBase, onCloud: boolean) {
        this._processAlertAction(
            this._autoTradingAlertService.startAlert(alert, onCloud), alert.externalId
        ).subscribe({
            next: () => {
                this._alertService.success(this._translateService.get('alertStarted'));
            },
            error: (error) => {
                this.alertsLaunchProcessing = this.alertsLaunchProcessing.filter(id => id !== alert.externalId);
                let message = (error && (typeof (error.error) === 'string') ? error.error : error.statusText);

                if (!message || typeof (message) !== 'string') {
                    message = this._translateService.get('failedToStartAlert');
                }

                this._alertService.error(message);
                console.log(error);
            }
        });
    }

    private _restartAll() {
        const alerts = this.alerts$.getValue();
        const inactiveAlerts = alerts ? alerts.filter(a => !a.isStarted) : [];

        if (inactiveAlerts.length) {
            forkJoin(
                inactiveAlerts.map((a) => {
                    return this._processAlertAction(this._autoTradingAlertService.startAlert(a), a.externalId);
                })
            )
                .subscribe({
                    next: () => {
                        this._alertService.success(this._translateService.get('alertsRestarted'));
                    },
                    error: (error) => {
                        this._alertService.error(this._translateService.get('failedToRestartAlerts'));
                        console.log(error);
                    }
                });
        }
    }

    private _stopAll() {
        const alerts = this.alerts$.getValue();

        if (alerts && alerts.length) {
            forkJoin(alerts.filter(a => a.isStarted).map((a) => {
                return this._processAlertAction(this._autoTradingAlertService.stopAlert(a), a.externalId);
            }))
                .subscribe({
                    next: () => {
                        this._alertService.success(this._translateService.get('alertsStopped'));
                    },
                    error: (errors) => {
                        this._alertService.error(this._translateService.get('failedToStopAlerts'));
                        console.log(errors);
                    }
                });
        }
    }

    private _deleteAllInactive() {
        const alerts = this.alerts$.getValue();
        const inactiveAlerts = alerts ? alerts.filter(a => !a.isStarted) : [];

        if (inactiveAlerts.length) {
            forkJoin(
                inactiveAlerts
                    .map((a) => {
                        return this._processAlertAction(this._autoTradingAlertService.deleteAlert(a.externalId), a.externalId);
                    })
            )
                .subscribe(values => {
                    this._alertService.success(this._translateService.get('alertsRemoved'));
                }, errors => {
                    this._alertService.error(this._translateService.get('failedToRemoveAlerts'));
                    console.log(errors);
                });
        }
    }

    private _processAlertAction(action: Observable<any>, alertId: string): Observable<any> {
        this.alertsLaunchProcessing.push(alertId);

        return action
            .pipe(
                tap({
                    next: () => {
                        this.alertsLaunchProcessing = this.alertsLaunchProcessing.filter(item => item !== alertId);
                    },
                    error: () => {
                        this.alertsLaunchProcessing = this.alertsLaunchProcessing.filter(item => item !== alertId);
                    }
                })
            );
    }

    ngOnDestroy() {

    }
}
