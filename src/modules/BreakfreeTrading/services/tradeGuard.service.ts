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
                Recommendation: "Stop gambling immediately.",
                RiskClass: RiskClass.Low,
                RiskType: RiskType.HighRisk,
                RelatedData: relatedData,
                RiskObject: RiskObject.CurrencyRisk
            });
        } else if (risks > 1) {
            res.push({
                Issue: "You are overleveraging on multiple positions.",
                Recommendation: "Stop gambling immediately. You will loss everything like this.",
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

    private _getBrokerInstance(): MTBroker {
        if (this._brokerService.activeBroker instanceof MTBroker) {
            return this._brokerService.activeBroker as MTBroker;
        }
        return null;
    }

    private _getRiskTypeDescriptionForMarketOrders(riskType: RiskType, isMultiple: boolean = false): string {
        switch (riskType) {
            case RiskType.HighRisk: return isMultiple ? "Several overleveraged trades found in filled orders." : "Overleveraged trade found in filled orders.";
            case RiskType.PriceFarFromEntry: return isMultiple ? "Several orders have moved too far from the trade setup." : "filled order too far from recommended entry point.";
            case RiskType.SLNotSet: return isMultiple ? "Stoploss missing on multiple filled orders." : "Stoploss missing in a filled orders.";
            case RiskType.WrongTrend: return isMultiple ? "Multiple trades against the global trend found." : "A trade currently trading against the trade found in filled orders.";
        }
    }

    private _getRiskTypeDescriptionForPendingOrders(riskType: RiskType, isMultiple: boolean = false): string {
        switch (riskType) {
            case RiskType.HighRisk: return isMultiple ? "Several overleveraged trades found in pending orders." : "Overleveraged trade found in pending orders.";
            case RiskType.PriceFarFromEntry: return isMultiple ? "Several pending orders have moved too far from the trade setup." : "Pending order to far from recommended entry point.";
            case RiskType.SLNotSet: return isMultiple ? "Stoploss missing on multiple pending orders." : "Stoploss missing in a pending order.";
            case RiskType.WrongTrend: return isMultiple ? "Multiple trades against the global trend found in pending orders." : "A trade currently trading against the trade found in pending orders.";
        }
    }

    private _getRiskTypeDescriptionForPositions(riskType: RiskType, isMultiple: boolean = false): string {
        switch (riskType) {
            case RiskType.HighRisk: return isMultiple ? "Overleverage detected on multiple positions." : "Overleverage detected on a position.";
            case RiskType.WrongTrend: return isMultiple ? "Multiple positions against the global trend." : "Position found trading against the global trend. ";
        }
    }

    private _getRiskTypeRecommendationForMarketOrders(riskType: RiskType): string {
        switch (riskType) {
            case RiskType.HighRisk: return "Reduce position size or orders.";
            case RiskType.PriceFarFromEntry: return "Cancel orders.";
            case RiskType.SLNotSet: return "Set stoploss for orders.";
            case RiskType.WrongTrend: return "Move TPs to breakeven.";
        }
    }

    private _getRiskTypeRecommendationForPendingOrders(riskType: RiskType): string {
        switch (riskType) {
            case RiskType.HighRisk: return "Decrease position size or cancel.";
            case RiskType.PriceFarFromEntry: return "Cancel orders.";
            case RiskType.SLNotSet: return "Set stoploss for orders.";
            case RiskType.WrongTrend: return "Cancel orders.";
        }
    }

    private _getRiskTypeRecommendationForPositions(riskType: RiskType): string {
        switch (riskType) {
            case RiskType.HighRisk: return "Reduce position size.";
            case RiskType.WrongTrend: return "Move TPs to breakeven.";
        }
    }
}