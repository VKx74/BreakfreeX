import { Injectable } from '@angular/core';
import { BrokerService } from '@app/services/broker.service';
import { MTBroker } from '@app/services/mt/mt.broker';
import { MTCurrencyRisk, MTMarketOrderRecommendation, MTOrder, MTPendingOrderRecommendation, MTPosition, MTPositionRecommendation } from 'modules/Trading/models/forex/mt/mt.models';
import { RiskClass, RiskObject, RiskType } from 'modules/Trading/models/models';

export interface ITradeGuardItem {
    Issue: string;
    Recommendation: string;
    RiskClass: RiskClass;
    RiskType: RiskType;
    RiskObject: RiskObject;
    RelatedData: any[];
}

export interface ITradeGuardOverview {
    Items: ITradeGuardItem[];
    Score: number;
}

@Injectable()
export class TradeGuardService {

    constructor(protected _brokerService: BrokerService) {
    }

    public GetPositionsRisks(): ITradeGuardItem[] {
        const res: ITradeGuardItem[] = [];
        const broker = this._getBrokerInstance();
        if (!broker) {
            return res;
        }
        
        const positions = broker.positions;

        for (const position of positions) {
            if (position.Recommendations) {
                const recommendations =  position.Recommendations as MTPositionRecommendation;
                for (const recommendation of recommendations.FailedChecks) {
                    const existing = res.find((i) => {
                        return i.RiskType === recommendation.RiskType;
                    });
                    
                    if (existing) {
                        existing.Issue = this._getRiskTypeDescriptionForPositions(recommendation.RiskType, true);
                        existing.RelatedData.push(position);
                        if (recommendation.RiskClass > existing.RiskClass) {
                            existing.RiskClass = recommendation.RiskClass;
                        }
                    } else {
                        const currentRecommendation = this._getRiskTypeRecommendationForPositions(recommendation.RiskType);
                        res.push({
                            Issue: this._getRiskTypeDescriptionForPositions(recommendation.RiskType),
                            Recommendation: currentRecommendation,
                            RiskClass: recommendation.RiskClass,
                            RiskType: recommendation.RiskType,
                            RelatedData: [position],
                            RiskObject: RiskObject.Positions
                        });
                    }
                }
            }
        }

        return res;
    }

    public GetAssetsRisks(): ITradeGuardItem[] {
        const res: ITradeGuardItem[] = [];
        const broker = this._getBrokerInstance();
        if (!broker) {
            return res;
        }
        
        const currencyRisks = broker.currencyRisks;
        const relatedData: MTCurrencyRisk[] = [];
        let risks = 0;

        for (const currencyRisk of currencyRisks) {
            if (currencyRisk.RiskClass === RiskClass.Extreme || currencyRisk.RiskClass === RiskClass.High) {
                risks++;
                relatedData.push(currencyRisk);
            }
        }

        if (risks === 1) {
            res.push({
                Issue: "You are overleveraged.",
                Recommendation: "Are you going to take this serious or not, you should reduce position size or cancel orders.",
                RiskClass: RiskClass.Low,
                RiskType: RiskType.HighRisk,
                RelatedData: relatedData,
                RiskObject: RiskObject.CurrencyRisk
            });
        } else if (risks > 1) {
            res.push({
                Issue: "You are overleveraging on multiple assets.",
                Recommendation: "You better pay attention now, trading like this will cost you everything. Cancel orders or reduce position size.",
                RiskClass: RiskClass.Medium,
                RiskType: RiskType.HighRisk,
                RelatedData: relatedData,
                RiskObject: RiskObject.CurrencyRisk
            });
        }

        return res;
    }

    public GetFilledOrdersRisks(): ITradeGuardItem[] {
        const res: ITradeGuardItem[] = [];
        const broker = this._getBrokerInstance();
        if (!broker) {
            return res;
        }
        
        const marketOrders = broker.marketOrders;

        for (const marketOrder of marketOrders) {
            if (marketOrder.Recommendations) {
                const recommendations =  marketOrder.Recommendations as MTMarketOrderRecommendation;
                for (const recommendation of recommendations.FailedChecks) {
                    const existing = res.find((i) => {
                        return i.RiskType === recommendation.RiskType;
                    });

                    if (existing) {
                        existing.Issue = this._getRiskTypeDescriptionForMarketOrders(recommendation.RiskType, true);
                        existing.RelatedData.push(marketOrder);
                        if (recommendation.RiskClass > existing.RiskClass) {
                            existing.RiskClass = recommendation.RiskClass;
                        }
                    } else {
                        const currentRecommendation = this._getRiskTypeRecommendationForMarketOrders(recommendation.RiskType);
                        res.push({
                            Issue: this._getRiskTypeDescriptionForMarketOrders(recommendation.RiskType),
                            Recommendation: currentRecommendation,
                            RiskClass: recommendation.RiskClass,
                            RiskType: recommendation.RiskType,
                            RelatedData: [marketOrder],
                            RiskObject: RiskObject.MarketOrders
                        });
                    }
                }
            }
        }

        return res;
    }

    public GetActiveOrdersRisks(): ITradeGuardItem[] {
        const res: ITradeGuardItem[] = [];
        const broker = this._getBrokerInstance();
        if (!broker) {
            return res;
        }
        
        const pendingOrders = broker.pendingOrders;

        for (const pendingOrder of pendingOrders) {
            if (pendingOrder.Recommendations) {
                const recommendations =  pendingOrder.Recommendations as MTPendingOrderRecommendation;
                for (const recommendation of recommendations.FailedChecks) {
                    const existing = res.find((i) => {
                        return i.RiskType === recommendation.RiskType;
                    });
                    
                    if (existing) {
                        existing.Issue = this._getRiskTypeDescriptionForPendingOrders(recommendation.RiskType, true);
                        existing.RelatedData.push(pendingOrder);
                        if (recommendation.RiskClass > existing.RiskClass) {
                            existing.RiskClass = recommendation.RiskClass;
                        }
                    } else {
                        const currentRecommendation = this._getRiskTypeRecommendationForPendingOrders(recommendation.RiskType);
                        res.push({
                            Issue: this._getRiskTypeDescriptionForPendingOrders(recommendation.RiskType),
                            Recommendation: currentRecommendation,
                            RiskClass: recommendation.RiskClass,
                            RiskType: recommendation.RiskType,
                            RelatedData: [pendingOrder],
                            RiskObject: RiskObject.ActiveOrders
                        });
                    }
                }
            }
        }

        return res;
    }

    public GetRiskOverview(): ITradeGuardOverview {
        const result: ITradeGuardItem[] = [];

        const assetsRisk = this.GetAssetsRisks();
        const positionsRisk = this.GetPositionsRisks();
        const filledOrdersRisk = this.GetFilledOrdersRisks();
        const activeOrdersRisk = this.GetActiveOrdersRisks();

        result.push(...assetsRisk);
        result.push(...positionsRisk);
        result.push(...filledOrdersRisk);
        result.push(...activeOrdersRisk);
        result.sort((a, b) => b.RiskClass - a.RiskClass);
        
        let score = 10;

        for (const i of result) {
            score -= this._getScore(i.RiskClass);
        }

        if (score < 0) {
            score = 0;
        }

        return {
            Items: result,
            Score: score
        };
    }

    private _getBrokerInstance(): MTBroker {
        if (this._brokerService.activeBroker instanceof MTBroker) {
            return this._brokerService.activeBroker as MTBroker;
        }
        return null;
    }

    private _getRiskTypeDescriptionForMarketOrders(riskType: RiskType, isMultiple: boolean = false): string {
        switch (riskType) {
            case RiskType.HighRisk: return isMultiple ? "You are overleveraged on multiple filled trades." : "You are overleveraged on a filled trade.";
            case RiskType.PriceFarFromEntry: return isMultiple ? "You have several orders that have moved too far from the trade setup." : "You have an order which has moved too far from the trade setup.";
            case RiskType.SLNotSet: return isMultiple ? "You have multiple filled trades with missing stoplosses." : "You have a filled trade open without any stoploss.";
            case RiskType.WrongTrend: return isMultiple ? "You have trades that are directly trading against the global trend." : "Your trade is trading directly against the global trend.";
        }
    }

    private _getRiskTypeDescriptionForPendingOrders(riskType: RiskType, isMultiple: boolean = false): string {
        switch (riskType) {
            case RiskType.HighRisk: return isMultiple ? "You are overleveraged on multiple open orders." : "You are overleveraged on a open order.";
            case RiskType.PriceFarFromEntry: return isMultiple ? "You have several open orders that have moved too far from the trade setup." : "You have an open order which has moved too far from the trade setup.";
            case RiskType.SLNotSet: return isMultiple ? "You have multiple open orders with missing stoplosses." : "You have a pending order set without any stoploss.";
            case RiskType.WrongTrend: return isMultiple ? "You have multiple open orders that are directly trading against the global trend." : "You have a pending order that is trading directly against the global trend.";
        }
    }

    private _getRiskTypeDescriptionForPositions(riskType: RiskType, isMultiple: boolean = false): string {
        switch (riskType) {
            case RiskType.HighRisk: return isMultiple ? "You are overleveraged on multiple trades." : "You are overleveraged on a trade.";
            case RiskType.WrongTrend: return isMultiple ? "Multiple positions against the global trend." : "Position found trading against the global trend. ";
        }
    }

    private _getRiskTypeRecommendationForMarketOrders(riskType: RiskType): string {
        switch (riskType) {
            case RiskType.HighRisk: return "Get out of this trade at breakeven and stop doing greedy emotional trading, that only simple human minds would do.";
            case RiskType.PriceFarFromEntry: return "No trigger, no trade. On to the next. You can now cancel these orders.";
            case RiskType.SLNotSet: return "You should never have open trades with no stoploss set. You should set stoploss for orders.";
            case RiskType.WrongTrend: return "Market structure has changed. You can go ahead and move TPs to breakeven.";
        }
    }

    private _getRiskTypeRecommendationForPendingOrders(riskType: RiskType): string {
        switch (riskType) {
            case RiskType.HighRisk: return "There is no need for you to overleverage, it will only lead to pain. Please decrease position size or cancel pending trades.";
            case RiskType.PriceFarFromEntry: return "You can cancel these orders and move to next trade setup.";
            case RiskType.SLNotSet: return "Guessing your stoploss is the worst idea you had yet. Set stoploss for pending orders now.";
            case RiskType.WrongTrend: return "This trade is no longer favourable for you. Go ahead and Cancel orders.";
        }
    }

    private _getRiskTypeRecommendationForPositions(riskType: RiskType): string {
        switch (riskType) {
            case RiskType.HighRisk: return "Reduce position size.";
            case RiskType.WrongTrend: return "Move TPs to breakeven.";
        }
    }

    private _getScore(riskClass: RiskClass): number {
        switch (riskClass) {
            case RiskClass.Extreme: return 3;
            case RiskClass.High: return 2;
            case RiskClass.Medium: return 1;
            case RiskClass.Low: return 0;
        }
        return 0;
    }
}