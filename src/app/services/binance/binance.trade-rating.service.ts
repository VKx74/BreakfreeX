import { TimeSpan } from "@app/helpers/timeFrame.helper";
import { OrderValidationChecklist, OrderValidationChecklistInput } from "modules/Trading/models/crypto/shared/order.validation";
import { MTSymbolTradeInfoResponse } from "modules/Trading/models/forex/mt/mt.communication";
import { MTMarketOrderRecommendation, MTOrder, MTOrderRecommendation, MTOrderRecommendationType, MTPendingOrderRecommendation, MTPosition, MTPositionRecommendation, RTDTrendStrength } from "modules/Trading/models/forex/mt/mt.models";
import { OrderSide, OrderTypes, RiskClass, RiskType } from "modules/Trading/models/models";
import { Observable, of, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { AlgoService, IBFTAMarketInfoData, IBFTATrend } from "../algo.service";
import { BinanceFuturesBroker } from "../binance-futures/binance-futures.broker";
import { InstrumentMappingService } from "../instrument-mapping.service";
import { TradingHelper } from "../mt/mt.helper";
import { RealtimeService } from "../realtime.service";
import { BinanceBroker } from "./binance.broker";

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

    constructor(protected broker: BinanceBroker | BinanceFuturesBroker, protected algoService: AlgoService, protected mappingService: InstrumentMappingService) {
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

        if (marketInfo) {
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
        }

        // if (symbolTradeInfo && symbolTradeInfo.Data) {
        //     let price = parameters.Price || (symbolTradeInfo.Data.Bid + symbolTradeInfo.Data.Ask) / 2;
        //     let contractSize = symbolTradeInfo.Data.ContractSize;
        //     let rate = symbolTradeInfo.Data.Rate;
        //     let cvar = symbolTradeInfo.Data.CVaR;
        //     let bid = symbolTradeInfo.Data.Bid;
        //     let ask = symbolTradeInfo.Data.Ask;
        //     if (price) {
        //         if (parameters.SL) {
        //             result.OrderRiskValue = TradingHelper.buildRiskByPrice(contractSize, rate, parameters.Size, price, parameters.SL, this.mtBroker.accountInfo.Balance);
        //         } else if (cvar) {
        //             result.OrderRiskValue = TradingHelper.buildRiskByVAR(contractSize, rate, parameters.Size, price, cvar, this.mtBroker.accountInfo.Balance);
        //         }
        //     }

        //     if (bid && ask) {
        //         result.SpreadRiskValue = Math.abs(bid - ask) / Math.min(bid, ask) * 100;
        //         if (marketInfo.instrument) {
        //             const key = `${marketInfo.instrument.id}${marketInfo.instrument.datafeed}`;
        //             const priceSpreadCache = this._tryGetPriceSpreadFromCache(key);

        //             if (priceSpreadCache) {
        //                 result.FeedBrokerSpread = priceSpreadCache.spread;
        //                 result.FeedBrokerSpreadValue = priceSpreadCache.spreadValue;
        //             } else {
        //                 let lastTick = this._realtimeService.getLastTick(marketInfo.instrument);
        //                 let lastPrice = lastTick ? lastTick.price : null;
        //                 if (!lastPrice) {

        //                     if (parameters.LastPrice) {
        //                         lastPrice = parameters.LastPrice;
        //                     } else {
        //                         lastPrice = marketInfo.data.last_price;
        //                     }
        //                 }

        //                 if (lastPrice) {
        //                     let avg = (bid + ask) / 2;
        //                     let spread = Math.abs(avg - lastPrice) / lastPrice * 100;
        //                     let spreadValue = avg - lastPrice;

        //                     result.FeedBrokerSpread = spread;
        //                     result.FeedBrokerSpreadValue = spreadValue;

        //                     this._tryAddPriceSpreadToCache(key, {
        //                         spread: spread,
        //                         spreadValue: spreadValue
        //                     });
        //                 }
        //             }
        //         }

        //     }

        //     result.cVar = symbolTradeInfo.Data.CVaR;

        //     if (!result.isSLReversed && parameters.SL && parameters.Price && result.cVar) {
        //         let allowedMinDiff = parameters.Price / 100 * result.cVar;
        //         let allowedMaxDiff = parameters.Price / 100 * result.cVar;
        //         let hour = TimeSpan.MILLISECONDS_IN_HOUR / 1000;

        //         if (parameters.Timeframe && parameters.Timeframe <= hour) {
        //             allowedMinDiff = allowedMinDiff / 12;
        //             allowedMaxDiff = allowedMaxDiff * 2;
        //         } else if (parameters.Timeframe && parameters.Timeframe <= hour * 4) {
        //             allowedMinDiff = allowedMinDiff / 8;
        //             allowedMaxDiff = allowedMaxDiff * 3;
        //         } else if (parameters.Timeframe && parameters.Timeframe <= hour * 24) {
        //             allowedMinDiff = allowedMinDiff / 4;
        //             allowedMaxDiff = allowedMaxDiff * 6;
        //         } else {
        //             allowedMinDiff = allowedMinDiff / 2;
        //             allowedMaxDiff = allowedMaxDiff * 12;
        //         }

        //         let slToPriceDiff = Math.abs(parameters.SL - parameters.Price);

        //         if (slToPriceDiff <= allowedMinDiff) {
        //             result.isSLToClose = true;
        //         }

        //         if (slToPriceDiff >= allowedMaxDiff) {
        //             result.isSLToFare = true;
        //         }
        //     }
        // }

        // let positionRisk = this.mtBroker.getSamePositionsRisk(parameters.Symbol, parameters.Side);
        // let correlatedRisk = this.mtBroker.getRelatedPositionsRisk(parameters.Symbol, parameters.Side);
        // result.CorrelatedRiskValue = Math.abs((correlatedRisk / this.mtBroker.accountInfo.Balance * 100) + result.OrderRiskValue);
        // result.PositionRiskValue = Math.abs((positionRisk / this.mtBroker.accountInfo.Balance * 100) + result.OrderRiskValue);
        // if (Number.isNaN(result.CorrelatedRiskValue)) {
        //     result.CorrelatedRiskValue = 0;
        // }

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