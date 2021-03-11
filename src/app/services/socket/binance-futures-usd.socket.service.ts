import { Injectable } from "@angular/core";
import { IWebSocketConfig } from "@app/interfaces/socket/WebSocketConfig";
import { BinanceFutureBrokerType } from "modules/Trading/models/crypto/binance-futures/binance-futures.communication";
import { AppConfigService } from "../app.config.service";
import { IdentityService } from "../auth/identity.service";
import { BinanceFuturesSocketService } from "./binance-futures.socket.service";

@Injectable()
export class BinanceFuturesUsdSocketService extends BinanceFuturesSocketService {
  get config(): IWebSocketConfig {
    return {
      url: AppConfigService.config.apiUrls.BinanceBrokerWS
    };
  }

  get type(): BinanceFutureBrokerType {
    return BinanceFutureBrokerType.USDT;
  }

  constructor(protected _identityService: IdentityService) {
    super(_identityService);
  }
}