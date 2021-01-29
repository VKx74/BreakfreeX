import { forkJoin, Observable, of } from "rxjs";
import { NotificationsService, NotificationType } from "./notifications.service";

export class ToasterNotificationsService extends NotificationsService {
    private _inited: boolean;

    private _toasts: any;

    defaultSuccessOptions: ToastrOptions = {
        positionClass: 'toast-top-center',
        toastClass: 'toast-notifications-custom-success',
        timeOut: 1000 * 60

    };

    defaultErrorOptions: ToastrOptions = {
        positionClass: 'toast-top-center',
        toastClass: 'toast-notifications-custom-error',
        timeOut: 1000 * 60

    };

    constructor() {
        super();
    }

    async init(notificationType?: NotificationType) {
        // if (this._inited) {
        //     return true;
        // }

        toastr.options = notificationType === NotificationType.Error ? this.defaultErrorOptions : this.defaultSuccessOptions;
        this._toasts = toastr;
        this._inited = true;
    }

    private _getAsObservable(word: string | Observable<string>): Observable<string> {
        if (word instanceof Observable) {
            return word;
        }

        return of(word);
    }

    async show(message: Observable<string> | string, title?: string | Observable<string>, notificationType?: NotificationType) {
        await this.init(notificationType);

        forkJoin(this._getAsObservable(message), this._getAsObservable(title))
            .subscribe((values: string[]) => {
                this._toasts.info(values[0], values[1]);
            });

    }
}
