import { IWebSocketConfig } from "../../interfaces/socket/WebSocketConfig";
import { AppConfigService } from '../app.config.service';
import { Injectable } from "@angular/core";
import { MTSocketService } from './mt.socket.service';
import { IdentityService } from '../auth/identity.service';

@Injectable()
export class MT5SocketService extends MTSocketService {
  get config(): IWebSocketConfig {
    return {
      url: AppConfigService.config.apiUrls.MT5WS
    };
  }
  constructor(private identityService: IdentityService) {
    super(identityService);
  }
}


