import { MTSymbolTradeInfoResponse } from "modules/Trading/models/forex/mt/mt.communication";
import { MTMarketOrderRecommendation, MTOrder, MTOrderRecommendation, MTOrderRecommendationType, MTOrderValidationChecklist, MTOrderValidationChecklistInput, MTPendingOrderRecommendation, MTPosition, MTPositionRecommendation, RTDTrendStrength } from "modules/Trading/models/forex/mt/mt.models";
import { OrderSide, OrderTypes, RiskClass, RiskType } from "modules/Trading/models/models";
import { Observable, Subject, Observer, of, Subscription, throwError, forkJoin, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { AlgoService, IBFTAMarketInfo, IBFTATrend } from "../algo.service";
import { InstrumentMappingService } from "../instrument-mapping.service";
import { MTBroker } from "./mt.broker";
import { MTHelper } from "./mt.helper";

interface CacheItem<T> {
    Data: T;
    Time: number;
}

export class MTTradeRatingService {
    protected _symbolTradeInfoCache: { [symbol: string]: CacheItem<MTSymbolTradeInfoResponse>; } = {};
    protected _marketInfoCache: { [symbol: string]: CacheItem<IBFTAMarketInfo>; } = {};
    protected _marketInfoLoading: { [symbol: string]: boolean; } = {};
    protected _timeInterval: any;

    constructor(protected mtBroker: MTBroker, protected algoService: AlgoService, protected mappingService: InstrumentMappingService) {
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
        }, 1000 * 60 * 1);

        this.mappingService.mappingChanged.subscribe(() => {
            this._marketInfoCache = {};
        });

    }

    public calculateOrderChecklist(parameters: MTOrderValidationChecklistInput): Observable<MTOrderValidationChecklist> {
        const symbol = parameters.Symbol;
        let marketInfo = this._tryGetMarketInfoFromCache(symbol);
        if (!marketInfo) {
            marketInfo = this.algoService.getMarketInfo(symbol);
        }

        let symbolTradeInfo = this._tryGetSymbolTradeInfoFromCache(parameters.Symbol);
        if (!symbolTradeInfo) {
            symbolTradeInfo = this.mtBroker.getSymbolTradeInfo(parameters.Symbol);
        }

        return combineLatest([marketInfo, symbolTradeInfo]).pipe(map(([res1, res2]) => {
            this._tryAddMarketInfoToCache(symbol, res1 || null);

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
            } else {
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

        const riskClass = MTHelper.convertValueToAssetRiskClass(order.RiskPercentage);
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

        if (res.GlobalRTD !== null && !res.GlobalRTD) {
            res.FailedChecks.push({
                Issue: "Trading against global trend",
                Recommendation: "Move TPs to breakeven",
                RiskClass: RiskClass.High,
                RiskType: RiskType.WrongTrend
            });
        }

        if (res.LocalRTDValue !== null && !res.LocalRTDValue) {
            if (res.Timeframe <= 60 * 60) {
                if (res.LocalRTDTrendStrength !== RTDTrendStrength.Weak) {
                    res.FailedChecks.push({
                        Issue: "Trading against local trend",
                        Recommendation: "Move TPs to breakeven",
                        RiskClass: RiskClass.Medium,
                        RiskType: RiskType.WrongTrend
                    });
                }
            } else {
                if (res.LocalRTDTrendStrength === RTDTrendStrength.Strong) {
                    res.FailedChecks.push({
                        Issue: "Trading against strong local trend",
                        Recommendation: "Move TPs to breakeven",
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
                    Recommendation: "Cancel Order",
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

        const riskClass = MTHelper.convertValueToAssetRiskClass(order.RiskPercentage);
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

        if (res.GlobalRTD !== null && !res.GlobalRTD) {
            res.FailedChecks.push({
                Issue: "Trading against global trend",
                Recommendation: "Move TPs to breakeven",
                RiskClass: RiskClass.High,
                RiskType: RiskType.WrongTrend
            });
        }

        if (res.LocalRTDValue !== null && !res.LocalRTDValue) {
            if (res.Timeframe <= 60 * 60) {
                if (res.LocalRTDTrendStrength !== RTDTrendStrength.Weak) {
                    res.FailedChecks.push({
                        Issue: "Trading against local trend",
                        Recommendation: "Move TPs to breakeven",
                        RiskClass: RiskClass.Medium,
                        RiskType: RiskType.WrongTrend
                    });
                }
            } else {
                if (res.LocalRTDTrendStrength === RTDTrendStrength.Strong) {
                    res.FailedChecks.push({
                        Issue: "Trading against strong local trend",
                        Recommendation: "Move TPs to breakeven",
                        RiskClass: RiskClass.High,
                        RiskType: RiskType.WrongTrend
                    });
                }
            }
        }

        const riskClass = MTHelper.convertValueToAssetRiskClass(position.RiskPercentage);
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
        const marketInfo = this._getOrLoadMarketInfo(symbol);
        if (marketInfo === undefined) {
            return undefined;
        }

        const tradeType = MTHelper.getTradeTypeFromTechnicalComment(order.Comment);
        const timeframe = MTHelper.getTradeTimeframeFromTechnicalComment(order.Comment);

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

        const globalRTDValue = marketInfo.global_trend;
        const localRTDValue = marketInfo.local_trend;
        const localRTDSpread = marketInfo.local_trend_spread;
        const globalRTDSpread = marketInfo.global_trend_spread;
        const isOverhit = marketInfo.is_overhit;
        const globalRTDTrendStrength = MTHelper.convertTrendSpread(marketInfo.global_trend_spread);
        const localRTDTrendStrength = MTHelper.convertTrendSpread(marketInfo.local_trend_spread);

        let globalRTD = marketInfo.global_trend === IBFTATrend.Up;
        let localRTD = marketInfo.local_trend === IBFTATrend.Up;
        if (order.Side === OrderSide.Sell) {
            globalRTD = marketInfo.global_trend === IBFTATrend.Down;
            localRTD = marketInfo.local_trend === IBFTATrend.Down;
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
    
    private _createPositionsRecommendationBase(order: MTPosition): MTOrderRecommendation {
        const symbol = order.Symbol;
        const marketInfo = this._getOrLoadMarketInfo(symbol);
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

        const globalRTDValue = marketInfo.global_trend;
        const localRTDValue = marketInfo.local_trend;
        const localRTDSpread = marketInfo.local_trend_spread;
        const globalRTDSpread = marketInfo.global_trend_spread;
        const isOverhit = marketInfo.is_overhit;
        const globalRTDTrendStrength = MTHelper.convertTrendSpread(marketInfo.global_trend_spread);
        const localRTDTrendStrength = MTHelper.convertTrendSpread(marketInfo.local_trend_spread);

        let globalRTD = marketInfo.global_trend === IBFTATrend.Up;
        let localRTD = marketInfo.local_trend === IBFTATrend.Up;
        if (order.Side === OrderSide.Sell) {
            globalRTD = marketInfo.global_trend === IBFTATrend.Down;
            localRTD = marketInfo.local_trend === IBFTATrend.Down;
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

    private _getOrLoadMarketInfo(symbol: string): IBFTAMarketInfo {
        if (!this._marketInfoCache[symbol]) {
            if (!this._marketInfoLoading[symbol]) {
                this._marketInfoLoading[symbol] = true;
                this.algoService.getMarketInfo(symbol).subscribe((data) => {
                    this._tryAddMarketInfoToCache(symbol, data || null);
                    this._marketInfoLoading[symbol] = false;
                });
            }
            return undefined;
        }
        return this._marketInfoCache[symbol].Data;
    }

    private _calculateOrderChecklist(marketInfo: IBFTAMarketInfo, symbolTradeInfo: MTSymbolTradeInfoResponse, parameters: MTOrderValidationChecklistInput): MTOrderValidationChecklist {
        let result: MTOrderValidationChecklist = {};

        if (marketInfo) {
            let allowedDiff = Math.abs(marketInfo.natural - marketInfo.support) / 5;
            if (parameters.Side === OrderSide.Buy) {
                result.GlobalRTD = marketInfo.global_trend === IBFTATrend.Up;
                result.LocalRTD = marketInfo.local_trend === IBFTATrend.Up;

                let priceToTargetDiff = Math.abs(marketInfo.resistance - marketInfo.last_price);
                if (marketInfo.last_price >= marketInfo.resistance || allowedDiff > priceToTargetDiff) {
                    result.Levels = false;
                } else {
                    result.Levels = true;
                }
            } else {
                result.GlobalRTD = marketInfo.global_trend === IBFTATrend.Down;
                result.LocalRTD = marketInfo.local_trend === IBFTATrend.Down;

                let priceToTargetDiff = Math.abs(marketInfo.support - marketInfo.last_price);
                if (marketInfo.last_price <= marketInfo.support || allowedDiff > priceToTargetDiff) {
                    result.Levels = false;
                } else {
                    result.Levels = true;
                }
            }

            result.GlobalRTDValue = marketInfo.global_trend;
            result.LocalRTDValue = marketInfo.local_trend;
            result.LocalRTDSpread = marketInfo.local_trend_spread;
            result.GlobalRTDSpread = marketInfo.global_trend_spread;

            result.GlobalRTDTrendStrength = MTHelper.convertTrendSpread(marketInfo.global_trend_spread);
            result.LocalRTDTrendStrength = MTHelper.convertTrendSpread(marketInfo.local_trend_spread);
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
                    result.RiskValue = MTHelper.buildRiskByPrice(contractSize, rate, parameters.Size, price, parameters.SL, this.mtBroker.accountInfo.Balance);
                } else if (cvar) {
                    result.RiskValue = MTHelper.buildRiskByVAR(contractSize, rate, parameters.Size, price, cvar, this.mtBroker.accountInfo.Balance);
                }
            }

            if (bid && ask) {
                result.SpreadRiskValue = Math.abs(bid - ask) / Math.min(bid, ask) * 100;
            }
        }

        let correlatedRisk = this.mtBroker.getRelatedPositionsRisk(parameters.Symbol, parameters.Side);
        result.CorrelatedRiskValue = Math.abs((correlatedRisk / this.mtBroker.accountInfo.Balance * 100) + result.RiskValue);
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

    protected _tryGetMarketInfoFromCache(instrument: string): Observable<IBFTAMarketInfo> {
        if (this._marketInfoCache[instrument]) {
            return of(this._marketInfoCache[instrument].Data);
        }

        return null;
    }

    protected _tryAddMarketInfoToCache(instrument: string, data: IBFTAMarketInfo) {
        this._marketInfoCache[instrument] = {
            Data: data,
            Time: new Date().getTime()
        };
    }
}