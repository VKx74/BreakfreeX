import {Injectable} from "@angular/core";
import {
    AlertDTO,
    AlertHistoryDTO,
    IAlertCloudRepositoryService,
    RunningMetadataDTO
} from "../models/IAlertCloudRepositoryService";
import {AlertBase} from "../models/AlertBase";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {IdentityService} from "@app/services/auth/identity.service";
import {AppConfigService} from "@app/services/app.config.service";
import {map} from "rxjs/operators";

@Injectable()
export class AlertCloudRepositoryService implements IAlertCloudRepositoryService {

    private _userID: string;

    constructor(private _http: HttpClient,
                private _identity: IdentityService) {
        this._userID = this._identity.id;
    }

    createAlert(alert: AlertBase): Observable<string> {
        let userId = this._identity.id;

        let alertData = {
            AlertParameters: alert.getSettings(),
            DataSource: alert.dataSource.getSettings(),
            ConfiguredTrade: alert.configuredTrade,
            Description: alert.getDescription()
        };

        let dto = {
            userId: userId,
            data: alertData
        };

        return this._http.post(`${AppConfigService.config.apiUrls.scriptEngineREST}Alert`, dto).pipe(map((data: any) => {
            return data.id;
        }));
    }

    deleteAlert(alert: string): Observable<any> {
        return this._http.delete(`${AppConfigService.config.apiUrls.scriptEngineREST}Alert/${alert}/${this._userID}`);
    }

    loadAlerts(): Observable<AlertDTO[]> {
        return this._http.get(`${AppConfigService.config.apiUrls.scriptEngineREST}Alert/${this._userID}`).pipe(map((data: any) => {
            const result: AlertDTO[] = [];

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                try {
                    let alertSettings = JSON.parse(row.data);
                    let alertId = row.id;

                    if (alertSettings.AlertParameters && alertSettings.DataSource) {
                        result.push({
                            AlertParameters: alertSettings.AlertParameters,
                            DataSource: alertSettings.DataSource,
                            ConfiguredTrade: alertSettings.ConfiguredTrade,
                            InnerId: alertId
                        });
                    }

                } catch (e) {
                    console.log("Failed to parse alert");
                    console.log(e);
                }
            }

            return result;
        }));
    }

    loadAlertsHistory(): Observable<AlertHistoryDTO[]> {
        return this._http.get(`${AppConfigService.config.apiUrls.scriptEngineREST}AlertHistory/${this._userID}`).pipe(map((data: any) => {
            const result: AlertHistoryDTO[] = [];

            if (!data) {
                return result;
            }

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                try {
                    let historicalEntry = JSON.parse(row.data);

                    if (historicalEntry.Description && historicalEntry.Time) {
                        result.push({
                            Description: historicalEntry.Description,
                            Comment: historicalEntry.Comment,
                            Time: historicalEntry.Time,
                        });
                    }

                } catch (e) {
                    console.log("Failed to parse alerts history");
                    console.log(e);
                }
            }

            return result;
        }));
    }

    loadRunningAlerts(): Observable<RunningMetadataDTO[]> {
        return this._http.get(`${AppConfigService.config.apiUrls.scriptEngineREST}running?kind=alert&userId=${this._userID}`).pipe(map((data: any) => {
            const result: RunningMetadataDTO[] = [];

            if (!data) {
                return result;
            }

            for (let i = 0; i < data.length; i++) {
                result.push(data[i] as RunningMetadataDTO);
            }

            return result;
        }));
    }

    updateAlert(alert: AlertBase): Observable<any> {
        let userId = this._identity.id;

        let alertData = {
            AlertParameters: alert.getSettings(),
            DataSource: alert.dataSource.getSettings(),
            ConfiguredTrade: alert.configuredTrade,
            Description: alert.getDescription()
        };

        let dto = {
            userId: userId,
            alertId: alert.externalId,
            data: alertData
        };

        return this._http.put(`${AppConfigService.config.apiUrls.scriptEngineREST}Alert`, dto);
    }

    public getAlertCode(id: string): Observable<string> {
        return this._http.get<string>(`${AppConfigService.config.apiUrls.scriptEngineREST}Alert/convert/${id}/${this._userID}`);
    }
}
