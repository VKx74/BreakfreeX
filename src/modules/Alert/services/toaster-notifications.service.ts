import { forkJoin, Observable, of } from "rxjs";
import { NotificationsService } from "./notifications.service";

export class ToasterNotificationsService extends NotificationsService {
    private _inited: boolean;

    private _toasts: any;

    defaultOptions: ToastrOptions = {
        positionClass: 'toast-top-center',
        toastClass: 'toast-notifications-custom',
        timeOut: 1000 * 60

    };

    constructor() {
        super();
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

    async show(message: Observable<string> | string, title?: string | Observable<string>) {
        await this.init();

        forkJoin(this._getAsObservable(message), this._getAsObservable(title))
            .subscribe((values: string[]) => {
                this._toasts.info(values[0], values[1]);
            });

    }
}
