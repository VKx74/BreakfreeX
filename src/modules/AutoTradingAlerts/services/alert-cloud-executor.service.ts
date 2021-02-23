import {Injectable} from "@angular/core";
import {Observable, of, Subject, throwError} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {IAlertCloudExecutorService} from "../models/IAlertCloudExecutorService";
import {NotificationService} from "@app/services/notification.service";
import {NotificationAction, NotificationMessage} from "@app/models/notifications/notification";
import {AlertBase, EAlertState} from "../models/AlertBase";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {IdentityService} from "@app/services/auth/identity.service";
import {BrokerService} from "@app/services/broker.service";
import {AppConfigService} from "@app/services/app.config.service";
import {AlertStateEvtData} from "../models/AlertStateEvtData";
import {TradeActionType} from 'modules/Trading/models/models';
import {PlaceTradeSettings} from '../models/TradeSettingsBase';

enum EAlertStateMessage {
    Started = "started",
    Stopped = "stopped"
}

@Injectable()
export class AlertCloudExecutorService implements IAlertCloudExecutorService {

    private _userID: string;

    constructor(private _http: HttpClient,
                private _identity: IdentityService,
                private _brokerService: BrokerService,
                private _notificationService: NotificationService) {
        this._userID = this._identity.id;
        this._notificationService.onMessage$.subscribe((value: NotificationMessage) => {
            this._processMessage(value);
        });
    }

    public onAlertStarted: Subject<AlertStateEvtData> = new Subject<AlertStateEvtData>();
    public onAlertStopped: Subject<AlertStateEvtData> = new Subject<AlertStateEvtData>();
    public onAlertFailed: Subject<AlertStateEvtData> = new Subject<AlertStateEvtData>();
    public onAlertTriggered: Subject<string> = new Subject<string>();
    public onAlertShowPopup: Subject<string> = new Subject<string>();
    public onAlertPlaySound: Subject<string> = new Subject<string>();

    public startAlert(alert: AlertBase): Observable<any> {
        let userId = this._identity.id;

        let tradingParameters = {
            accessToken: "",
            broker: "",
            symbol: ""
        };

        if (this._brokerService.isConnected && this._brokerService.activeBroker) {
            let instrument;

            if (alert.configuredTrade && alert.configuredTrade.TradeActionType === TradeActionType.Place) {
                if ((alert.configuredTrade as PlaceTradeSettings).Symbol) {
                    instrument = (alert.configuredTrade as PlaceTradeSettings).Symbol;
                }
            }

            tradingParameters = {
                accessToken: "",
                broker: this._brokerService.activeBroker.instanceType,
                symbol: instrument
            };

            if (tradingParameters.broker === "Switch") {
                tradingParameters.broker = "peatio";
            }
        }

        let dto = {
            userId: userId,
            alertId: alert.externalId,
            tradingParameters: tradingParameters,
            email: (window as any).testEmail ? (window as any).testEmail : this._identity.email, // just for test
            phone: (window as any).testPhone ? (window as any).testPhone : this._identity.phoneNumber // just for test
        };

        return this._http.put(`${AppConfigService.config.apiUrls.scriptEngineREST}Alert/start`, dto).pipe(map((data: any) => {
            if (data.runningId) {
                alert.seCloudExecution();
                alert.setState(EAlertState.Started, data.runningId);
            } else {
                throwError('Failed to start alert');
            }
        }));
    }

    public stopAlert(alert: AlertBase): Observable<any> {
        let userId = this._identity.id;
        return this._http.delete(`${AppConfigService.config.apiUrls.scriptEngineREST}Alert/stop/${alert.runningId}/${userId}`)
            .pipe(
                catchError((e: HttpErrorResponse) => {
                    if (e.status === 404) { // alert already stopped
                        return of(null);
                    }

                    return throwError(e);
                }),
                map((data: any) => {
                    alert.setState(EAlertState.Stopped);
                    return null;
                })
            );
    }

    private _processMessage(msg: NotificationMessage) {
        if (msg.action === NotificationAction.ATE_AlertStateMessage) {
            try {
                let data = JSON.parse(msg.payload);
                if (data) {

                    if (data.Status === EAlertStateMessage.Started) {
                        this.onAlertStarted.next({
                            alertName: data.AlertName,
                            runningId: data.RunningId
                        });
                    } else if (data.Status === EAlertStateMessage.Stopped) {
                        this.onAlertStopped.next({
                            alertName: data.AlertName,
                            runningId: data.RunningId
                        });
                    }
                }
            } catch (e) {
                console.log(e);
                console.log("Failed to parse alert notification.");
            }
        }

        if (msg.action === NotificationAction.ATE_AlertTriggeredMessage) {
            try {
                let data = JSON.parse(msg.payload);
                if (data && data.AlertName) {
                    this.onAlertTriggered.next(data.AlertName);
                }
            } catch (e) {
                console.log(e);
                console.log("Failed to parse alert notification.");
            }
        }

        if (msg.action === NotificationAction.ATE_PlaySoundMessage) {
            try {
                let data = JSON.parse(msg.payload);
                if (data && data.AlertName && data.ScriptKind === 'alert') {
                    this.onAlertPlaySound.next(data.Location);
                }
            } catch (e) {
                console.log(e);
                console.log("Failed to parse alert notification.");
            }
        }

        if (msg.action === NotificationAction.ATE_ShowPopupMessage) {
            try {
                let data = JSON.parse(msg.payload);
                if (data && data.AlertName && data.ScriptKind === 'alert') {
                    this.onAlertShowPopup.next(data.Message);
                }
            } catch (e) {
                console.log(e);
                console.log("Failed to parse alert notification.");
            }
        }

        if (msg.action === NotificationAction.ATE_PlaceOrderRequest) {
            try {
                let data = JSON.parse(msg.payload);
                console.table(data);
            } catch (e) {
                console.log(e);
                console.log("Failed to parse alert notification.");
            }
        }
    }

}
