import { Injectable } from "@angular/core";
import { Console } from "console";
import { Observable, of, Subject, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { AlertBase, PriceAlert, SonarAlert } from "../models/AlertBase";
import { AlertBaseDTO } from "../models/AlertBaseDTO";
import { AlertHistory } from "../models/AlertHistory";
import { AlertHistoryDTO } from "../models/AlertHistoryDTO";
import { AlertLimits } from "../models/AlertLimits";
import { AlertStatus, AlertType } from "../models/EnumsDTO";
import { NewPriceAlertOptions, NewSonarAlertOptions } from "../models/NewAlertOptions";
import { NotificationLimits } from "../models/NotificationLimits";
import { NotificationLog } from "../models/NotificationLog";
import { NotificationLogDTO } from "../models/NotificationLogDTO";
import { UpdatePriceAlertOptions, UpdateSonarAlertOptions } from "../models/UpdateAlertOptions";
import { AlertConverters } from "./alert.converters";
import { AlertRestClient } from "./alert.rest.client";
import { AlertSocketService } from "./alert.socket.service";
import { IAlertChangedData, IAlertTriggeredData } from "./ws.models/models";

@Injectable()
export class AlertsService {
    private _isInitialized: boolean = false;
    private _timeoutForNotificationsLog: any;
    private _defaultAlertSound: string = "Alert1";
    private _alerts: AlertBase[] = [];
    private _alertHistory: AlertHistory[] = [];
    private _notificationLogs: NotificationLog[] = [];
    private _notificationLimits: NotificationLimits;
    private _alertLimits: AlertLimits;
    private _triggerSubscription: Subscription;
    private _changedSubscription: Subscription;

    public onAlertTriggered: Subject<string> = new Subject<string>();
    public onAlertShowPopup: Subject<string> = new Subject<string>();
    public onAlertPlaySound: Subject<string> = new Subject<string>();
    public onAlertsChanged: Subject<void> = new Subject<void>();
    public onAlertsHistoryChanged: Subject<void> = new Subject<void>();
    public onNotificationLogsChanged: Subject<void> = new Subject<void>();

    public get Alerts(): AlertBase[] {
        return this._alerts;
    }

    public get AlertHistory(): AlertHistory[] {
        return this._alertHistory;
    }

    public get NotificationLogs(): NotificationLog[] {
        return this._notificationLogs;
    }

    public get NotificationLimits(): NotificationLimits {
        return this._notificationLimits;
    }

    public get AlertLimits(): AlertLimits {
        return this._alertLimits;
    }

    constructor(private _alertRestClient: AlertRestClient, private _ws: AlertSocketService) {
    }

    init() {
        if (this._isInitialized) {
            return;
        }

        this._isInitialized = true;

        this.reloadAlerts();
        this.reloadHistory();
        this.reloadNotifications();
        this.reloadLimits();
        this._ws.open().subscribe(() => { });

        this._triggerSubscription = this._ws.alertTriggeredSubject.subscribe(this._handleAlertTriggered.bind(this));
        this._changedSubscription = this._ws.alertChangedSubject.subscribe(this._handleAlertChanged.bind(this));
    }

    createPriceAlert(alert: NewPriceAlertOptions): Observable<PriceAlert> {
        let dto = AlertConverters.NewPriceAlertOptionsToDTO(alert);

        return this._alertRestClient.createPriceAlert(dto).pipe(map((response) => {
            let newAlert = AlertConverters.PriceAlertDTOToAlertBase(response);
            this.addAlert(newAlert);
            return newAlert;
        }));
    }

    createSonarAlert(alert: NewSonarAlertOptions): Observable<SonarAlert> {
        let dto = AlertConverters.NewSonarAlertOptionsToDTO(alert);
        return this._alertRestClient.createSonarAlert(dto).pipe(map((response) => {
            let newAlert = AlertConverters.SonarAlertDTOToAlertBase(response);
            this.addAlert(newAlert);
            return newAlert;
        }));
    }

    deleteAlert(alertId: number): Observable<any> {
        return this._alertRestClient.deleteAlert(alertId).pipe(map(() => {
            this.removeAlert(alertId);
        }));
    }

    loadAlerts(): Observable<AlertBase[]> {
        return this._alertRestClient.loadAlerts().pipe(map((result: AlertBaseDTO[]) => {
            let res: AlertBase[] = [];
            for (let item of result) {
                let converted = AlertConverters.AlertDTOToAlertBase(item);

                if (converted) {
                    res.push(converted);
                }
            }
            return res;
        }));
    }

    loadAlertsHistory(): Observable<AlertHistory[]> {
        return this._alertRestClient.loadAlertsHistory().pipe(map((result: AlertHistoryDTO[]) => {
            let res: AlertHistory[] = [];
            for (let item of result) {
                let converted = AlertConverters.AlertHistoryDTOToAlertHistory(item);

                if (converted) {
                    res.push(converted);
                }
            }
            return res;
        }));
    }

    loadNotificationLog(): Observable<NotificationLog[]> {
        return this._alertRestClient.loadNotificationLog().pipe(map((result: NotificationLogDTO[]) => {
            let res: NotificationLog[] = [];
            for (let item of result) {
                let converted = AlertConverters.NotificationLogDTOToNotificationLog(item);

                if (converted) {
                    res.push(converted);
                }
            }
            return res;
        }));
    }

    getNotificationLimits(): Observable<NotificationLimits> {
        return this._alertRestClient.getNotificationLimits();
    }
    
    getLimits(): Observable<AlertLimits> {
        return this._alertRestClient.getLimits();
    }

    updatePriceAlert(alert: UpdatePriceAlertOptions, alertId: number): Observable<PriceAlert> {
        let dto = AlertConverters.NewPriceAlertOptionsToDTO(alert);
        return this._alertRestClient.updatePriceAlert(dto, alertId).pipe(map((response) => {
            let newAlert = AlertConverters.PriceAlertDTOToAlertBase(response);
            this.update(alertId, newAlert);
            return newAlert;
        }));
    }

    updateSonarAlert(alert: UpdateSonarAlertOptions, alertId: number): Observable<SonarAlert> {
        let dto = AlertConverters.NewSonarAlertOptionsToDTO(alert);
        return this._alertRestClient.updateSonarAlert(dto, alertId).pipe(map((response) => {
            let newAlert = AlertConverters.SonarAlertDTOToAlertBase(response);
            this.update(alertId, newAlert);
            return newAlert;
        }));
    }

    startAlert(alertId: number, alertType: AlertType): Observable<any> {
        console.log(`start alert:${alertId}`);
        return this._alertRestClient.startAlert(alertId, alertType).pipe(map(() => {
            this.changeStatus(alertId, alertType, AlertStatus.Running);
        }));
    }

    startAllAlerts(): Observable<any> {
        return this._alertRestClient.startAllAlerts().pipe(map(() => {
            this.changeStatusAll(AlertStatus.Running);
        }));
    }

    stopAlert(alertId: number, alertType: AlertType): Observable<any> {
        return this._alertRestClient.stopAlert(alertId, alertType).pipe(map(() => {
            this.changeStatus(alertId, alertType, AlertStatus.Stopped);
        }));
    }

    stopAllAlerts(): Observable<any> {
        return this._alertRestClient.stopAllAlerts().pipe(map(() => {
            this.changeStatusAll(AlertStatus.Stopped);
        }));
    }

    canUseSonarAlerts(): boolean {
        return this._alertLimits.canUseSonarAlerts;
    }

    canAddMoreAlerts(): boolean {
        return this.Alerts.length < this._alertLimits.alertsCount;
    }

    canRunMoreAlerts(alertType: AlertType): boolean {
        let priceAlertsCount = this.Alerts.filter(_ => _.type === AlertType.PriceAlert && _.status === AlertStatus.Running).length;
        let sonarAlertsCount = this.Alerts.filter(_ => _.type === AlertType.SonarAlert && _.status === AlertStatus.Running).length;

        if (this._alertLimits.runningAlertsCount <= priceAlertsCount + sonarAlertsCount) {
            return false;
        }

        if (alertType === AlertType.PriceAlert && this._alertLimits.runningPriceAlertsCount <= priceAlertsCount) {
            return false;
        }

        return true;
    }

    dispose(): Observable<void> {
        if (this._triggerSubscription) {
            this._triggerSubscription.unsubscribe();
        }

        if (this._changedSubscription) {
            this._changedSubscription.unsubscribe();
        }

        if (this._timeoutForNotificationsLog) {
            clearTimeout(this._timeoutForNotificationsLog);
            this._timeoutForNotificationsLog = null;
        }

        this._ws.dispose();
        return of();
    }

    private reloadAlerts() {
        this.loadAlerts().subscribe((alerts) => {
            this._alerts = alerts;
            this.onAlertsChanged.next();
        }, (error) => {
            console.error(error);
        });
    }

    private reloadHistory() {
        this.loadAlertsHistory().subscribe((alerts) => {
            this._alertHistory = alerts.sort((a, b) => b.triggerTime  - a.triggerTime);
            this.onAlertsHistoryChanged.next();
        }, (error) => {
            console.error(error);
        });
    }

    private reloadNotifications() {
        this.loadNotificationLog().subscribe((logs) => {
            this._notificationLogs = logs.sort((a, b) => b.time  - a.time);
            this.onNotificationLogsChanged.next();
        }, (error) => {
            console.error(error);
        });  
        
        this.getNotificationLimits().subscribe((limits) => {
            this._notificationLimits = limits;
        }, (error) => {
            console.error(error);
        });
    }

    private reloadLimits() {
        this.getLimits().subscribe((limits) => {
            this._alertLimits = limits;
        });
    }

    private removeAlert(alertId: number) {
        let index = this._alerts.findIndex(alert => alert.id === alertId);

        if (index !== -1) {
            this._alerts.splice(index, 1);
            this.onAlertsChanged.next();
        }
    }

    private addAlert(alert: AlertBase) {
        let index = this._alerts.findIndex(a => a.id === alert.id);
        if (index === -1) {
            this._alerts.push(alert);
            this.onAlertsChanged.next();
        }
    }

    private update(alertId: number, alert: AlertBase) {
        let index = this._alerts.findIndex(a => a.id === alertId);

        if (index !== -1) {
            this._alerts[index] = alert;
            this.onAlertsChanged.next();
        }
    }

    private changeStatus(alertId: number, alertType: AlertType, status: AlertStatus) {       
        let alert = this._alerts.find(a => a.id === alertId && a.type === alertType);
        if (alert) {
            alert.status = status;
            this.onAlertsChanged.next();
        }
    }

    private changeStatusAll(status: AlertStatus) {
        for (let alert of this._alerts) {
            alert.status = status;
            this.onAlertsChanged.next();
        }
    }

    protected _handleAlertTriggered(data: IAlertTriggeredData) {
        this.onAlertShowPopup.next(data.NotificationMessage);
        this.onAlertPlaySound.next(this._defaultAlertSound);

        this.reloadAlerts();
        this.reloadHistory();

        if (!this._timeoutForNotificationsLog) {
            this._timeoutForNotificationsLog = setTimeout(() => {
                this._timeoutForNotificationsLog = null;
                this.reloadNotifications();
            }, 5000);
        }
    }

    protected _handleAlertChanged(data: IAlertChangedData) {
        this.reloadAlerts();
    }
}