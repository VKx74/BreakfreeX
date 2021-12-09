import {WebsocketBase} from "@app/interfaces/socket/socketBase";
import {IWebSocketConfig} from "@app/interfaces/socket/WebSocketConfig";
import {AppConfigService} from '@app/services/app.config.service';
import {Injectable} from "@angular/core";

@Injectable()
export class BinanceScannerWsService extends WebsocketBase {

    // TODO: Add support of ping/pong
    get usePingPongs(): boolean {
        return false;
    }

    get config(): IWebSocketConfig {
        return {
            url: `wss://binance-stage.breakfreetrading.com/binance-trend-scanner`
        };
    }
}
