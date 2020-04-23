import {Injectable} from "@angular/core";
import {
    IScriptCloudExecutorService,
    ScriptStartParameters,
    ScriptStartParametersDTO,
    ScriptStateEvtData
} from "../models/IScriptCloudExecutorService";
import {Observable, Subject, throwError} from "rxjs";
import {IdentityService} from "@app/services/auth/identity.service";
import {BrokerService} from "@app/services/broker.service";
import {HttpClient} from "@angular/common/http";
import {NotificationService} from "@app/services/notification.service";
import {NotificationAction, NotificationMessage} from "@app/models/notifications/notification";
import {IInstrument} from '@app/models/common/instrument';
import {RunningMetadata} from "@scripting/models/IScriptCloudRepositoryService";
import {ScriptingApiService} from "@scripting/services/scripting-api.service";

enum EScriptStateMessage {
    Started = "started",
    Stopped = "stopped"
}

@Injectable()
export class ScriptCloudExecutorService implements IScriptCloudExecutorService {
    private get _userID(): string {
        return this._identity.id;
    }

    onScriptFailed: Subject<ScriptStateEvtData> = new Subject<ScriptStateEvtData>();
    onScriptPlaySound: Subject<string> = new Subject<string>();
    onScriptShowPopup: Subject<string> = new Subject<string>();
    onScriptStarted: Subject<ScriptStateEvtData> = new Subject<ScriptStateEvtData>();
    onScriptStopped: Subject<ScriptStateEvtData> = new Subject<ScriptStateEvtData>();

    constructor(private _identity: IdentityService,
                private _http: HttpClient,
                private _brokerService: BrokerService,
                private _scriptingApiService: ScriptingApiService,
                private _notificationService: NotificationService) {

        this._notificationService.onMessage$.subscribe((value: NotificationMessage) => {
            this._processMessage(value);
        });
    }

    startScript(scriptName: string, params: ScriptStartParameters): Observable<RunningMetadata> {
        return new Observable<RunningMetadata>(subscriber => {
            let tradingParameters = null;
            let sendStartRequest = () => {
                const dto: ScriptStartParametersDTO = {
                    userId: this._identity.id,
                    scriptName: params.scriptName,
                    symbol: params.symbol,
                    exchange: params.exchange,
                    datafeed: params.datafeed,
                    historyParameters: params.historyParameters,
                    tradingParamters: tradingParameters,
                    properties: params.properties,
                    email: (window as any).testEmail ? (window as any).testEmail : this._identity.email, // just for test
                    phone: (window as any).testPhone ? (window as any).testPhone : "" // just for test
                };

                this._scriptingApiService.startScript(dto)
                    .subscribe((data: RunningMetadata) => {
                        subscriber.next(data);
                        subscriber.complete();
                    }, error => {
                        subscriber.error(error);
                        subscriber.complete();
                    });
            };

            if (this._brokerService.isConnected && this._brokerService.activeBroker) {
                tradingParameters = {
                    accessToken: this._brokerService.activeBroker.accessToken,
                    broker: this._brokerService.activeBroker.instanceType,
                    symbol: undefined
                };

                if (tradingParameters.broker === "Switch") {
                    tradingParameters.broker = "peatio";
                }

                this._brokerService.tryMapInstrument(params.symbol).subscribe((instruments: IInstrument[]) => {
                    if (instruments.length) {
                        tradingParameters.symbol = instruments[0].symbol;
                    } else {
                        this.onScriptShowPopup.next(`Failed to map ${params.symbol} to broker format`);
                    }

                    sendStartRequest();
                }, error => {
                    sendStartRequest();
                });
            } else {
                sendStartRequest();
            }
        });
    }

    stopScript(runningId: string): Observable<string> {
        return this._scriptingApiService.stopScript(runningId);
    }

    private _processMessage(msg: NotificationMessage) {
        if (msg.action === NotificationAction.ATE_ScriptStateMessage) {
            try {
                let data = JSON.parse(msg.payload);
                if (data) {

                    if (data.Status === EScriptStateMessage.Started) {
                        this.onScriptStarted.next({
                            scriptName: data.AlertName,
                            runningId: data.RunningId
                        });
                    } else if (data.Status === EScriptStateMessage.Stopped) {
                        this.onScriptStopped.next({
                            scriptName: data.AlertName,
                            runningId: data.RunningId
                        });
                    }
                }
            } catch (e) {
                console.log(e);
                console.log("Failed to parse script notification.");
            }
        }

        if (msg.action === NotificationAction.ATE_PlaySoundMessage) {
            try {
                let data = JSON.parse(msg.payload);
                if (data && data.AlertName && data.ScriptKind === 'strategy') {
                    this.onScriptPlaySound.next(data.Location);
                }
            } catch (e) {
                console.log(e);
                console.log("Failed to parse script notification.");
            }
        }

        if (msg.action === NotificationAction.ATE_ShowPopupMessage) {
            try {
                let data = JSON.parse(msg.payload);
                if (data && data.AlertName && data.ScriptKind === 'strategy') {
                    this.onScriptShowPopup.next(data.Message);
                }
            } catch (e) {
                console.log(e);
                console.log("Failed to parse script notification.");
            }
        }
    }


}
