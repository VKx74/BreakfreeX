import { Injectable } from '@angular/core';
import {IWebSocketConfig} from "@app/interfaces/socket/WebSocketConfig";
import {AppConfigService} from "@app/services/app.config.service";
import {WebsocketBase} from "@app/interfaces/socket/socketBase";

@Injectable()
export class OandaSocketService extends WebsocketBase {

  get usePingPongs(): boolean {
    return true;
  }

  get config(): IWebSocketConfig {
    return {
      url: AppConfigService.config.apiUrls.onadaWS
    };
  }
}
