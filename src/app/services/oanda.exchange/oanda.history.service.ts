import {Observable, of} from "rxjs";
import {Injectable} from "@angular/core";
import {EExchange} from "../../models/common/exchange";
import {HistoryServiceBase} from "../../interfaces/exchange/history.service";
import {HttpClient} from "@angular/common/http";
import {EMarketType} from "../../models/common/marketType";
import {AppConfigService} from "../app.config.service";
import {IInstrument} from "@app/models/common/instrument";
import {ITick} from "@app/models/common/tick";

@Injectable()
export class OandaHistoryService extends HistoryServiceBase {

    constructor(protected _http: HttpClient) {
        super(_http);
        this._endpoint = `${AppConfigService.config.apiUrls.oandabrokerREST}history`;
        this._supportedExchanges = [EExchange.Oanda];
        this._supportedMarkets = [EMarketType.Forex];
    }

    getLastTrades(instrument: IInstrument): Observable<ITick[]> {
        return of([]);
    }
}
