import {AlertService, AlertServiceConfig, AlertType, DefaultAlertServiceConfig} from "./alert.service";
import {forkJoin, Observable, of} from "rxjs";

export class ToasterAlertService extends AlertService {
    private _inited: boolean;

    private _toasts: any;

    defaultOptions: ToastrOptions = {
        positionClass: 'toast-top-right',
        toastClass: 'toast-custom',
        timeOut: 1000 * 10

    };

    constructor(config?: AlertServiceConfig) {
        super();
        this._config = config || DefaultAlertServiceConfig;
    }

    async init() {
        // if (this._inited) {
        //     return true;
        // }

        toastr.options = this.defaultOptions;
        this._toasts = toastr;
        this._inited = true;
    }

    private _getAsObservable(word: string | Observable<string>): Observable<string> {
        if (word instanceof Observable) {
            return word;
        }

        return of(word);
    }

    async success(message: Observable<string> | string, title?: string | Observable<string>) {
        await this.init();

        forkJoin(this._getAsObservable(message), this._getAsObservable(title || this.getTitle(AlertType.Success)))
            .subscribe((values: string[]) => {
                this._toasts.success(values[0], values[1]);
            });

    }

    async info(message: Observable<string> | string, title?: string | Observable<string>) {
        await this.init();

        forkJoin(this._getAsObservable(message), this._getAsObservable(title || this.getTitle(AlertType.Info)))
            .subscribe((values: string[]) => {
                this._toasts.info(values[0], values[1]);
            });
    }

    async warning(message: Observable<string> | string, title?: string | Observable<string>) {
        await this.init();

        forkJoin(this._getAsObservable(message), this._getAsObservable(title || this.getTitle(AlertType.Warning)))
            .subscribe((values: string[]) => {
                this._toasts.warning(values[0], values[1]);
            });
    }

    async error(message: Observable<string> | string, title?: string | Observable<string>) {
        await this.init();

        forkJoin(this._getAsObservable(message), this._getAsObservable(title || this.getTitle(AlertType.Error)))
            .subscribe((values: string[]) => {
                this._toasts.error(values[0], values[1]);
            });
    }
}
