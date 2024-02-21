import {Inject, Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {Observable, Subject, throwError, of} from "rxjs";
import {WebsocketBase} from "@app/interfaces/socket/socketBase";
import {NotificationWebSocketService} from "@app/services/socket/notification.socket.service";
import {catchError} from "rxjs/operators";
import {ActivationKeyResponse, NotificationMessage, NotificationTopics} from "@app/models/notifications/notification";
import {IdentityService} from "@app/services/auth/identity.service";

@Injectable()
export class NotificationService {
    public onMessage$: Subject<NotificationMessage> = new Subject();
    public onClose$ = new Subject();

    private _sessionKey: string = '';
    private _activationKeySubscription = new Subject<string>();
    private _isOpened: boolean = false;
    private _ensureConnectedListeners = new Subject<boolean>();

    get isOpened(): boolean {
        return this._isOpened;
    }

    get readyState(): number {
        return this._socket.readyState;
    }

    constructor(@Inject(NotificationWebSocketService) private _socket: WebsocketBase,
                private _identityService: IdentityService,
                private _http: HttpClient) {
        // this._openConnection();
    }

    public ensureConnectionEstablished(): Observable<boolean> {
        if (this._isOpened) {
            return of(true);
        }

        return this._ensureConnectedListeners;
    }

    public subscribeForUpdates(topicName: NotificationTopics, topicId?: string): Observable<HttpErrorResponse | any> {
        let params = new HttpParams()
            .append('sessionKey', this._sessionKey)
            .append('userId', this._identityService.id);

        if (topicId) {
            params = params.append('topicId', topicId);
        }

        return this._http.post(`${AppConfigService.config.apiUrls.notificationREST}NotificationSubscription/${topicName}/Subscribe`, {}, {params: params})
            .pipe(catchError(error => {
                console.log('Failed to subscribe on ' + topicName);
                console.log(error);
                return throwError(error);
            }));
    }

    public unSubscribeForUpdates(topicName: NotificationTopics, topicId?: string): Observable<HttpErrorResponse | any> {
        let params = new HttpParams()
            .append('sessionKey', this._sessionKey)
            .append('userId', this._identityService.id);

        if (topicId) {
            params = params.append('topicId', topicId);
        }

        return this._http.post(`${AppConfigService.config.apiUrls.notificationREST}NotificationSubscription/${topicName}/Unsubscribe`, {}, {params: params})
            .pipe(catchError(error => {
                console.log('Failed to unsubscribe on ' + topicName);
                console.log(error);
                return throwError(error);
            }));
    }

    public subscribeToPublicRoomsUpdates(): Observable<any> {
        return this.subscribeForUpdates(NotificationTopics.PublicRooms);
    }

    private _handleMessage(value) {
        if (value && value.Key) {
            this._activationKeySubscription.next(value.Key);
            this._activationKeySubscription.complete();
        } else {
            this.onMessage$.next(value);
        }
    }

    private _activateKey(sessionKey: string): Observable<ActivationKeyResponse> {
        const params = new HttpParams()
            .append('key', sessionKey)
            .append('userId', this._identityService.id);

        return this._http.post<ActivationKeyResponse>(`${AppConfigService.config.apiUrls.notificationREST}Auth/ActivateKey`, {}, {params: params});
    }

    private _openConnection() {
        this._socket.onMessage.subscribe((value) => {
            this._handleMessage(value);
        });

        this._socket.onClose.subscribe(() => {
            this.onClose$.next();
        });

        this._socket.open().subscribe(value => {
            this._activationKeySubscription.subscribe(key => {
                this._activateKey(key).subscribe(resp => {
                    if (resp && resp.sessionKey) {
                        this._sessionKey = resp.sessionKey;
                        this._isOpened = true;
                        this._ensureConnectedListeners.next(true);
                        this._ensureConnectedListeners.complete();
                    } else {
                        this._isOpened = false;
                        this._ensureConnectedListeners.error(resp);
                        this._ensureConnectedListeners.complete();
                    }
                }, error => {
                    this._ensureConnectedListeners.error(error);
                    this._ensureConnectedListeners.complete();
                    console.log('Failed to activate WebSocket session key');
                    console.log(error);
                });
            });
        }, error => {
            this._ensureConnectedListeners.error(error);
            this._ensureConnectedListeners.complete();
        });
    }
}
