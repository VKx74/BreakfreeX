import { Injectable } from "@angular/core";
import { IWebSocketConfig } from '@app/interfaces/socket/WebSocketConfig';
import { AppConfigService } from '../app.config.service';
import { IdentityService } from '../auth/identity.service';
import { MTSocketService } from './mt.socket.service';

@Injectable()
export class MT4SocketService extends MTSocketService {
  get config(): IWebSocketConfig {
    return {
      url: AppConfigService.config.apiUrls.MT4WS
    };
  }
  constructor(private identityService: IdentityService) {
    super(identityService);
  }
}


