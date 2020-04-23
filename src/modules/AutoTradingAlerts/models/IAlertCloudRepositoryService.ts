import {Observable} from "rxjs";
import {AlertBase} from "./AlertBase";
import {AlertSourceSettings} from "./AlertSourceSettingsBase";
import {AlertSettings} from "./AlertSettingsBase";
import {TradeSettings} from "./TradeSettingsBase";

export interface AlertDTO {
    AlertParameters: AlertSettings;
    DataSource: AlertSourceSettings;
    ConfiguredTrade: TradeSettings;
    InnerId: string;
}

export interface RunningMetadataDTO {
    scriptName: string;
    runningId: string;
    startTimestamp: number;
}

export interface AlertHistoryDTO {
    Description: string;
    Comment: string;
    Time: number;
}

export interface IAlertCloudRepositoryService {
    createAlert(alert: AlertBase): Observable<string>;
    loadAlerts(): Observable<AlertDTO[]>;
    loadAlertsHistory(): Observable<AlertHistoryDTO[]>;
    loadRunningAlerts(): Observable<RunningMetadataDTO[]>;
    updateAlert(newAlert: AlertBase): Observable<any>;
    deleteAlert(alert: string): Observable<any>;
    getAlertCode(id: string): Observable<string>;
}
