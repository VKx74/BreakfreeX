import {WebsocketBase} from "../../interfaces/socket/socketBase";
import {IWebSocketConfig} from "../../interfaces/socket/WebSocketConfig";
import {AppConfigService} from '../app.config.service';
import {Injectable} from "@angular/core";
import { IdentityService } from "../auth/identity.service";
import { Observable, of } from "rxjs";

@Injectable()
export class NotificationWebSocketService extends WebsocketBase {

    get config(): IWebSocketConfig {
        return {
            url: AppConfigService.config.apiUrls.notificationWebSocketUrl
        };
    }

    constructor(private _identityService: IdentityService) {
        super();
    }
    
    open(): Observable<void> {
        if (this._identityService.isGuestMode) {
            return of();
        }

        return super.open();
    }
}
