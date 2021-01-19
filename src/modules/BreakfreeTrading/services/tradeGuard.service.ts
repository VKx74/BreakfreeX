import { Injectable } from '@angular/core';
import { BrokerService } from '@app/services/broker.service';
import { MTBroker } from '@app/services/mt/mt.broker';
import { MTMarketOrderRecommendation, MTPendingOrderRecommendation } from 'modules/Trading/models/forex/mt/mt.models';
import { RiskClass, RiskType } from 'modules/Trading/models/models';

export interface ITradeGuardItem {
    Issue: string;
    Recommendation: string;
    RiskClass: RiskClass;
    RiskType: RiskType;
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
        let risks = 0;

        for (const position of positions) {
            if (position.RiskClass === RiskClass.Extreme) {
                risks++;
            }
            if (position.RiskClass === RiskClass.High) {
                risks++;
            }
        }

        if (risks === 1) {
            res.push({
                Issue: "Position overhit recommended risk",
                Recommendation: "Take care about your positions",
                RiskClass: RiskClass.Low,
                RiskType: RiskType.HighRisk
            });
        } else if (risks > 1) {
            res.push({
                Issue: "Multiple positions overhit recommended risk",
                Recommendation: "Take care about your positions",
                RiskClass: RiskClass.Medium,
                RiskType: RiskType.HighRisk
            });
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
        let risks = 0;

        for (const currencyRisk of currencyRisks) {
            if (currencyRisk.RiskClass === RiskClass.Extreme) {
                risks++;
            }
            if (currencyRisk.RiskClass === RiskClass.High) {
                risks++;
            }
        }

        if (risks === 1) {
            res.push({
                Issue: "Currency overhit recommended risk",
                Recommendation: "Take care about your portfolio",
                RiskClass: RiskClass.Low,
                RiskType: RiskType.HighRisk
            });
        } else if (risks > 1) {
            res.push({
                Issue: "Multiple currencies overhit recommended risk",
                Recommendation: "Take care about your portfolio",
                RiskClass: RiskClass.Medium,
                RiskType: RiskType.HighRisk
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
                        if (recommendation.RiskClass > existing.RiskClass) {
                            existing.RiskClass = recommendation.RiskClass;
                        }
                    } else {
                        const currentRecommendation = this._getRiskTypeRecommendationForMarketOrders(recommendation.RiskType);
                        res.push({
                            Issue: this._getRiskTypeDescriptionForMarketOrders(recommendation.RiskType),
                            Recommendation: currentRecommendation,
                            RiskClass: recommendation.RiskClass,
                            RiskType: recommendation.RiskType
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
                        if (recommendation.RiskClass > existing.RiskClass) {
                            existing.RiskClass = recommendation.RiskClass;
                        }
                    } else {
                        const currentRecommendation = this._getRiskTypeRecommendationForPendingOrders(recommendation.RiskType);
                        res.push({
                            Issue: this._getRiskTypeDescriptionForPendingOrders(recommendation.RiskType),
                            Recommendation: currentRecommendation,
                            RiskClass: recommendation.RiskClass,
                            RiskType: recommendation.RiskType
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
            case RiskType.HighRisk: return isMultiple ? "Multiple orders overhit recommended risk" : "Open order overhit recommended risk";
            case RiskType.PriceFarFromEntry: return isMultiple ? "Multiple open orders to far from recommended entry point" : "Open order to far from recommended entry point";
            case RiskType.SLNotSet: return isMultiple ? "SL not set for multiple open orders" : "SL not set for open order";
            case RiskType.WrongTrend: return isMultiple ? "Multiple open orders without SL" : "Open order without SL";
        }
    }

    private _getRiskTypeDescriptionForPendingOrders(riskType: RiskType, isMultiple: boolean = false): string {
        switch (riskType) {
            case RiskType.HighRisk: return isMultiple ? "Multiple active orders overhit recommended risk" : "Active order overhit recommended risk";
            case RiskType.PriceFarFromEntry: return isMultiple ? "Multiple active orders to far from recommended entry point" : "Active order to far from recommended entry point";
            case RiskType.SLNotSet: return isMultiple ? "SL not set for multiple active orders" : "SL not set for active order";
            case RiskType.WrongTrend: return isMultiple ? "Multiple active orders without SL" : "Active order without SL";
        }
    }

    private _getRiskTypeRecommendationForMarketOrders(riskType: RiskType): string {
        switch (riskType) {
            case RiskType.HighRisk: return "Decrease order(s) size or close";
            case RiskType.PriceFarFromEntry: return "Cancel Order(s)";
            case RiskType.SLNotSet: return "Setup SL for order(s)";
            case RiskType.WrongTrend: return "Move to breakeven";
        }
    }

    private _getRiskTypeRecommendationForPendingOrders(riskType: RiskType): string {
        switch (riskType) {
            case RiskType.HighRisk: return "Decrease order(s) size or cancel";
            case RiskType.PriceFarFromEntry: return "Cancel Order(s)";
            case RiskType.SLNotSet: return "Setup SL for order(s)";
            case RiskType.WrongTrend: return "Cancel Order(s)";
        }
    }
}