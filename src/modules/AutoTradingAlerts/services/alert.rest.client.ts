import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { AlertBaseDTO } from "../models/AlertBaseDTO";
import { AlertHistoryDTO } from "../models/AlertHistoryDTO";
import { NewAlertDTO } from "../models/NewAlertDTO";
import { UpdatePriceAlertDTO } from "../models/UpdatePriceAlertDTO";
import { UpdateSonarAlertDTO } from "../models/UpdateSonarAlertDTO";


@Injectable()
export class AlertRestClient {
    private _url: string;

    constructor(private _http: HttpClient) {
    }

    createPriceAlert(dto: NewAlertDTO): Observable<any> {
        // let dto = AlertsService.NewAlertOptionsToDTO(alert);
        return this._http.post(`${this._url}AddPriceAlert`, dto);
    }

    createSonarAlert(dto: NewAlertDTO): Observable<any> {
        // let dto = AlertsService.NewAlertOptionsToDTO(alert);
        return this._http.post(`${this._url}AddSonarAlert`, dto);
    }

    deleteAlert(alertId: number): Observable<any> {
        return this._http.delete(`${this._url}RemoveAlert/${alertId}`);
    }

    loadAlerts(): Observable<AlertBaseDTO[]> {
        return this._http.get<AlertBaseDTO[]>(`${this._url}Alerts`);
    }

    loadAlertsHistory(): Observable<AlertHistoryDTO[]> {
        return this._http.get<AlertHistoryDTO[]>(`${this._url}AlertsHistory`);
    }

    updatePriceAlert(dto: UpdatePriceAlertDTO, alertId: number): Observable<any> {
        return this._http.post(`${this._url}AddPriceAlert/${alertId}`, dto);
    }

    updateSonarAlert(dto: UpdateSonarAlertDTO, alertId: number): Observable<any> {
        return this._http.post(`${this._url}EditSonarAlert/${alertId}`, dto);
    }


    public startAlert(alertId: number): Observable<any> {
        return this._http.post(`${this._url}StartAlert/${alertId}`, null);
    }

    public startALLAlerts(): Observable<any> {
        return this._http.post(`${this._url}StartAllAlerts`, null);
    }

    public stopAlert(alertId: number): Observable<any> {
        return this._http.post(`${this._url}StopAlert/${alertId}`, null);
    }

    public stopALLAlerts(): Observable<any> {
        return this._http.post(`${this._url}StopAllAlerts`, null);
    }

}
