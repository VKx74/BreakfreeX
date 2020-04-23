import {Locale} from "../enums/locale";
import {BehaviorSubject, Subject} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable()
export class LocalizationService {
    // private _locale: Locale;
    localeChange$ = new BehaviorSubject<Locale>(Locale.EN);

    get locale(): Locale {
        return this.localeChange$.value;
        // return this._locale;
    }

    setLocale(locale: Locale) {
        // this._locale = locale;
        moment.locale(locale);
        this.localeChange$.next(locale);
    }

    constructor() {
    }

    setupMomentLocale(_moment) {
        _moment.locale(this.locale);

        this.localeChange$
            .subscribe((locale) => {
                _moment.locale(locale);
            });
    }
}
