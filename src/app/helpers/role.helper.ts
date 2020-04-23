import {Inject, Injectable} from "@angular/core";
import {AppTranslateService} from "@app/localization/token";
import {TranslateService} from "@ngx-translate/core";
import {Roles} from "@app/models/auth/auth.models";
import {Observable} from "rxjs";
import {JsUtil} from "../../utils/jsUtil";
import {SharedTranslateService} from "@app/localization/shared.token";

@Injectable()
export class RolesHelper {
    constructor(@Inject(SharedTranslateService) private _appTranslateService: TranslateService) {
    }

    roleLocalizedStr(role: Roles): Observable<string> {
        return this._appTranslateService.stream(`roles.${JsUtil.stringEnumNameByValue(Roles, role) || 'Unset'}`);
    }
}
