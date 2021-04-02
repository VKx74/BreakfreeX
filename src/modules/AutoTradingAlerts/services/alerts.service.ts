import {Injectable} from "@angular/core";
import {AlertBase} from "../models/AlertBase";
import {Observable, of, Subject, throwError} from "rxjs";
import { HttpClient } from "@angular/common/http";
import { IdentityService } from "@app/services/auth/identity.service";
import { AlertBaseDTO } from "../models/AlertBaseDTO";
import { AlertHistoryDTO } from "../models/AlertHistoryDTO";

@Injectable()
export class AlertsService {
    public onAlertTriggered: Subject<string> = new Subject<string>();
    public onAlertShowPopup: Subject<string> = new Subject<string>();
    public onAlertPlaySound: Subject<string> = new Subject<string>();

    private _userID: string;

    constructor(private _http: HttpClient,
                private _identity: IdentityService) {
        this._userID = this._identity.id;
    }

    createAlert(alert: AlertBase): Observable<string> {
        // let userId = this._identity.id;

        // let alertData = {
        //     AlertParameters: alert.getSettings(),
        //     DataSource: alert.dataSource.getSettings(),
        //     ConfiguredTrade: alert.configuredTrade,
        //     Description: alert.getDescription()
        // };

        // let dto = {
        //     userId: userId,
        //     data: alertData
        // };

        // return this._http.post(`${AppConfigService.config.apiUrls.scriptEngineREST}Alert`, dto).pipe(map((data: any) => {
        //     return data.id;
        // }));
        return null;
    }

    deleteAlert(alert: string): Observable<any> {
        return null;
        // return this._http.delete(`${AppConfigService.config.apiUrls.scriptEngineREST}Alert/${alert}/${this._userID}`);
    }

    loadAlerts(): Observable<AlertBaseDTO[]> {
        return null;
        // return this._http.get(`${AppConfigService.config.apiUrls.scriptEngineREST}Alert/${this._userID}`).pipe(map((data: any) => {
        //     const result: AlertDTO[] = [];

        //     for (let i = 0; i < data.length; i++) {
        //         const row = data[i];
        //         try {
        //             let alertSettings = JSON.parse(row.data);
        //             let alertId = row.id;

        //             if (alertSettings.AlertParameters && alertSettings.DataSource) {
        //                 result.push({
        //                     AlertParameters: alertSettings.AlertParameters,
        //                     DataSource: alertSettings.DataSource,
        //                     ConfiguredTrade: alertSettings.ConfiguredTrade,
        //                     InnerId: alertId
        //                 });
        //             }

        //         } catch (e) {
        //             console.log("Failed to parse alert");
        //             console.log(e);
        //         }
        //     }

        //     return result;
        // }));
    }

    loadAlertsHistory(): Observable<AlertHistoryDTO[]> {
        // return this._http.get(`${AppConfigService.config.apiUrls.scriptEngineREST}AlertHistory/${this._userID}`).pipe(map((data: any) => {
        //     const result: AlertHistoryDTO[] = [];

        //     if (!data) {
        //         return result;
        //     }

        //     for (let i = 0; i < data.length; i++) {
        //         const row = data[i];
        //         try {
        //             let historicalEntry = JSON.parse(row.data);

        //             if (historicalEntry.Description && historicalEntry.Time) {
        //                 result.push({
        //                     Description: historicalEntry.Description,
        //                     Comment: historicalEntry.Comment,
        //                     Time: historicalEntry.Time,
        //                 });
        //             }

        //         } catch (e) {
        //             console.log("Failed to parse alerts history");
        //             console.log(e);
        //         }
        //     }

        //     return result;
        // }));
        return null;
    }

    updateAlert(alert: AlertBase): Observable<any> {
        // let userId = this._identity.id;

        // let alertData = {
        //     AlertParameters: alert.getSettings(),
        //     DataSource: alert.dataSource.getSettings(),
        //     ConfiguredTrade: alert.configuredTrade,
        //     Description: alert.getDescription()
        // };

        // let dto = {
        //     userId: userId,
        //     alertId: alert.externalId,
        //     data: alertData
        // };

        // return this._http.put(`${AppConfigService.config.apiUrls.scriptEngineREST}Alert`, dto);
        return null;
    }


    public startAlert(alert: AlertBase): Observable<any> {
        // let userId = this._identity.id;

        // let tradingParameters = {
        //     accessToken: "",
        //     broker: "",
        //     symbol: ""
        // };

        // if (this._brokerService.isConnected && this._brokerService.activeBroker) {
        //     let instrument;

        //     if (alert.configuredTrade && alert.configuredTrade.TradeActionType === TradeActionType.Place) {
        //         if ((alert.configuredTrade as PlaceTradeSettings).Symbol) {
        //             instrument = (alert.configuredTrade as PlaceTradeSettings).Symbol;
        //         }
        //     }

        //     tradingParameters = {
        //         accessToken: this._brokerService.activeBroker.accessToken,
        //         broker: this._brokerService.activeBroker.instanceType,
        //         symbol: instrument
        //     };

        //     if (tradingParameters.broker === "Switch") {
        //         tradingParameters.broker = "peatio";
        //     }
        // }

        // let dto = {
        //     userId: userId,
        //     alertId: alert.externalId,
        //     tradingParameters: tradingParameters,
        //     email: (window as any).testEmail ? (window as any).testEmail : this._identity.email, // just for test
        //     phone: (window as any).testPhone ? (window as any).testPhone : this._identity.phoneNumber // just for test
        // };

        // return this._http.put(`${AppConfigService.config.apiUrls.scriptEngineREST}Alert/start`, dto).pipe(map((data: any) => {
        //     if (data.runningId) {
        //         alert.seCloudExecution();
        //         alert.setState(EAlertState.Started, data.runningId);
        //     } else {
        //         throwError('Failed to start alert');
        //     }
        // }));
        return null;
    }

    public stopAlert(alert: AlertBase): Observable<any> {
        // let userId = this._identity.id;
        // return this._http.delete(`${AppConfigService.config.apiUrls.scriptEngineREST}Alert/stop/${alert.runningId}/${userId}`)
        //     .pipe(
        //         catchError((e: HttpErrorResponse) => {
        //             if (e.status === 404) { // alert already stopped
        //                 return of(null);
        //             }

        //             return throwError(e);
        //         }),
        //         map((data: any) => {
        //             alert.setState(EAlertState.Stopped);
        //             return null;
        //         })
        //     );
        return null;
    }
}
