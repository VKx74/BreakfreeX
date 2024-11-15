///<reference path="../healthcheck/healthable.ts"/>
import {Observable, throwError, of} from "rxjs";
import {EExchange} from "../../models/common/exchange";
import {IHistoryResponse} from "../../models/common/historyResponse";
import {IHealthable} from "../healthcheck/healthable";
import {EMarketType} from "../../models/common/marketType";
import {HttpClient, HttpParams} from "@angular/common/http";
import {HistoryHelperService} from "@app/helpers/history.helper.service";
import {IBarData} from "@app/models/common/barData";
import {IHistoryRequest} from "../../models/common/historyRequest";
import {catchError, map} from "rxjs/operators";
import {JsUtil} from "../../../utils/jsUtil";
import {ITick} from "@app/models/common/tick";
import {IInstrument} from "@app/models/common/instrument";
import { EExchangeInstance } from './exchange';

export enum HistoryRequestKind {
    DateRange = 'daterange',
    BarsCount = 'barscount'
}

export abstract class HistoryServiceBase implements IHealthable {
    protected _endpoint: string;
    protected _isHealthy: boolean = true;
    protected _supportedMarkets: EMarketType[] = [];
    private _historyCache: { [symbolName: string]: IHistoryResponse } = {};

    get supportedMarkets(): EMarketType[] {
        return this._supportedMarkets;
    }

    get isHealthy(): boolean {
        return this._isHealthy;
    }
    
    abstract get ExchangeInstance(): EExchangeInstance;

    constructor(protected _http: HttpClient) {

    }

    getHistory(request: IHistoryRequest): Observable<IHistoryResponse> {

        const cacheToken = request.cacheToken;
        if (cacheToken) {
            if (this._historyCache[cacheToken] && this._historyCache[cacheToken].data && this._historyCache[cacheToken].data.length) {
                return of(this._historyCache[cacheToken]);
            }
        }

        const timeDiff = request.endDate.getTime() - request.startDate.getTime();
        const granularity = HistoryHelperService.getGranularity(request.timeFrame);
        let maxBarAmount = granularity < 900 ? 5000 : 3000;
        if (timeDiff / 1000 / granularity > maxBarAmount) {
            request.startDate = new Date(request.endDate.getTime() - (granularity * maxBarAmount * 1000));
        }

        const params = new HttpParams()
            .append('kind', HistoryRequestKind.DateRange)
            .append('symbol', request.instrument.id)
            .append('exchange', request.instrument.exchange)
            .append('granularity', granularity.toString())
            .append('from', (request.startDate.getTime() / 1000).toFixed(0))
            .append('to', (request.endDate.getTime() / 1000).toFixed(0));

        return this._http.get<IHistoryResponse>(this._endpoint, { params: params }).pipe(catchError(error => {
            console.log('Failed to load history from: ' + this._endpoint);
            console.log(error);
            this._isHealthy = false;
            return throwError(error);
        }), map(response => {
            const result = this._mapResponse(response, request);
            if (cacheToken) {
                this._historyCache[cacheToken] = result;
            }
            return result;
        }));
    }

    getLastTrades(instrument: IInstrument): Observable<ITick[]> {
        const params = new HttpParams()
            .append('symbol', instrument.symbol);

        return this._http.get<ITick[]>(this._endpoint + 'executions', { params: params }).pipe(catchError(error => {
            console.log('Failed to load trades from: ' + this._endpoint);
            console.log(error);
            return throwError(error);
        }), map(response => this._mapTradesResponse(response, instrument)));
    }

    protected _mapResponse(response: any, request: IHistoryRequest): IHistoryResponse {
        const bars = response ? this._getBarsFromHistoryResponse(response) : null;

        if (!response || !bars) {
            return {
                request: request,
                data: []
            };
        }

        try {
            const result: IBarData[] = [];
            for (let i = 0; i < bars.length; i++) {
                const bar = bars[i];

                // Bars date in UTC timezone

                result.unshift({
                    date: JsUtil.UTCDate(bar.Timestamp * 1000),
                    low: bar.Low,
                    high: bar.High,
                    open: bar.Open,
                    close: bar.Close,
                    volume: bar.Volume
                });
            }

            return {
                request: request,
                data: HistoryHelperService.combineResponse(request, result).reverse()
            };

        } catch (ex) {
            console.log('Failed to parse history from: ' + this._endpoint);
            console.log(ex);
            return {
                request: request,
                data: []
            };
        }
    }

    protected _getBarsFromHistoryResponse(response: any): any[] {
        return response.Data ? response.Data.Bars : response.Bars;

    }

    protected _mapTradesResponse(response: any, instrument: IInstrument): ITick[] {
        if (!response) {
            return [];
        }

        try {
            const ticks = response;
            const result: ITick[] = [];
            for (let i = 0; i < ticks.length; i++) {
                const tick = ticks[i];
                result.unshift({
                    instrument: instrument,
                    price: Number(tick.Price),
                    volume: Number(tick.Size),
                    side: tick.Side,
                    time: tick.Time ? new Date(tick.Time * 1000).getTime() : new Date().getTime()
                });
            }

            return result;

        } catch (ex) {
            console.log('Failed to parse history from: ' + this._endpoint);
            console.log(ex);
            return [];
        }
    }
}
