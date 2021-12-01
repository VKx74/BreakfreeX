import { TimeSpan } from "@app/helpers/timeFrame.helper";
import { OrderValidationChecklist, OrderValidationChecklistInput } from "modules/Trading/models/crypto/shared/order.validation";
import { MTSymbolTradeInfoResponse } from "modules/Trading/models/forex/mt/mt.communication";
import { MTMarketOrderRecommendation, MTOrder, MTOrderRecommendation, MTOrderRecommendationType, MTPendingOrderRecommendation, MTPosition, MTPositionRecommendation, RTDTrendStrength } from "modules/Trading/models/forex/mt/mt.models";
import { OrderSide, OrderTypes, RiskClass, RiskType } from "modules/Trading/models/models";
import { Observable, of, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { AlgoService, IBFTAMarketInfoData, IBFTATrend } from "../algo.service";
import { InstrumentMappingService } from "../instrument-mapping.service";
import { RealtimeService } from "../realtime.service";
import { MTBroker } from "./mt.broker";
import { TradingHelper } from "./mt.helper";

interface CacheItem<T> {
    Data: T;
    Time: number;
}

interface PriceSpreadCache {
    spread: number;
    spreadValue: number;
}

export class MTTradeRatingService {
    protected _symbolTradeInfoCache: { [symbol: string]: CacheItem<MTSymbolTradeInfoResponse>; } = {};
    protected _marketInfoCache: { [symbol: string]: CacheItem<IBFTAMarketInfoData>; } = {};
    protected _priceSpreadCache: { [symbol: string]: CacheItem<PriceSpreadCache>; } = {};
    protected _marketInfoLoading: { [symbol: string]: boolean; } = {};
    protected _timeInterval: any;

    constructor(protected mtBroker: MTBroker, protected algoService: AlgoService, protected mappingService: InstrumentMappingService, protected _realtimeService: RealtimeService) {
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

            for (const key of Object.keys(this._symbolTradeInfoCache)) {
                if (this._symbolTradeInfoCache[key] && this._symbolTradeInfoCache[key].Time) {
                    const minDiff = (dtNow - this._symbolTradeInfoCache[key].Time) / 1000 / 60;
                    if (minDiff > 10) {
                        delete this._symbolTradeInfoCache[key];
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

        let symbolTradeInfo = this._tryGetSymbolTradeInfoFromCache(parameters.Symbol);
        if (!symbolTradeInfo) {
            symbolTradeInfo = this.mtBroker.getSymbolTradeInfo(parameters.Symbol);
        }

        return combineLatest([marketInfo, symbolTradeInfo]).pipe(map(([res1, res2]) => {
            this._tryAddMarketInfoToCache(symbol, timeframe, res1 || null);

            if (res2 && res2.Data && res2.Data.CVaR && res2.Data.ContractSize && res2.Data.Rate) {
                this._tryAddSymbolTradeInfoToCache(parameters.Symbol, res2);
            }

            return this._calculateOrderChecklist(res1, res2, parameters);
        }));
    }

    public calculatePendingOrderRecommendations(order: MTOrder): MTPendingOrderRecommendation {
        let res = this._createOrderRecommendationBase(order) as MTPendingOrderRecommendation;

        if (!res) {
            return res;
        }

        res.FailedChecks = [];

        if (res.GlobalRTD !== null && !res.GlobalRTD) {
            res.FailedChecks.push({
                Issue: "Trading against global trend",
                Recommendation: "Cancel Order",
                RiskClass: RiskClass.Medium,
                RiskType: RiskType.WrongTrend
            });
        }

        if (res.LocalRTDValue !== null && !res.LocalRTDValue) {
            if (res.Timeframe <= 60 * 60) {
                if (res.LocalRTDTrendStrength !== RTDTrendStrength.Weak) {
                    res.FailedChecks.push({
                        Issue: "Trading against local trend",
                        Recommendation: "Cancel Order",
                        RiskClass: RiskClass.Low,
                        RiskType: RiskType.WrongTrend
                    });
                }
            } else if (!res.Timeframe || res.Timeframe <= 60 * 60 * 4) {
                if (res.LocalRTDTrendStrength === RTDTrendStrength.Strong) {
                    res.FailedChecks.push({
                        Issue: "Trading against strong local trend",
                        Recommendation: "Cancel Order",
                        RiskClass: RiskClass.Medium,
                        RiskType: RiskType.WrongTrend
                    });
                }
            }
        }

        if (res.IsRTDOverhit === true) {
            if (res.Timeframe < 60 * 60 * 24) {
                res.FailedChecks.push({
                    Issue: "Trading against reversing of trends",
                    Recommendation: "Cancel Order",
                    RiskClass: RiskClass.Medium,
                    RiskType: RiskType.WrongTrend
                });
            }
        }

        if (order.ProfitRate) {
            if (order.Price && order.SL && order.TP && order.CurrentPrice) {
                const logicalOrderBounds = Math.abs(order.SL - order.TP) * 1.5;
                const priceDiff = Math.abs(order.Price - order.CurrentPrice);
                if (logicalOrderBounds < priceDiff) {
                    res.FailedChecks.push({
                        Issue: "Market too far from entry",
                        Recommendation: "Cancel Order",
                        RiskClass: RiskClass.Low,
                        RiskType: RiskType.PriceFarFromEntry
                    });
                }
            } else if (order.Price && order.SL && order.CurrentPrice) {
                const logicalOrderBounds = Math.abs(order.SL - order.Price) * 2;
                const priceDiff = Math.abs(order.Price - order.CurrentPrice);
                if (logicalOrderBounds < priceDiff) {
                    res.FailedChecks.push({
                        Issue: "Market too far from entry",
                        Recommendation: "Cancel Order",
                        RiskClass: RiskClass.Low,
                        RiskType: RiskType.PriceFarFromEntry
                    });
                }
            }
        }

        const riskClass = TradingHelper.convertValueToAssetRiskClass(order.RiskPercentage);
        if (riskClass === RiskClass.High || riskClass === RiskClass.Extreme) {
            res.FailedChecks.push({
                Issue: "High leverage",
                Recommendation: "Stop gambling, reduce position size or cancel this order",
                RiskClass: riskClass,
                RiskType: RiskType.HighRisk
            });
        }

        if (!order.SL) {
            res.FailedChecks.push({
                Issue: "No stoploss set",
                Recommendation: "Set stoploss for this order",
                RiskClass: RiskClass.Medium,
                RiskType: RiskType.SLNotSet
            });
        }

        return res;
    }

    public calculateMarketOrderRecommendations(order: MTOrder): MTMarketOrderRecommendation {
        let res = this._createOrderRecommendationBase(order) as MTMarketOrderRecommendation;

        if (!res) {
            return res;
        }

        res.FailedChecks = [];

        const breakevenRecommendation = order.NetPL > 0 ? "Move SL to breakeven" : "Move TP to breakeven";

        if (res.GlobalRTD !== null && !res.GlobalRTD) {
            res.FailedChecks.push({
                Issue: "Trading against global trend",
                Recommendation: breakevenRecommendation,
                RiskClass: RiskClass.High,
                RiskType: RiskType.WrongTrend
            });
        }

        if (res.LocalRTDValue !== null && !res.LocalRTDValue) {
            if (res.Timeframe <= 60 * 60) {
                if (res.LocalRTDTrendStrength !== RTDTrendStrength.Weak) {
                    res.FailedChecks.push({
                        Issue: "Trading against local trend",
                        Recommendation: breakevenRecommendation,
                        RiskClass: RiskClass.Medium,
                        RiskType: RiskType.WrongTrend
                    });
                }
            } else if (!res.Timeframe || res.Timeframe <= 60 * 60 * 4) {
                if (res.LocalRTDTrendStrength === RTDTrendStrength.Strong) {
                    res.FailedChecks.push({
                        Issue: "Trading against strong local trend",
                        Recommendation: breakevenRecommendation,
                        RiskClass: RiskClass.High,
                        RiskType: RiskType.WrongTrend
                    });
                }
            }
        }

        if (res.IsRTDOverhit === true) {
            if (res.Timeframe < 60 * 60 * 24) {
                res.FailedChecks.push({
                    Issue: "Trading against reversing of trends",
                    Recommendation: breakevenRecommendation,
                    RiskClass: RiskClass.Medium,
                    RiskType: RiskType.WrongTrend
                });
            }
        }

        if (!order.SL) {
            res.FailedChecks.push({
                Issue: "No stoploss set",
                Recommendation: "Set stoploss for this order",
                RiskClass: RiskClass.Medium,
                RiskType: RiskType.SLNotSet
            });
        }

        const riskClass = TradingHelper.convertValueToAssetRiskClass(order.RiskPercentage);
        if (riskClass === RiskClass.High || riskClass === RiskClass.Extreme) {
            res.FailedChecks.push({
                Issue: "High leverage",
                Recommendation: "Stop gambling, reduce position size or cancel this order",
                RiskClass: riskClass,
                RiskType: RiskType.HighRisk
            });
        }

        return res;
    }

    public calculatePositionRecommendations(position: MTPosition): MTPositionRecommendation {
        let res = this._createPositionsRecommendationBase(position) as MTPositionRecommendation;

        if (!res) {
            return res;
        }

        res.FailedChecks = [];

        const breakevenRecommendation = position.NetPL > 0 ? "Move SLs to breakeven" : "Move TPs to breakeven";

        if (res.GlobalRTD !== null && !res.GlobalRTD) {
            res.FailedChecks.push({
                Issue: "Trading against global trend",
                Recommendation: breakevenRecommendation,
                RiskClass: RiskClass.High,
                RiskType: RiskType.WrongTrend
            });
        }

        if (res.LocalRTDValue !== null && !res.LocalRTDValue) {
            if (res.Timeframe <= 60 * 60) {
                if (res.LocalRTDTrendStrength !== RTDTrendStrength.Weak) {
                    res.FailedChecks.push({
                        Issue: "Trading against local trend",
                        Recommendation: breakevenRecommendation,
                        RiskClass: RiskClass.Medium,
                        RiskType: RiskType.WrongTrend
                    });
                }
            } else {
                if (res.LocalRTDTrendStrength === RTDTrendStrength.Strong) {
                    res.FailedChecks.push({
                        Issue: "Trading against strong local trend",
                        Recommendation: breakevenRecommendation,
                        RiskClass: RiskClass.High,
                        RiskType: RiskType.WrongTrend
                    });
                }
            }
        }

        const riskClass = TradingHelper.convertValueToAssetRiskClass(position.RiskPercentage);
        if (riskClass === RiskClass.High || riskClass === RiskClass.Extreme) {
            res.FailedChecks.push({
                Issue: "High leverage",
                Recommendation: "Stop gambling, reduce position size or cancel this order",
                RiskClass: riskClass,
                RiskType: RiskType.HighRisk
            });
        }

        return res;
    }

    private _createOrderRecommendationBase(order: MTOrder): MTOrderRecommendation {
        const symbol = order.Symbol;
        const tradeType = TradingHelper.getTradeTypeFromTechnicalComment(order.Comment);
        const timeframe = TradingHelper.getTradeTimeframeFromTechnicalComment(order.Comment);

        const marketInfo = this._getOrLoadMarketInfo(symbol, timeframe);
        if (marketInfo === undefined) {
            return undefined;
        }

        if (marketInfo === null) {
            return {
                GlobalRTD: null,
                LocalRTD: null,
                GlobalRTDValue: null,
                LocalRTDValue: null,
                GlobalRTDSpread: null,
                LocalRTDSpread: null,
                GlobalRTDTrendStrength: null,
                LocalRTDTrendStrength: null,
                IsRTDOverhit: null,
                Timeframe: timeframe,
                OrderTradeType: tradeType,
                Type: order.Type === OrderTypes.Market ? MTOrderRecommendationType.Active : MTOrderRecommendationType.Pending
            };
        }

        const marketInfoData = marketInfo.data;
        const globalRTDValue = marketInfoData.global_trend;
        const localRTDValue = marketInfoData.local_trend;
        const localRTDSpread = marketInfoData.local_trend_spread;
        const globalRTDSpread = marketInfoData.global_trend_spread;
        const isOverhit = marketInfoData.is_overhit;
        const globalRTDTrendStrength = TradingHelper.convertTrendSpread(marketInfoData.global_trend_spread);
        const localRTDTrendStrength = TradingHelper.convertTrendSpread(marketInfoData.local_trend_spread);

        let globalRTD = marketInfoData.global_trend === IBFTATrend.Up;
        let localRTD = marketInfoData.local_trend === IBFTATrend.Up;
        if (order.Side === OrderSide.Sell) {
            globalRTD = marketInfoData.global_trend === IBFTATrend.Down;
            localRTD = marketInfoData.local_trend === IBFTATrend.Down;
        }

        let res: MTOrderRecommendation = {
            GlobalRTD: globalRTD,
            LocalRTD: localRTD,
            IsRTDOverhit: isOverhit,
            GlobalRTDValue: globalRTDValue,
            LocalRTDValue: localRTDValue,
            GlobalRTDSpread: globalRTDSpread,
            LocalRTDSpread: localRTDSpread,
            GlobalRTDTrendStrength: globalRTDTrendStrength,
            LocalRTDTrendStrength: localRTDTrendStrength,
            Timeframe: timeframe,
            OrderTradeType: tradeType,
            Type: order.Type === OrderTypes.Market ? MTOrderRecommendationType.Active : MTOrderRecommendationType.Pending
        };

        return res;
    }

    private _createPositionsRecommendationBase(position: MTPosition): MTOrderRecommendation {
        const symbol = position.Symbol;
        let timeframe = null;
        for (const marketOrder of this.mtBroker.marketOrders) {
            if (marketOrder.Symbol !== position.Symbol) {
                continue;
            }

            timeframe = TradingHelper.getTradeTimeframeFromTechnicalComment(marketOrder.Comment);
            if (timeframe) {
                break;
            }
        }

        const marketInfo = this._getOrLoadMarketInfo(symbol, timeframe);
        if (marketInfo === undefined) {
            return undefined;
        }
        if (marketInfo === null) {
            return {
                GlobalRTD: null,
                LocalRTD: null,
                GlobalRTDValue: null,
                LocalRTDValue: null,
                GlobalRTDSpread: null,
                LocalRTDSpread: null,
                GlobalRTDTrendStrength: null,
                LocalRTDTrendStrength: null,
                Timeframe: null,
                OrderTradeType: null,
                IsRTDOverhit: null,
                Type: MTOrderRecommendationType.Active
            };
        }
        const marketInfoData = marketInfo.data;
        const globalRTDValue = marketInfoData.global_trend;
        const localRTDValue = marketInfoData.local_trend;
        const localRTDSpread = marketInfoData.local_trend_spread;
        const globalRTDSpread = marketInfoData.global_trend_spread;
        const isOverhit = marketInfoData.is_overhit;
        const globalRTDTrendStrength = TradingHelper.convertTrendSpread(marketInfoData.global_trend_spread);
        const localRTDTrendStrength = TradingHelper.convertTrendSpread(marketInfoData.local_trend_spread);

        let globalRTD = marketInfoData.global_trend === IBFTATrend.Up;
        let localRTD = marketInfoData.local_trend === IBFTATrend.Up;
        if (position.Side === OrderSide.Sell) {
            globalRTD = marketInfoData.global_trend === IBFTATrend.Down;
            localRTD = marketInfoData.local_trend === IBFTATrend.Down;
        }

        let res: MTOrderRecommendation = {
            GlobalRTD: globalRTD,
            LocalRTD: localRTD,
            IsRTDOverhit: isOverhit,
            GlobalRTDValue: globalRTDValue,
            LocalRTDValue: localRTDValue,
            GlobalRTDSpread: globalRTDSpread,
            LocalRTDSpread: localRTDSpread,
            GlobalRTDTrendStrength: globalRTDTrendStrength,
            LocalRTDTrendStrength: localRTDTrendStrength,
            Timeframe: null,
            OrderTradeType: null,
            Type: MTOrderRecommendationType.Active
        };

        return res;
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

    protected _calculateOrderChecklist(marketInfo: IBFTAMarketInfoData, symbolTradeInfo: MTSymbolTradeInfoResponse, parameters: OrderValidationChecklistInput): OrderValidationChecklist {
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

        if (symbolTradeInfo && symbolTradeInfo.Data) {
            let price = parameters.Price || (symbolTradeInfo.Data.Bid + symbolTradeInfo.Data.Ask) / 2;
            let contractSize = symbolTradeInfo.Data.ContractSize;
            let rate = symbolTradeInfo.Data.Rate;
            let cvar = symbolTradeInfo.Data.CVaR;
            let bid = symbolTradeInfo.Data.Bid;
            let ask = symbolTradeInfo.Data.Ask;
            if (price) {
                if (parameters.SL) {
                    result.OrderRiskValue = TradingHelper.buildRiskByPrice(contractSize, rate, parameters.Size, price, parameters.SL, this.mtBroker.accountInfo.Balance);
                } else if (cvar) {
                    result.OrderRiskValue = TradingHelper.buildRiskByVAR(contractSize, rate, parameters.Size, price, cvar, this.mtBroker.accountInfo.Balance);
                }
            }

            if (bid && ask) {
                result.SpreadRiskValue = Math.abs(bid - ask) / Math.min(bid, ask) * 100;
                if (marketInfo.instrument) {
                    const key = `${marketInfo.instrument.id}${marketInfo.instrument.datafeed}`;
                    const priceSpreadCache = this._tryGetPriceSpreadFromCache(key);

                    if (priceSpreadCache) {
                        result.FeedBrokerSpread = priceSpreadCache.spread;
                        result.FeedBrokerSpreadValue = priceSpreadCache.spreadValue;
                    } else {
                        let lastTick = this._realtimeService.getLastTick(marketInfo.instrument);
                        let lastPrice = lastTick ? lastTick.price : null;
                        if (!lastPrice) {

                            if (parameters.LastPrice) {
                                lastPrice = parameters.LastPrice;
                            } else {
                                lastPrice = marketInfo.data.last_price;
                            }
                        }

                        if (lastPrice) {
                            let avg = (bid + ask) / 2;
                            let spread = Math.abs(avg - lastPrice) / lastPrice * 100;
                            let spreadValue = avg - lastPrice;

                            result.FeedBrokerSpread = spread;
                            result.FeedBrokerSpreadValue = spreadValue;

                            this._tryAddPriceSpreadToCache(key, {
                                spread: spread,
                                spreadValue: spreadValue
                            });
                        }
                    }
                }

            }

            result.cVar = symbolTradeInfo.Data.CVaR;

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
        }

        let positionRisk = this.mtBroker.getSamePositionsRisk(parameters.Symbol, parameters.Side);
        let correlatedRisk = this.mtBroker.getRelatedPositionsRisk(parameters.Symbol, parameters.Side);
        result.CorrelatedRiskValue = Math.abs((correlatedRisk / this.mtBroker.accountInfo.Balance * 100) + result.OrderRiskValue);
        result.PositionRiskValue = Math.abs((positionRisk / this.mtBroker.accountInfo.Balance * 100) + result.OrderRiskValue);
        if (Number.isNaN(result.CorrelatedRiskValue)) {
            result.CorrelatedRiskValue = 0;
        }

        return result;
    }

    protected _tryGetSymbolTradeInfoFromCache(instrument: string): Observable<MTSymbolTradeInfoResponse> {
        if (this._symbolTradeInfoCache[instrument]) {
            return of(this._symbolTradeInfoCache[instrument].Data);
        }

        return null;
    }

    protected _tryAddSymbolTradeInfoToCache(instrument: string, data: MTSymbolTradeInfoResponse) {
        this._symbolTradeInfoCache[instrument] = {
            Data: data,
            Time: new Date().getTime()
        };
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