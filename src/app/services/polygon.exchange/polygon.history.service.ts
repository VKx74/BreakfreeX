import {Injectable} from "@angular/core";
import {EExchange} from "../../models/common/exchange";
import {HistoryServiceBase} from "../../interfaces/exchange/history.service";
import {HttpClient} from "@angular/common/http";
import {EMarketType} from "../../models/common/marketType";
import {AppConfigService} from "../app.config.service";
import {IInstrument} from "@app/models/common/instrument";
import {Observable, of} from "rxjs";
import {ITick} from "@app/models/common/tick";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';

@Injectable()
export class PolygonHistoryService extends HistoryServiceBase {
    
    get ExchangeInstance(): EExchangeInstance {
        return EExchangeInstance.PolygonExchange;
    }

    constructor(protected _http: HttpClient) {
        super(_http);
        this._endpoint = `${AppConfigService.config.apiUrls.polygonREST}history`;
        this._supportedMarkets = [EMarketType.Crypto, EMarketType.Forex, EMarketType.Stocks];
    }

    getLastTrades(instrument: IInstrument): Observable<ITick[]> {
        return of([]);
    }
}
