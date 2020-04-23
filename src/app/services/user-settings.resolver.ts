import {Resolve} from "@angular/router";
import {Injectable} from "@angular/core";
import {UserSettings, UserSettingsService} from "./user-settings/user-settings.service";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";

@Injectable()
export class UserSettingsResolver implements Resolve<UserSettings> {
    constructor(private _userSettingsService: UserSettingsService) {
    }

    resolve(): Observable<any> {
        return this._userSettingsService.getSettings()
            .pipe(
                catchError(() => {
                    return this._userSettingsService.defaultSettings();
                })
            );
    }
}
