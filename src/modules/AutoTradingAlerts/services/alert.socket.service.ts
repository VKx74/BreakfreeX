import { Injectable } from "@angular/core";
import { Observable, of, Subject, Subscriber, Subscription } from "rxjs";
import { AppConfigService } from "@app/services/app.config.service";
import { IWebSocketConfig, ReadyStateConstants } from "@app/interfaces/socket/WebSocketConfig";
import { IdentityService } from "@app/services/auth/identity.service";
import { WebsocketBase } from "@app/interfaces/socket/socketBase";
import { AlertAuthRequest, AlertMessageType, AlertRequestMessageBase, AlertResponseMessageBase, AlertResponseMessageType, AlertStateChangedResponse, AlertTriggeredResponse, IAlertChangedData, IAlertTriggeredData } from "./ws.models/models";


@Injectable()
export class AlertSocketService extends WebsocketBase {
    private _token: string;
    private _authSucceeded: boolean;
    private _onMessageSubscription: Subscription;
    private _subscribers: { [id: string]: Subscriber<AlertResponseMessageBase>; } = {};
    private _alertTriggered: Subject<IAlertTriggeredData> = new Subject<IAlertTriggeredData>();
    private _alertChanged: Subject<IAlertChangedData> = new Subject<IAlertChangedData>();

    get config(): IWebSocketConfig {
        return {
            url: AppConfigService.config.apiUrls.bftAlertsWS
        };
    }

    get alertTriggeredSubject(): Subject<IAlertTriggeredData> {
        return this._alertTriggered;
    }

    get alertChangedSubject(): Subject<IAlertChangedData> {
        return this._alertChanged;
    }

    constructor(private _identityService: IdentityService) {
        super();
        this._token = "Bearer " + this._identityService.token;

        this._onMessageSubscription = this.onMessage.subscribe(value => {
            try {
                const msgData = value as AlertResponseMessageBase;
                const msgTypeString = msgData && msgData.Type ? msgData.Type.toLowerCase() : "";

                if (msgTypeString === AlertResponseMessageType.AlertTriggered.toLowerCase()) {
                    this._processAlertTriggered(msgData);
                    return;
                }

                if (msgTypeString === AlertResponseMessageType.AlertChanged.toLowerCase()) {
                    this._processAlertStateChanged(msgData);
                    return;
                }

                if (msgTypeString === AlertResponseMessageType.AlertStateChanged.toLowerCase()) {
                    this._processAlertStateChanged(msgData);
                    return;
                }

                if (msgData && msgData.MessageId && this._subscribers[msgData.MessageId]) {
                    const subscription = this._subscribers[msgData.MessageId];
                    delete this._subscribers[msgData.MessageId];
                    subscription.next(msgData);
                    subscription.complete();
                }

            } catch (e) {
                console.log('Failed to process ws message in MT5SocketService');
                console.log(e);
            }
        });
    }

    public dispose() {
        this.close();
    }

    open(): Observable<void> {
        return new Observable<void>(subscriber => {
            if (this.readyState === ReadyStateConstants.OPEN) {
                subscriber.next();
                return;
            }

            if (this._identityService.isExpired) {
                this._identityService.refreshTokens().subscribe(() => {
                    this._open(subscriber);
                }, (error) => {
                    this._open(subscriber);
                });
            } else {
                this._open(subscriber);
            }

        });
    }

    sendAuth(): Observable<void> {
        return new Observable<void>(subscriber => {
            if (this._identityService.isExpired) {
                this._identityService.refreshTokens().subscribe(() => {
                    this._open(subscriber);
                }, (error) => {
                    this._open(subscriber);
                });
            } else {
                this._open(subscriber);
            }
        });
    }

    protected _open(subscriber: Subscriber<void>) {
        super.open().subscribe(() => {
            const authRequest = new AlertAuthRequest();
            authRequest.Data = {
                Token: "Bearer " + this._identityService.token
            };

            this.auth(authRequest).subscribe((res) => {
                if (res.Type === AlertResponseMessageType.Success) {
                    this._authSucceeded = true;
                    subscriber.next();
                    subscriber.complete();
                } else {
                    this._authSucceeded = false;
                    this.close();
                    subscriber.complete();
                }
            }, (error1) => {
                this._authSucceeded = false;
                this.close();
                subscriber.error(error1);
                subscriber.complete();
            });

        }, (error) => {
            subscriber.error(error);
            subscriber.complete();
        });
    }

    protected auth(data: AlertAuthRequest): Observable<AlertResponseMessageBase> {
        return new Observable<AlertResponseMessageBase>(subscriber => {
            this._send(data, subscriber);
        });
    }

    private _send(data: AlertRequestMessageBase, subscriber: Subscriber<AlertResponseMessageBase>) {
        try {
            this._subscribers[data.MessageId] = subscriber;
            const sent = this.send(data);
            if (!sent) {
                subscriber.error("Failed to send message");
                subscriber.complete();
            }
        } catch (error) {
            subscriber.error(error.message);
            subscriber.complete();
        }
    }

    private _processAlertTriggered(msgData: AlertResponseMessageBase) {
        const quoteMessage = msgData as AlertTriggeredResponse;
        this._alertTriggered.next(quoteMessage.Data);
    }

    private _processAlertStateChanged(msgData: AlertResponseMessageBase) {
        const quoteMessage = msgData as AlertStateChangedResponse;
        this._alertChanged.next(quoteMessage.Data);
    }
}
