import {Observable, Observer} from "rxjs";
import {EconomicEventNotification} from "@calendarEvents/models/models";
import {JsUtil} from "../../utils/jsUtil";
import {WebsocketBase} from "@app/interfaces/socket/socketBase";

export interface IBaseNotificationServiceConfig {
    socket: WebsocketBase;
    closeOnEmpty?: boolean;
    connectOnInit?: boolean;
}

export abstract class BaseNotificationService {
    private _subscribers: { [token: string]: Observer<EconomicEventNotification> } = {};

    protected get _socket(): WebsocketBase {
        return this._config.socket;
    }

    protected constructor(private _config: IBaseNotificationServiceConfig) {
    }

    protected init() {
        if (this._config.connectOnInit === true) {
            this._socket.open()
                .subscribe({
                    error: () => {
                        console.error('Failed to connect to socket');
                    }
                });
        }
    }

    subscribeOnNotification<T = any>(): Observable<T> {
        return new Observable<any>((observer: Observer<any>) => {
            const token = JsUtil.generateGUID();

            this._socket.open()
                .subscribe({
                    next: () => {
                        this._subscribers[token] = observer;
                    },
                    error: (error: Error) => {
                        observer.error(error);
                    }
                });

            return () => {
                this._unsubscribe(token);
            };
        });
    }

    private _unsubscribe(token: string) {
        delete this._subscribers[token];

        if (Object.keys(this._subscribers).length === 0 && this._config.closeOnEmpty) {
            this._socket.close();
        }
    }
}
