import { AlertService, AlertServiceConfig, AlertType, DefaultAlertServiceConfig } from "./alert.service";
import { forkJoin, Observable, of } from "rxjs";

export class ToasterAlertService extends AlertService {
    private _inited: boolean;
    private _subscribers: { [symbol: string]: () => void; } = {};
    private _toasts: any;

    defaultOptions: ToastrOptions = {
        positionClass: 'toast-top-right',
        toastClass: 'toast-custom',
        timeOut: 1000 * 10

    };

    constructor(config?: AlertServiceConfig) {
        super();
        this._config = config || DefaultAlertServiceConfig;
        (toastr as any).subscribe((...args) => {
            try {
                if (!args || !args[0] || !args[0].map) {
                    return;
                }
                let message = args[0].map.message;
                let state = args[0].state;

                if (this._subscribers && this._subscribers[message] && state === "hidden") {
                    this._subscribers[message]();
                    delete this._subscribers[message];
                }

            } catch (error) {

            }
        });
    }

    async init(time: number) {
        let options = {
            ...this.defaultOptions
        };

        if (time) {
            options.timeOut = 1000 * time;
        }

        toastr.options = options;
        this._toasts = toastr;
        this._inited = true;
    }

    private _getAsObservable(word: string | Observable<string>): Observable<string> {
        if (word instanceof Observable) {
            return word;
        }

        return of(word);
    }

    async success(message: Observable<string> | string, title?: string | Observable<string>, time: number = 10, callback: () => void = null) {
        await this.init(time);

        forkJoin(this._getAsObservable(message), this._getAsObservable(title || this.getTitle(AlertType.Success)))
            .subscribe((values: string[]) => {
                this._toasts.success(values[0], values[1]);

                if (callback) {
                    this._subscribers[values[0]] = callback;
                }
            });

    }

    async info(message: Observable<string> | string, title?: string | Observable<string>, time: number = 10, callback: () => void = null) {
        await this.init(time);

        forkJoin(this._getAsObservable(message), this._getAsObservable(title || this.getTitle(AlertType.Info)))
            .subscribe((values: string[]) => {
                this._toasts.info(values[0], values[1]);

                if (callback) {
                    this._subscribers[values[0]] = callback;
                }
            });
    }

    async warning(message: Observable<string> | string, title?: string | Observable<string>, time: number = 10, callback: () => void = null) {
        await this.init(time);

        forkJoin(this._getAsObservable(message), this._getAsObservable(title || this.getTitle(AlertType.Warning)))
            .subscribe((values: string[]) => {
                this._toasts.warning(values[0], values[1]);

                if (callback) {
                    this._subscribers[values[0]] = callback;
                }
            });
    }

    async error(message: Observable<string> | string, title?: string | Observable<string>, time: number = 10, callback: () => void = null) {
        await this.init(time);

        forkJoin(this._getAsObservable(message), this._getAsObservable(title || this.getTitle(AlertType.Error)))
            .subscribe((values: string[]) => {
                this._toasts.error(values[0], values[1]);

                if (callback) {
                    this._subscribers[values[0]] = callback;
                }
            });
    }
}
