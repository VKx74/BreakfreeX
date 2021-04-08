import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { AlertBase, PriceAlert, SonarAlert } from "../models/AlertBase";
import { AlertBaseDTO } from "../models/AlertBaseDTO";
import { AlertHistory } from "../models/AlertHistory";
import { AlertHistoryDTO } from "../models/AlertHistoryDTO";
import { AlertStatus } from "../models/EnumsDTO";
import { NewPriceAlertOptions, NewSonarAlertOptions } from "../models/NewAlertOptions";
import { UpdatePriceAlertOptions, UpdateSonarAlertOptions } from "../models/UpdateAlertOptions";
import { AlertConverters } from "./alert.converters";
import { AlertRestClient } from "./alert.rest.client";

@Injectable()
export class AlertsService {
    private _alerts: AlertBase[] = [];
    private _alertHistory: AlertHistory[] = [];

    public onAlertTriggered: Subject<string> = new Subject<string>();
    public onAlertShowPopup: Subject<string> = new Subject<string>();
    public onAlertPlaySound: Subject<string> = new Subject<string>();
    public onAlertsChanged: Subject<void> = new Subject<void>();
    public onAlertsHistoryChanged: Subject<void> = new Subject<void>();

    public get Alerts(): AlertBase[] {
        return this._alerts;
    }

    public get AlertHistory(): AlertHistory[] {
        return this._alertHistory;
    }

    constructor(private _alertRestClient: AlertRestClient) {
    }

    init() {
        
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

    updatePriceAlert(alert: UpdatePriceAlertOptions, alertId: number): Observable<PriceAlert> {
        let dto = AlertConverters.NewPriceAlertOptionsToDTO(alert);
        return this._alertRestClient.updatePriceAlert(dto, alertId).pipe(map((response) => {
            let newAlert = AlertConverters.PriceAlertDTOToAlertBase(response);
            this.addAlert(newAlert);
            return newAlert;
        }));
    }

    updateSonarAlert(alert: UpdateSonarAlertOptions, alertId: number): Observable<SonarAlert> {
        let dto = AlertConverters.NewSonarAlertOptionsToDTO(alert);
        return this._alertRestClient.updateSonarAlert(dto, alertId).pipe(map((response) => {
            let newAlert = AlertConverters.SonarAlertDTOToAlertBase(response);
            this.addAlert(newAlert);
            return newAlert;
        }));
    }

    startAlert(alertId: number): Observable<any> {
        return this._alertRestClient.startAlert(alertId).pipe(map(() => {
            this.changeStatus(alertId, AlertStatus.Running);
        }));
    }

    startAllAlerts(): Observable<any> {
        return this._alertRestClient.startAllAlerts().pipe(map(() => {
            this.changeStatusAll(AlertStatus.Running);
        }));
    }

    stopAlert(alertId: number): Observable<any> {
        return this._alertRestClient.stopAlert(alertId).pipe(map(() => {
            this.changeStatus(alertId, AlertStatus.Stopped);
        }));
    }

    stopAllAlerts(): Observable<any> {
        return this._alertRestClient.stopAllAlerts().pipe(map(() => {
            this.changeStatusAll(AlertStatus.Stopped);
        }));
    }

    private removeAlert(alertId: number) {
        let index = this._alerts.findIndex(alert => alert.Id === alertId);

        if (index !== -1) {
            this._alerts.splice(index, 1);
            this.onAlertsChanged.next();
        }
    }

    private addAlert(alert: AlertBase) {
        let index = this._alerts.findIndex(a => a.Id === alert.Id);
        if (index === -1) {
            this._alerts.push(alert);
            this.onAlertsChanged.next();
        }
    }

    private update(alertId: number, alert: AlertBase) {
        let index = this._alerts.findIndex(a => a.Id === alertId);

        if (index !== -1) {
            this._alerts[index] = alert;
            this.onAlertsChanged.next();
        }
    }

    private changeStatus(alertId: number, status: AlertStatus) {
        let alert = this._alerts.find(a => a.Id === alertId);
        if (alert) {
            alert.Status = status;
            this.onAlertsChanged.next();
        }
    }

    private changeStatusAll(status: AlertStatus) {
        for (let alert of this._alerts) {
            alert.Status = status;
            this.onAlertsChanged.next();
        }
    }
}