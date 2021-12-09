import { TimeSpan } from "@app/helpers/timeFrame.helper";
import { IBroker, ICryptoBroker } from "@app/interfaces/broker/broker";
import { OrderValidationChecklist, OrderValidationChecklistInput } from "modules/Trading/models/crypto/shared/order.validation";
import { OrderSide } from "modules/Trading/models/models";
import { Observable, of, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { AlgoService, IBFTAMarketInfoData, IBFTATrend } from "../algo.service";
import { InstrumentMappingService } from "../instrument-mapping.service";
import { TradingHelper } from "../mt/mt.helper";

interface CacheItem<T> {
    Data: T;
    Time: number;
}

interface PriceSpreadCache {
    spread: number;
    spreadValue: number;
}

export class BinanceTradeRatingService {
    protected _marketInfoCache: { [symbol: string]: CacheItem<IBFTAMarketInfoData>; } = {};
    protected _priceSpreadCache: { [symbol: string]: CacheItem<PriceSpreadCache>; } = {};
    protected _marketInfoLoading: { [symbol: string]: boolean; } = {};
    protected _timeInterval: any;

    constructor(protected broker: ICryptoBroker, protected algoService: AlgoService, protected mappingService: InstrumentMappingService) {
        this._timeInterval = setInterval(() => {
            const dtNow = new Date().getTime();

            for (const key of Object.keys(this._marketInfoCache)) {
                if (this._marketInfoCache[key] && this._marketInfoCache[key].Time) {
                    const minDiff = (dtNow - this._marketInfoCache[key].Time) / 1000 / 60;
                    if (minDiff > 10) {
                        delete this._marketInfoCache[key];
                    }
                }
            }

            for (const key of Object.keys(this._priceSpreadCache)) {
                if (this._priceSpreadCache[key] && this._priceSpreadCache[key].Time) {
                    const minDiff = (dtNow - this._priceSpreadCache[key].Time) / 1000 / 60;
                    if (minDiff > 10) {
                        delete this._priceSpreadCache[key];
                    }
                }
            }
        }, 1000 * 60 * 1);

        this.mappingService.mappingChanged.subscribe(() => {
            this._marketInfoCache = {};
        });

    }

    public calculateOrderChecklist(parameters: OrderValidationChecklistInput): Observable<OrderValidationChecklist> {
        const symbol = parameters.Symbol;
        const timeframe = parameters.Timeframe;
        let marketInfo = this._tryGetMarketInfoFromCache(symbol, timeframe);
        if (!marketInfo) {
            marketInfo = this.algoService.getMarketInfo(symbol, timeframe);
        }

        return combineLatest([marketInfo]).pipe(map(([res1]) => {
            this._tryAddMarketInfoToCache(symbol, timeframe, res1 || null);
            return this._calculateOrderChecklist(res1, parameters);
        }));
    }

    protected _getOrLoadMarketInfo(symbol: string, timeframe: number): IBFTAMarketInfoData {
        const key = this._getMarketInfoKey(symbol, timeframe);
        if (!this._marketInfoCache[key]) {
            if (!this._marketInfoLoading[key]) {
                this._marketInfoLoading[key] = true;
                this.algoService.getMarketInfo(symbol, timeframe).subscribe((data) => {
                    this._tryAddMarketInfoToCache(symbol, timeframe, data || null);
                    this._marketInfoLoading[key] = false;
                });
            }
            return undefined;
        }
        return this._marketInfoCache[key].Data;
    }

    protected _calculateOrderChecklist(marketInfo: IBFTAMarketInfoData, parameters: OrderValidationChecklistInput): OrderValidationChecklist {
        let result: OrderValidationChecklist = {};

        if (parameters.SL && parameters.Price) {
            if (parameters.Side === OrderSide.Buy && parameters.SL >= parameters.Price) {
                result.isSLReversed = true;
            }
            if (parameters.Side === OrderSide.Sell && parameters.SL <= parameters.Price) {
                result.isSLReversed = true;
            }
        }

        if (!marketInfo) {
            return result;
        }
        const marketInfoData = marketInfo.data;
        let allowedDiff = Math.abs(marketInfoData.natural - marketInfoData.support) / 3;
        let minGranularity = TimeSpan.MILLISECONDS_IN_MINUTE / 1000 * 15;
        let price = parameters.Price ? parameters.Price : marketInfoData.last_price;

        if (parameters.Side === OrderSide.Buy) {
            result.GlobalRTD = marketInfoData.global_trend === IBFTATrend.Up;
            result.LocalRTD = marketInfoData.local_trend === IBFTATrend.Up;

            let priceToTargetDiff = Math.abs(marketInfoData.resistance - price);
            if (parameters.Timeframe >= minGranularity && (price >= marketInfoData.resistance || allowedDiff > priceToTargetDiff)) {
                result.Levels = false;
            } else {
                result.Levels = true;
            }
        } else {
            result.GlobalRTD = marketInfoData.global_trend === IBFTATrend.Down;
            result.LocalRTD = marketInfoData.local_trend === IBFTATrend.Down;

            let priceToTargetDiff = Math.abs(marketInfoData.support - price);
            if (parameters.Timeframe >= minGranularity && (price <= marketInfoData.support || allowedDiff > priceToTargetDiff)) {
                result.Levels = false;
            } else {
                result.Levels = true;
            }
        }

        result.GlobalRTDValue = marketInfoData.global_trend;
        result.LocalRTDValue = marketInfoData.local_trend;
        result.LocalRTDSpread = marketInfoData.local_trend_spread;
        result.GlobalRTDSpread = marketInfoData.global_trend_spread;

        result.GlobalRTDTrendStrength = TradingHelper.convertTrendSpread(marketInfoData.global_trend_spread);
        result.LocalRTDTrendStrength = TradingHelper.convertTrendSpread(marketInfoData.local_trend_spread);

        let cvar = marketInfoData.cvar;
        let balance = this.broker.getPairBalance(parameters.Symbol);
        result.cVar = cvar;

        if (price && balance) {
            if (parameters.SL) {
                result.OrderRiskValue = TradingHelper.buildRiskByPrice(1, 1, parameters.Size, price, parameters.SL, balance);
            } else if (cvar) {
                result.OrderRiskValue = TradingHelper.buildRiskByVAR(1, 1, parameters.Size, price, cvar, balance);
            }
        }

        if (!result.isSLReversed && parameters.SL && parameters.Price && result.cVar) {
            let allowedMinDiff = parameters.Price / 100 * result.cVar;
            let allowedMaxDiff = parameters.Price / 100 * result.cVar;
            let hour = TimeSpan.MILLISECONDS_IN_HOUR / 1000;

            if (parameters.Timeframe && parameters.Timeframe <= hour) {
                allowedMinDiff = allowedMinDiff / 12;
                allowedMaxDiff = allowedMaxDiff * 2;
            } else if (parameters.Timeframe && parameters.Timeframe <= hour * 4) {
                allowedMinDiff = allowedMinDiff / 8;
                allowedMaxDiff = allowedMaxDiff * 3;
            } else if (parameters.Timeframe && parameters.Timeframe <= hour * 24) {
                allowedMinDiff = allowedMinDiff / 4;
                allowedMaxDiff = allowedMaxDiff * 6;
            } else {
                allowedMinDiff = allowedMinDiff / 2;
                allowedMaxDiff = allowedMaxDiff * 12;
            }

            let slToPriceDiff = Math.abs(parameters.SL - parameters.Price);

            if (slToPriceDiff <= allowedMinDiff) {
                result.isSLToClose = true;
            }

            if (slToPriceDiff >= allowedMaxDiff) {
                result.isSLToFare = true;
            }
        }

        if (!result.OrderRiskValue) {
            result.OrderRiskValue = 0;
        }

        let positionRisk = this.broker.getSamePositionsRisk(parameters.Symbol, parameters.Side);
        let correlatedRisk = this.broker.getRelatedPositionsRisk(parameters.Symbol, parameters.Side);
        result.CorrelatedRiskValue = Math.abs((correlatedRisk / balance * 100) + result.OrderRiskValue);
        result.PositionRiskValue = Math.abs((positionRisk / balance * 100) + result.OrderRiskValue);
        if (Number.isNaN(result.CorrelatedRiskValue)) {
            result.CorrelatedRiskValue = 0;
        }

        return result;
    }

    protected _tryGetPriceSpreadFromCache(instrument: string): PriceSpreadCache {
        if (this._priceSpreadCache[instrument]) {
            return this._priceSpreadCache[instrument].Data;
        }

        return null;
    }

    protected _tryAddPriceSpreadToCache(instrument: string, data: PriceSpreadCache) {
        this._priceSpreadCache[instrument] = {
            Data: data,
            Time: new Date().getTime()
        };
    }

    protected _tryGetMarketInfoFromCache(instrument: string, timeframe: number): Observable<IBFTAMarketInfoData> {
        const key = this._getMarketInfoKey(instrument, timeframe);
        if (this._marketInfoCache[key]) {
            return of(this._marketInfoCache[key].Data);
        }

        return null;
    }

    protected _tryAddMarketInfoToCache(instrument: string, timeframe: number, data: IBFTAMarketInfoData) {
        const key = this._getMarketInfoKey(instrument, timeframe);
        this._marketInfoCache[key] = {
            Data: data,
            Time: new Date().getTime()
        };
    }

    protected _getMarketInfoKey(symbol: string, timeframe: number): string {
        return `${symbol}${timeframe}`;
    }
}