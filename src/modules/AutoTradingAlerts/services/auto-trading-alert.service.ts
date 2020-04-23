import {Injectable} from "@angular/core";
import {AlertBase, EAlertState} from "../models/AlertBase";
import {BehaviorSubject, forkJoin, merge, Observable, of, Subject, throwError} from "rxjs";
import {AlertSettings} from "../models/AlertSettingsBase";
import {AlertsFactory} from "../factories/alerts.factory";
import {AlertSourceSettings} from "../models/AlertSourceSettingsBase";
import {AlertCloudRepositoryService} from "./alert-cloud-repository.service";
import {IHealthable} from "@app/interfaces/healthcheck/healthable";
import {AlertFEExecutorService} from "./alert-fe-executor.service";
import {AlertCloudExecutorService} from "./alert-cloud-executor.service";
import {FEAlertBase} from "../models/FEAlertBase";
import {AlertDTO, AlertHistoryDTO, RunningMetadataDTO} from "../models/IAlertCloudRepositoryService";
import {AlertHistory} from "../models/AlertHistory";
import {AlertStateEvtData} from "../models/AlertStateEvtData";
import {catchError, filter, map, mapTo, skip, switchMap, takeUntil, tap} from "rxjs/operators";

@Injectable()
export class AutoTradingAlertService implements IHealthable {
    private _alerts$: BehaviorSubject<AlertBase[]>;
    private _alertsHistory$: BehaviorSubject<AlertHistory[]>;
    private _isHealthy: boolean = true;

    private get alerts(): AlertBase[] {
        return this._alerts$ ? this._alerts$.value : null;
    }

    get isHealthy(): boolean {
        return this._isHealthy;
    }

    public onAlertTriggered: Subject<AlertBase> = new Subject<AlertBase>();
    public onAlertShowPopup: Subject<string> = new Subject<string>();
    public onAlertPlaySound: Subject<string> = new Subject<string>();

    constructor(private _alertFactory: AlertsFactory,
                private _alertRepositoryService: AlertCloudRepositoryService,
                private _alertFEExecutorService: AlertFEExecutorService,
                private _alertCloudExecutorService: AlertCloudExecutorService) {

        this._alertFEExecutorService.onAlertStarted.subscribe(value => {
        });

        this._alertFEExecutorService.onAlertStopped.subscribe(value => {

        });
        this._alertFEExecutorService.onAlertFailed.subscribe(value => {

        });
        this._alertFEExecutorService.onAlertTriggered.subscribe(value => {
            const alert = this._getAlertByName(value);


            this._insertAlertTriggered(alert);
            this.onAlertTriggered.next(alert);
        });
        this._alertFEExecutorService.onAlertShowPopup.subscribe(value => {
            this.onAlertShowPopup.next(value);
        });
        this._alertFEExecutorService.onAlertPlaySound.subscribe(value => {
            this.onAlertPlaySound.next(value);
        });


        this._alertCloudExecutorService.onAlertStarted.subscribe(value => {
            this._handleCloudAlertStarted(value);
        });
        this._alertCloudExecutorService.onAlertStopped.subscribe(value => {
            this._handleCloudAlertStopped(value);
        });
        this._alertCloudExecutorService.onAlertFailed.subscribe(value => {
            this._handleCloudAlertStopped(value);
        });
        this._alertCloudExecutorService.onAlertTriggered.subscribe(value => {
            const alert = this._getAlertByName(value);
            this._insertAlertTriggered(alert);
            this.onAlertTriggered.next(alert);
        });
        this._alertCloudExecutorService.onAlertShowPopup.subscribe(value => {
            this.onAlertShowPopup.next(value);
        });
        this._alertCloudExecutorService.onAlertPlaySound.subscribe(value => {
            this.onAlertPlaySound.next(value);
        });

        this._loadAlertsHistory();
    }

    public getAlertsStream() {
        return new Observable((observer) => {
            const unsubscribe$ = new Subject<any>();

            if (!this._alerts$) {
                this._alerts$ = new BehaviorSubject<AlertBase[]>(null);

                this.loadAlerts()
                    .pipe(
                        takeUntil(unsubscribe$)
                    )
                    .subscribe({
                        next: (v) => this._alerts$.next(v),
                        error: (e) => this._alerts$.error(e)
                    });
            }

            this._alerts$
                .pipe(
                    filter(v => v != null),
                    takeUntil(unsubscribe$)
                )
                .subscribe(observer);

            return () => {
                unsubscribe$.next();
                unsubscribe$.complete();
            };
        });
    }

    public loadAlerts(): Observable<AlertBase[]> {
        return forkJoin(
            this._alertRepositoryService.loadRunningAlerts(),
            this._alertRepositoryService.loadAlerts()
        ).pipe(
            switchMap(([runningAlerts, alerts]: [RunningMetadataDTO[], AlertDTO[]]) => {
                if (alerts.length === 0) {
                    return of([]);
                }

                return forkJoin(
                    alerts.map((alert) => {
                        return this._alertFactory.tryCreateInstance(alert.AlertParameters, alert.DataSource)
                            .pipe(
                                map((createdAlert: AlertBase) => {
                                    const runningData = runningAlerts.find(r => r.scriptName === createdAlert.alertName);

                                    if (runningData) {
                                        createdAlert.setState(EAlertState.Started, runningData.runningId);
                                    }

                                    createdAlert.bindId(alert.InnerId);

                                    return createdAlert;
                                })
                            );
                    })
                );
            })
        );
    }

    public createAlert(settings: AlertSettings, sourceSettings: AlertSourceSettings, index: number = 0): Observable<AlertBase> {
        return this._alertFactory.tryCreateInstance(settings, sourceSettings)
            .pipe(
                switchMap((alert) => {
                    return this._alertRepositoryService.createAlert(alert)
                        .pipe(
                            map((id: string) => {
                                alert.bindId(id);
                                this._createAlert(alert);

                                return alert;
                            })
                        );
                })
            );
    }

    public deleteAlert(id: string): Observable<void> {
        let alert = this._getAlertById(id);

        if (!alert) {
            return throwError('Can`t find alert by id: ' + id);
        }

        let deleteFromRepo = () => {
            return this._alertRepositoryService.deleteAlert(alert.externalId)
                .pipe(tap(() => {
                    this._deleteAlert(alert.externalId);
                }));
        };

        if (alert.isStarted) {
            if (alert.isOnCloud) {
                return this._alertCloudExecutorService.stopAlert(alert)
                    .pipe(switchMap(() => deleteFromRepo()));
            } else {
                return this._alertFEExecutorService.stopAlert(alert as FEAlertBase)
                    .pipe(switchMap(() => deleteFromRepo()));
            }
        } else {
            return deleteFromRepo();
        }
    }

    public updateAlert(id: string, settings: AlertSettings, sourceSettings: AlertSourceSettings): Observable<AlertBase> {
        let alert = this._getAlertById(id);

        if (!alert) {
            return throwError('Failed to find alert by id: ' + id);
        }

        let isStarted = alert.isStarted;
        let isOnCloud = alert.isOnCloud;

        const updateFunction = () => {
            return this._alertFactory.tryCreateInstance(settings, sourceSettings)
                .pipe(
                    switchMap((newAlert) => {
                        newAlert.bindId(alert.externalId);

                        return this._alertRepositoryService.updateAlert(newAlert)
                            .pipe(
                                mapTo(newAlert)
                            );
                    }),
                    switchMap((newAlert) => {
                        this._updateAlert(alert.externalId, newAlert);

                        if (isStarted) {
                            return this.startAlert(newAlert, isOnCloud)
                                .pipe(
                                    mapTo(newAlert),
                                    catchError((e) => {
                                        console.log('failed to start alert', e);

                                        return of(newAlert);
                                    })
                                );
                        } else {
                            return of(newAlert);
                        }
                    })
                );
        };

        if (isStarted) {
            if (isOnCloud) {
                return this._alertCloudExecutorService.stopAlert(alert)
                    .pipe(switchMap(() => updateFunction()));
            } else {
                return this._alertFEExecutorService.stopAlert(alert as FEAlertBase)
                    .pipe(switchMap(() => updateFunction()));
            }
        } else {
            return updateFunction();
        }
    }

    public startAlert(alert: AlertBase, onCloud: boolean = false): Observable<void> {
        if (onCloud) {
            return this._alertCloudExecutorService.startAlert(alert);
        }

        if (alert instanceof FEAlertBase && alert.canRunOnFrontend) {
            return this._alertFEExecutorService.startAlert(alert as FEAlertBase);
        }

        return throwError("Alert not support Frontend end execution");
    }

    public stopAlert(alert: AlertBase): Observable<void> {
        if (alert.isOnCloud) {
            return this._alertCloudExecutorService.stopAlert(alert);
        }

        if (alert instanceof FEAlertBase) {
            return this._alertFEExecutorService.stopAlert(alert as FEAlertBase);
        }

        return throwError("Alert not support Frontend end execution");
    }

    private _deleteAlert(id: string) {
        if (this._alerts$.value != null) {
            this._alerts$.next(
                this._alerts$.value.filter(a => a.externalId !== id)
            );
        }
    }

    private _getAlertById(id: string): AlertBase {
        if (this.alerts == null) {
            return null;
        }

        for (let i = 0; i < this.alerts.length; i++) {
            const alert: AlertBase = this.alerts[i];
            if (alert.externalId === id) {
                return this.alerts[i];
            }
        }
    }

    private _getAlertByName(name: string): AlertBase {
        if (this.alerts == null) {
            return null;
        }

        for (let i = 0; i < this.alerts.length; i++) {
            const alert: AlertBase = this.alerts[i];
            if (alert.alertName === name) {
                return this.alerts[i];
            }
        }
    }

    private _createAlert(alert: AlertBase) {
        if (this._alerts$ && this._alerts$.value != null) {
            this._alerts$.next([...this._alerts$.value, alert]);
        }
    }


    private _updateAlert(id: string, alert: AlertBase) {
        if (this._alerts$ && this._alerts$.value != null) {
            this._alerts$.next(this._alerts$.value.map(a => a.externalId === id ? alert : a));
        }
    }

    getAlertsHistoryStream(): Observable<AlertHistory[]> {
        return new Observable((observer) => {
            const unsubscribe$ = new Subject<any>();

            if (!this._alertsHistory$) {
                this._alertsHistory$ = new BehaviorSubject<AlertHistory[]>(null);

                this._loadAlertsHistory()
                    .subscribe({
                        next: (alertsHistory: AlertHistory[]) => {
                            this._alertsHistory$.next(alertsHistory);
                        },
                        error: (error) => {
                            this._alertsHistory$.error(error);
                        }
                    });
            }

            this._alertsHistory$
                .pipe(
                    filter(v => v != null),
                    takeUntil(unsubscribe$)
                )
                .subscribe(observer);

            return () => {
                unsubscribe$.next();
                unsubscribe$.complete();
            };
        });
    }

    private _loadAlertsHistory(): Observable<AlertHistory[]> {
        return this._alertRepositoryService.loadAlertsHistory()
            .pipe(
                map((alertsHistory: AlertHistoryDTO[]) => {
                    return alertsHistory.sort((a, b) => {
                        return b.Time - a.Time;
                    }) as AlertHistory[];
                })
            );
    }

    private _insertAlertTriggered(alert: AlertBase) {
        if (this._alertsHistory$ && this._alertsHistory$.value != null) {
            this._alertsHistory$.next([{
                Description: alert.getDescription(),
                Comment: alert.comment,
                Time: new Date().getTime()
            }, ...this._alertsHistory$.value.slice(0, this._alertsHistory$.value.length - 1)]);
        }
    }

    private _handleCloudAlertStarted(eventData: AlertStateEvtData) {
        let alert: AlertBase = this._getAlertByName(eventData.alertName);

        if (!alert || alert.isStarted) {
            return;
        }

        alert.seCloudExecution();
        alert.setState(EAlertState.Started, eventData.runningId);
    }

    private _handleCloudAlertStopped(eventData: AlertStateEvtData) {
        let alert: AlertBase = this._getAlertByName(eventData.alertName);

        if (!alert || !alert.isStarted) {
            return;
        }

        alert.setState(EAlertState.Stopped);
    }
}
