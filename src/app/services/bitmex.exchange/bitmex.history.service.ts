import {Injectable} from "@angular/core";
import {EExchange} from "../../models/common/exchange";
import {HistoryServiceBase} from "../../interfaces/exchange/history.service";
import {HttpClient} from "@angular/common/http";
import {EMarketType} from "../../models/common/marketType";
import {AppConfigService} from "../app.config.service";
import {IInstrument} from "@app/models/common/instrument";
import {Observable, of} from "rxjs";
import {ITick} from "@app/models/common/tick";

@Injectable()
export class BitmexHistoryService extends HistoryServiceBase {
    constructor(protected _http: HttpClient) {
        super(_http);
        this._endpoint = `${AppConfigService.config.apiUrls.bitmexREST}history`;
        this._supportedExchanges = [EExchange.Bitmex];
        this._supportedMarkets = [EMarketType.Crypto];
    }

    getLastTrades(instrument: IInstrument): Observable<ITick[]> {
        return of([]);
    }
}
