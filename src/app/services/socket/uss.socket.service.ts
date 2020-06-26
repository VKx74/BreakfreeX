import {WebsocketBase} from "../../interfaces/socket/socketBase";
import {IWebSocketConfig} from "../../interfaces/socket/WebSocketConfig";
import {AppConfigService} from '../app.config.service';
import {Injectable} from "@angular/core";

@Injectable()
export class UssSocketService extends WebsocketBase {

    get usePingPongs(): boolean {
        return true;
    }

    get config(): IWebSocketConfig {
        return {
            url: AppConfigService.config.apiUrls.webSocketUrl + '?accesstoken=' + AppConfigService.config.apiKey
        };
    }
}


