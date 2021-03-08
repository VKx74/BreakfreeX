import { Injectable } from "@angular/core";
import { IWebSocketConfig } from "@app/interfaces/socket/WebSocketConfig";
import { AppConfigService } from "../app.config.service";
import { IdentityService } from "../auth/identity.service";
import { BinanceFuturesSocketService } from "./binance-futures.socket.service";

@Injectable()
export class BinanceFuturesCoinSocketService extends BinanceFuturesSocketService {
  get config(): IWebSocketConfig {
    return {
      url: AppConfigService.config.apiUrls.BinanceBrokerWS
    };
  }

  constructor(protected _identityService: IdentityService) {
    super(_identityService);
  }
}