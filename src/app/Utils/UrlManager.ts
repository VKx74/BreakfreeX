import {AuthRoutes} from "../../modules/Auth/auth.routes";
import {AppRoutes} from "AppRoutes";
import {JsUtil} from "../../utils/jsUtil";

export class UrlsManager {
    static registrationRedirectUrl(email: string): string {
        return `${JsUtil.getRootUrl()}/#/${AppRoutes.Auth}/${AuthRoutes.RegistrationFinished}?email=${encodeURIComponent(email)}`;
    }

    static restorePasswordRedirectUrl(): string {
        return `${JsUtil.getRootUrl()}/#/${AppRoutes.Auth}/`;
    }

    static reconfirmEmailRedirectUrl(email: string): string {
        return `${JsUtil.getRootUrl()}/#/${AppRoutes.Auth}/${AuthRoutes.Registration}?email=${encodeURIComponent(email)}`;
    }

    static loginRedirectUrl(): string {
        return `${JsUtil.getRootUrl()}/#/${AppRoutes.Auth}/${AuthRoutes.Login}`;
    }

    static restore2FactorAuthRedirectUrl(email: string): string {
        return `${JsUtil.getRootUrl()}/#/${AppRoutes.Auth}/${AuthRoutes.Login}?email=${encodeURIComponent(email)}`;
    }
}