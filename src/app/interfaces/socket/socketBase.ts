import {merge, Observable, Subject, throwError} from "rxjs";
import {environment} from "../../../environments/environment";
import {IWebSocketConfig, IWebSocketReconnectConfig, ReadyStateConstants} from "./WebSocketConfig";
import {first, flatMap} from "rxjs/operators";
import {JsUtil} from "../../../utils/jsUtil";

export enum SocketState {
    CONNECTING,
    OPEN,
    CLOSING,
    CLOSED
}

export abstract class WebsocketBase {
    protected _isClosed = false;
    protected _socket: WebSocket;
    protected _reconnectAttempts = 0;
    protected _interval: any;

    onOpen = new Subject();
    onReconnect = new Subject();
    onClose = new Subject();
    onError = new Subject();
    onMessage = new Subject();

    get readyState(): number {
        return this._socket ? this._socket.readyState : -1;
    }

    get usePingPongs(): boolean {
        return true;
    }

    protected reconnectConfig: IWebSocketReconnectConfig = {
        initialTimeout: 500,
        maxTimeout: 300000,
        reconnectIfNotNormalClose: false
    };

    public send(message: any): boolean {
        const isOpen = this.readyState === ReadyStateConstants.OPEN;

        if (isOpen) {
            this._socket.send(JsUtil.isString(message) ? message : JSON.stringify(message));
        }

        return isOpen;
    }

    public close(): void {
        if (this._socket) {
            this._socket.close();
            this._socket = null;
        }

        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }

        this._isClosed = true;
    }

    public open(): Observable<void> {
        return new Observable<void>(subscriber => {
            if (this.readyState === ReadyStateConstants.OPEN) {
                subscriber.next();
            } else {
                merge(
                    this.onOpen,
                    this.onError
                        .pipe(flatMap((error) => throwError(error)))
                )
                    .pipe(first())
                    .subscribe({
                        next: () => subscriber.next(),
                        error: (e) => subscriber.error(e),
                        complete: () => subscriber.complete()
                    });

                this._connect();
            }
        });
    }

    abstract get config(): IWebSocketConfig;

    protected _connect(isReconnect: boolean = false): void {
        try {
            this._socket = null;
            this._socket = new WebSocket(this.config.url, this.config.providers);

            // setInterval(() => {
            //     console.log("CLOSED: " + this._socket.CLOSED + " OPEN: " + this._socket.OPEN + " readyState: " + this._socket.readyState);
            // }, 10000);

            this._socket.onopen = (ev: Event) => {
                this._reconnectAttempts = 0;
                if (isReconnect) {
                    this.onReconnect.next(ev);
                } else {
                    this.onOpen.next(ev);
                }
                this._log(ev);

                if (this.usePingPongs && !this._interval) {
                    this._interval = setInterval(this._sendPings.bind(this), 30 * 1000); // 30 sec
                }
            };

            this._socket.onmessage = (ev: MessageEvent) => {
                this._handleMessage(this._parseMessage(ev));
                // this._log(ev.data);
            };

            this._socket.onclose = (ev: CloseEvent) => {
                this.onClose.next(ev);
                this._log(ev);

                console.log("Socket closed");
                
                if (!this._isClosed) {
                    this._reconnect();
                }
            };

            this._socket.onerror = (ev: CloseEvent) => {
                this.onError.next(ev);
                console.log("Socket error");
                this._log(ev);
            };
        } catch (e) {
            console.error('Websoket error', e);
        }
    }

    protected _handleMessage(ev: any) {
        this.onMessage.next(ev);
    }

    protected _reconnect() {
        console.log("Socket reconnect");
        setTimeout(() => {
            this._connect(true);
        }, this._getBackoffDelay(++this._reconnectAttempts));
    }

    // Exponential Backoff Formula by Prof. Douglas Thain
    // http://dthain.blogspot.co.uk/2009/02/exponential-backoff-in-distributed.html
    private _getBackoffDelay(attempt: number): number {
        const randomNumber = Math.random() + 1,
            initialTimeout = this.reconnectConfig.initialTimeout,
            power = 2,
            maxTimeout = this.reconnectConfig.maxTimeout;

        return Math.floor(Math.min(randomNumber * initialTimeout * Math.pow(power, attempt), maxTimeout));
    }

    private _parseMessage(ev: MessageEvent): any {
        try {
            return JSON.parse(ev.data);
        } catch (e) {
            return ev.data;
        }
    }

    private _log(...args: any[]) {
        if (!environment.production) {
            console.log(args);
        }
    }

    private _sendPings() {
        this.send("ping");
    }
}
