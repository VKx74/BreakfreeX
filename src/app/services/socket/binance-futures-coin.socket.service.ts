import { Injectable } from "@angular/core";
import { IWebSocketConfig } from "@app/interfaces/socket/WebSocketConfig";
import { BinanceFutureBrokerType } from "modules/Trading/models/crypto/binance-futures/binance-futures.communication";
import { BinanceEnvironment } from "modules/Trading/models/crypto/shared/models.communication";
import { AppConfigService } from "../app.config.service";
import { IdentityService } from "../auth/identity.service";
import { BinanceFuturesSocketService } from "./binance-futures.socket.service";

@Injectable()
export class BinanceFuturesCoinSocketService extends BinanceFuturesSocketService {
  get config(): IWebSocketConfig {
    return {
      url: this._environment === BinanceEnvironment.Real ? AppConfigService.config.apiUrls.BinanceBrokerWS : AppConfigService.config.apiUrls.BinanceTestnetBrokerWS
    };
  }

  get type(): BinanceFutureBrokerType {
    return BinanceFutureBrokerType.COIN;
  }

  constructor(protected _identityService: IdentityService) {
    super(_identityService);
  }
}