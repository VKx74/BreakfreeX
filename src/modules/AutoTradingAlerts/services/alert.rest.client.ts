import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { AlertBaseDTO, PriceAlertDTO, SonarAlertDTO } from "../models/AlertBaseDTO";
import { AlertHistoryDTO } from "../models/AlertHistoryDTO";
import { NewPriceAlertDTO, NewSonarAlertDTO } from "../models/NewAlertDTO";
import { UpdatePriceAlertDTO } from "../models/UpdatePriceAlertDTO";
import { UpdateSonarAlertDTO } from "../models/UpdateSonarAlertDTO";
import { AppConfigService } from "@app/services/app.config.service";
import { NotificationLogDTO } from "../models/NotificationLogDTO";
import { AlertType } from "../models/EnumsDTO";
import { NotificationLimitsDTO } from "../models/NotificationLimitsDTO";
import { AlertLimitsDTO } from "../models/AlertLimitsDTO";

@Injectable()
export class AlertRestClient {
    private _url: string;

    constructor(private _http: HttpClient) {
        this._url = AppConfigService.config.apiUrls.bftAlertsREST;
    }

    createPriceAlert(dto: NewPriceAlertDTO): Observable<PriceAlertDTO> {
        // let dto = AlertsService.NewAlertOptionsToDTO(alert);
        return this._http.post<PriceAlertDTO>(`${this._url}AddPriceAlert`, dto);
    }

    createSonarAlert(dto: NewSonarAlertDTO): Observable<SonarAlertDTO> {
        // let dto = AlertsService.NewAlertOptionsToDTO(alert);
        return this._http.post<SonarAlertDTO>(`${this._url}AddSonarAlert`, dto);
    }

    deleteAlert(alertId: number): Observable<any> {
        return this._http.delete(`${this._url}RemoveAlert/${alertId}`);
    }

    deleteAllPriceAlert(): Observable<any> {
        return this._http.delete(`${this._url}RemovePriceAlerts`);
    }

    deleteAllSonarAlert(): Observable<any> {
        return this._http.delete(`${this._url}RemoveSonarAlerts`);
    }

    loadAlerts(): Observable<AlertBaseDTO[]> {
        return this._http.get<AlertBaseDTO[]>(`${this._url}Alerts`);
    }

    loadAlertsHistory(): Observable<AlertHistoryDTO[]> {
        return this._http.get<AlertHistoryDTO[]>(`${this._url}AlertsHistory`);
    } 
    
    loadNotificationLog(): Observable<NotificationLogDTO[]> {
        return this._http.get<NotificationLogDTO[]>(`${this._url}NotificationsHistory`);
    }

    getNotificationLimits(): Observable<NotificationLimitsDTO> {
        return this._http.get<NotificationLimitsDTO>(`${this._url}NotificationLimits`);
    }

    getLimits(): Observable<AlertLimitsDTO> {
        return this._http.get<AlertLimitsDTO>(`${this._url}Limits`);
    }

    updatePriceAlert(dto: UpdatePriceAlertDTO, alertId: number): Observable<PriceAlertDTO> {
        return this._http.patch<PriceAlertDTO>(`${this._url}EditPriceAlert/${alertId}`, dto);
    }

    updateSonarAlert(dto: UpdateSonarAlertDTO, alertId: number): Observable<SonarAlertDTO> {
        return this._http.patch<SonarAlertDTO>(`${this._url}EditSonarAlert/${alertId}`, dto);
    }

    startAlert(alertId: number, alertType: AlertType): Observable<any> {
        return this._http.post(`${this._url}StartAlert/${alertType}/${alertId}`, null);
    }

    startAllAlerts(): Observable<any> {
        return this._http.post(`${this._url}StartAllAlerts`, null);
    }

    stopAlert(alertId: number, alertType: AlertType): Observable<any> {
        return this._http.post(`${this._url}StopAlert/${alertType}/${alertId}`, null);
    }

    stopAllAlerts(): Observable<any> {
        return this._http.post(`${this._url}StopAllAlerts`, null);
    }
}
