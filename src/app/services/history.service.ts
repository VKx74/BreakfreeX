import { Observable, of } from "rxjs";
import { Injectable } from "@angular/core";
import { EExchange } from "../models/common/exchange";
import { HistoryServiceBase } from "../interfaces/exchange/history.service";
import { IHistoryByBackBarsCountRequest, IHistoryRequest } from "../models/common/historyRequest";
import { IHistoryResponse } from "../models/common/historyResponse";
import { IHealthable } from "../interfaces/healthcheck/healthable";
import { TimeZoneManager, TzUtils, UTCTimeZone } from "TimeZones";
import { map } from "rxjs/operators";
import { APP_TYPE_EXCHANGES } from "../enums/ApplicationType";
import { ExchangeFactory } from "../factories/exchange.factory";
import { IInstrument } from "@app/models/common/instrument";
import { ITick } from "@app/models/common/tick";
import { TimeFrameHelper } from "@app/helpers/timeFrame.helper";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { IBarData } from "@app/models/common/barData";

@Injectable()
export class HistoryService implements IHealthable {
    private services: HistoryServiceBase[] = [];

    public get isHealthy(): boolean {
        let _isHealthy = true;

        for (let i = 0; i < this.services.length; i++) {
            if (!this.services[i].isHealthy) {
                _isHealthy = false;
                break;
            }
        }

        return _isHealthy;
    }

    constructor(private _timeZoneManager: TimeZoneManager,
        private exchangeFactory: ExchangeFactory) {
        this._init();
    }

    private _init() {
        setTimeout(() => {
            APP_TYPE_EXCHANGES.forEach(value => {
                this.exchangeFactory.tryCreateHistoryServiceInstance(value).subscribe(result => {
                    if (result.serviceInstance && result.result) {
                        this.services.push(result.serviceInstance);
                    } else {
                        console.table(result);
                    }
                }, error => {
                    console.table(error);
                });
            });
        });
    }

    getHistory(request: IHistoryRequest): Observable<IHistoryResponse> {
        const service = this._getServiceByDatafeed(request.instrument.datafeed);
        if (!service) {
            return of({
                request: request,
                data: []
            } as IHistoryResponse);
        }

        return service.getHistory(request)
            .pipe(
                map((resp) => {
                    const pricePrecision = !request.instrument.tickSizeCorrect ? this._calculatePricePrecision(resp.data) : request.instrument.tickSize;
                    return {
                        ...resp,
                        data: resp.data.map((b) => ({
                            ...b,
                            date: TzUtils.convertDateTz(b.date, UTCTimeZone, this._timeZoneManager.timeZone)
                        })),
                        pricePrecision: pricePrecision
                    };
                })
            );
    }

    getHistoryByBackBarsCount(request: IHistoryByBackBarsCountRequest): Observable<IHistoryResponse> {
        return this.getHistory({
            instrument: request.instrument,
            timeFrame: request.timeFrame,
            endDate: request.endDate,
            startDate: new Date(request.endDate.getTime() - (request.barsCount * TimeFrameHelper.timeFrameToInterval(request.timeFrame)))
        });
    }

    getLastTrades(instrument: IInstrument): Observable<ITick[]> {
        const service = this._getServiceByDatafeed(instrument.datafeed);

        if (!service) {
            return of([]);
        }
        return service.getLastTrades(instrument);
    }

    private _convertRequestDateRange(request: IHistoryRequest): IHistoryRequest {
        const timeZone = this._timeZoneManager.timeZone;

        return {
            instrument: request.instrument,
            timeFrame: request.timeFrame,
            startDate: TzUtils.convertDateTz(request.startDate, timeZone, UTCTimeZone),
            endDate: TzUtils.convertDateTz(request.endDate, timeZone, UTCTimeZone)
        };
    }

    private _getServiceByDatafeed(datafeed: EExchangeInstance): HistoryServiceBase {
        for (let i = 0; i < this.services.length; i++) {
            if (this.services[i].ExchangeInstance === datafeed) {
                return this.services[i];
            }
        }
    }

    private _calculatePricePrecision(bars: IBarData[]) {
        let pricePrecision = 0;

        if (bars != null && bars.length > 0) {
            bars.forEach(bar => {
                let price = `${bar.close}`.split('.');
                if (price.length === 2 && pricePrecision < price[1].length) {
                    let decimals = price[1].length;
                    if (decimals > pricePrecision) {
                        pricePrecision = decimals;
                    }
                }
            });
        }

        if (pricePrecision > 8) {
            pricePrecision = 8;
        }
        return pricePrecision;
    }
}
