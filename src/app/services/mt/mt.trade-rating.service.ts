import { MTSymbolTradeInfoResponse } from "modules/Trading/models/forex/mt/mt.communication";
import { MTOrder, MTOrderRecommendation, MTOrderRecommendationType, MTOrderValidationChecklist, MTOrderValidationChecklistInput, MTPEndingOrderRecommendation } from "modules/Trading/models/forex/mt/mt.models";
import { OrderSide } from "modules/Trading/models/models";
import { Observable, Subject, Observer, of, Subscription, throwError, forkJoin, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { AlgoService, IBFTAMarketInfo, IBFTATrend } from "../algo.service";
import { MTBroker } from "./mt.broker";
import { MTHelper } from "./mt.helper";

export class MTTradeRatingService {
    protected _symbolTradeInfoCache: { [symbol: string]: MTSymbolTradeInfoResponse; } = {};
    protected _marketInfoCache: { [symbol: string]: IBFTAMarketInfo; } = {};
    protected _marketInfoLoading: { [symbol: string]: boolean; } = {};

    constructor(protected mtBroker: MTBroker, protected algoService: AlgoService) {
        
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

    public calculatePendingOrderRecommendations(order: MTOrder): MTPEndingOrderRecommendation {
        const symbol = order.Symbol;
        const marketInfo = this._getOrLoadMarketInfo(symbol);
        if (!marketInfo) {
            return marketInfo === undefined ? undefined : null;
        }
        
        const tradeType = MTHelper.getTradeTypeFromTechnicalComment(order.Comment);
        const timeframe = MTHelper.getTradeTimeframeFromTechnicalComment(order.Comment);
        const globalRTDValue = marketInfo.global_trend;
        const localRTDValue = marketInfo.local_trend;
        const localRTDSpread = marketInfo.local_trend_spread;
        const globalRTDSpread = marketInfo.global_trend_spread;

        let globalRTD = marketInfo.global_trend === IBFTATrend.Up;
        let localRTD = marketInfo.local_trend === IBFTATrend.Up;
        if (order.Side === OrderSide.Sell) {
            globalRTD = marketInfo.global_trend === IBFTATrend.Down;
            localRTD = marketInfo.local_trend === IBFTATrend.Down;
        }

        let res: MTPEndingOrderRecommendation = {
            CancelNeeded: false,
            CancelReason: "",
            GlobalRTD: globalRTD,
            LocalRTD: localRTD,
            GlobalRTDValue: globalRTDValue,
            LocalRTDValue: localRTDValue,
            GlobalRTDSpread: globalRTDSpread,
            LocalRTDSpread: localRTDSpread,
            Timeframe: timeframe,
            OrderTradeType: tradeType,
            Type: MTOrderRecommendationType.Pending
        };

        if (!globalRTD) {
            res.CancelNeeded = true;
            res.CancelReason = "Global RTD trend - reversed direction";
            return res;
        }

        // 1h
        if (timeframe <= 60 * 60 && !localRTDValue) {
            res.CancelNeeded = true;
            res.CancelReason = "Local RTD trend - reversed direction";
            return res;
        } 
        
        if (order.Price && order.SL && order.TP && order.CurrentPrice) {
            const logicalOrderBounds = Math.abs(order.SL -  order.TP);
            const priceDiff = Math.abs(order.Price -  order.CurrentPrice);
            if (logicalOrderBounds < priceDiff) {
                res.CancelNeeded = true;
                res.CancelReason = "Price too far from entry point";
                return res;
            }
        }
        
        if (order.Price && order.SL && order.CurrentPrice) {
            const logicalOrderBounds = Math.abs(order.SL -  order.Price) * 2;
            const priceDiff = Math.abs(order.Price -  order.CurrentPrice);
            if (logicalOrderBounds < priceDiff) {
                res.CancelNeeded = true;
                res.CancelReason = "Price too far from entry point";
                return res;
            }
        }

        return res;
    }

    private _getOrLoadMarketInfo(symbol: string): IBFTAMarketInfo {
        if (this._marketInfoCache[symbol] === undefined) {
            if (!this._marketInfoLoading[symbol]) {
                this._marketInfoLoading[symbol] = true;
                this.algoService.getMarketInfo(symbol).subscribe((data) => {
                    this._tryAddMarketInfoToCache(symbol, data || null);
                    this._marketInfoLoading[symbol] = false;
                });
            }
        }
        return this._marketInfoCache[symbol];
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
            return of(this._symbolTradeInfoCache[instrument]);
        }

        return null;
    }

    protected _tryAddSymbolTradeInfoToCache(instrument: string, data: MTSymbolTradeInfoResponse) {
        this._symbolTradeInfoCache[instrument] = data;
    }

    protected _tryGetMarketInfoFromCache(instrument: string): Observable<IBFTAMarketInfo> {
        if (this._marketInfoCache[instrument] !== undefined) {
            return of(this._marketInfoCache[instrument]);
        }

        return null;
    }

    protected _tryAddMarketInfoToCache(instrument: string, data: IBFTAMarketInfo) {
        this._marketInfoCache[instrument] = data;
    }
}