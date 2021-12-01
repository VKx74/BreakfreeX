import { TimeSpan } from "@app/helpers/timeFrame.helper";
import { IBFTATrend } from "@app/services/algo.service";
import { TradingHelper } from "@app/services/mt/mt.helper";
import { BinanceOrderConfig } from "modules/Trading/components/crypto.components/binance/order-configurator/binance-order-configurator.component";
import { MTOrderConfig } from "modules/Trading/components/forex.components/mt/order-configurator/mt-order-configurator.component";
import { RTDTrendStrength } from "../../forex/mt/mt.models";
import { OrderSide, RiskClass } from "../../models";

export interface OrderValidationChecklistInput {
    Symbol: string;
    Timeframe?: number;
    LastPrice?: number;
    Side: OrderSide;
    Size: number;
    Price?: number;
    SL?: number;
    ExistingOrderID?: number;
}

export interface OrderValidationChecklist {
    GlobalRTD?: boolean;
    LocalRTD?: boolean;
    Levels?: boolean;

    GlobalRTDValue?: IBFTATrend;
    LocalRTDValue?: IBFTATrend;
    LocalRTDSpread?: number;
    GlobalRTDSpread?: number;
    LocalRTDTrendStrength?: RTDTrendStrength;
    GlobalRTDTrendStrength?: RTDTrendStrength;
    OrderRiskValue?: number;
    PositionRiskValue?: number;
    SpreadRiskValue?: number;
    FeedBrokerSpread?: number;
    FeedBrokerSpreadValue?: number;
    CorrelatedRiskValue?: number;
    cVar?: number;
    isSLReversed?: boolean;
    isSLToClose?: boolean;
    isSLToFare?: boolean;
}

export const CalculatingChecklistStatuses = [
    "Checking entry...",
    "Checking leverage...",
    "Checking spread...",
    "Checking price offset...",
    "Checking local trend...",
    "Checking global trend...",
    "Checking correlated risk...",
    "Checking stop loss...",
    "Calculating rate..."
];

export enum ChecklistItemType {
    LocalRTD,
    GlobalRTD,
    Levels,
    Leverage,
    CorrelatedRisk,
    Spread,
    Stoploss,
    PriceOffset
}

export interface ChecklistItem {
    name: string;
    valid: boolean;
    value?: string;
    tooltip: string;
    minusScore: number;
    type: ChecklistItemType;
}

export interface MTChecklistItemDescription {
    calculate: (data: OrderValidationChecklist, config?: MTOrderConfig) => ChecklistItem;
}

export interface BinanceChecklistItemDescription {
    calculate: (data: OrderValidationChecklist, config?: BinanceOrderConfig) => ChecklistItem;
}

export const LocalTrendValidatorFunction = (data: OrderValidationChecklist, timeframe?: number): ChecklistItem => {
    let acceptableTrend = data.LocalRTD;
    let minusScore = 0;
    let tooltip = acceptableTrend ? "You are trading with local trend in your favor." : "You are trading against local trend.";
    let hour = TimeSpan.MILLISECONDS_IN_HOUR / 1000;

    if (!acceptableTrend) {
        if (timeframe) {
            if (timeframe <= hour) {
                if (data.LocalRTDTrendStrength === RTDTrendStrength.Weak) {
                    acceptableTrend = true;
                    tooltip = `You are trading against an acceptable ${data.LocalRTDTrendStrength} local trend.`;
                } else {
                    tooltip = `You are trading against an unacceptable ${data.LocalRTDTrendStrength} local trend.`;
                    minusScore = data.LocalRTDTrendStrength === RTDTrendStrength.Strong ? 3 : 2;
                }
            } else if (timeframe <= hour * 4) {
                if (data.LocalRTDTrendStrength === RTDTrendStrength.Strong) {
                    tooltip = `You are trading against an unacceptable ${data.LocalRTDTrendStrength} local trend.`;
                    minusScore = 2;
                } else {
                    tooltip = `You are trading against an acceptable ${data.LocalRTDTrendStrength} local trend.`;
                    acceptableTrend = true;
                }
            } else {
                tooltip = `You are trading against an acceptable ${data.LocalRTDTrendStrength} local trend.`;
                acceptableTrend = true;
            }
        } else if (data.LocalRTDTrendStrength === RTDTrendStrength.Strong) {
            tooltip = `You are trading against an unacceptable ${data.LocalRTDTrendStrength} local trend.`;
            minusScore = 2;
        }
    }

    return {
        name: "Local Trend",
        valid: acceptableTrend,
        minusScore: acceptableTrend ? 0 : minusScore,
        tooltip: tooltip,
        type: ChecklistItemType.LocalRTD
    };
};

export const GlobalTrendValidatorFunction = (data: OrderValidationChecklist): ChecklistItem => {
    let minusScore = data.GlobalRTD ? 0 : 4;
    let tooltip = data.GlobalRTD ? "You are trading with the global trend in your favor. Keep doing this." : "WARNING! You are entering a trade that goes against the global trend. It's very possible this trade could be a winning trade, however you will discover over time that trading against the trend is the sole reason you never become profitable.";
    if (data.GlobalRTDTrendStrength) {
        if (data.GlobalRTDTrendStrength === RTDTrendStrength.Strong) {
            minusScore = 5;
        } else if (data.GlobalRTDTrendStrength === RTDTrendStrength.Average) {
            minusScore = 4;
        } else if (data.GlobalRTDTrendStrength === RTDTrendStrength.Low) {
            minusScore = 3;
        } else {
            minusScore = 2;
        }
    }
    return {
        name: "Global Trend",
        valid: data.GlobalRTD,
        minusScore: data.GlobalRTD ? 0 : minusScore,
        tooltip: tooltip,
        type: ChecklistItemType.GlobalRTD
    };
};

export const LevelsValidatorFunction = (data: OrderValidationChecklist, side: OrderSide): ChecklistItem => {
    let tooltip = data.Levels ? "Good entry, you are buying into support." : "Warning! You are buying into resistance. You are most likely chasing the market, and while this may be fun and profitable for a short time, you will lose all your money in the long run.";
    if (side === OrderSide.Sell) {
        tooltip = data.Levels ? "Good entry, you are selling into resistance." : "Warning! You are selling into support. You are most likely chasing the market, and while this may be fun and profitable for a short time, you will lose all your money in the long run.";
    }

    return {
        name: "Trade Entry",
        valid: data.Levels,
        minusScore: data.Levels ? 0 : 2,
        tooltip: tooltip,
        type: ChecklistItemType.Levels
    };
};

export const LeverageValidatorFunction = (data: OrderValidationChecklist): ChecklistItem => {
    let value = "";
    let valid = true;
    let minusScore = 0;
    let tooltip = "";
    if (data.PositionRiskValue !== null && data.PositionRiskValue !== undefined) {
        value = data.PositionRiskValue.toFixed(2) + "%";

        const risk = TradingHelper.convertValueToOrderRiskClass(data.PositionRiskValue);
        if (risk === RiskClass.Extreme) {
            minusScore = 5;
            valid = false;
        } else if (risk === RiskClass.High) {
            minusScore = 3;
            valid = false;
        }

        tooltip = valid ? "You are using adequate leverage sized for this position. " : "WARNING! You are about to enter an overleveraged trade. This is the main reason simple humans continue to lose in trading because they love to gamble.";
    }

    return {
        name: "Leverage",
        valid: valid,
        value: value,
        minusScore: valid ? 0 : minusScore,
        tooltip: tooltip,
        type: ChecklistItemType.Leverage
    };
};

export const CorrelatedRiskValidatorFunction = (data: OrderValidationChecklist): ChecklistItem => {
    let value = "";
    let valid = true;
    let minusScore = 0;
    let tooltip = "";
    if (data.CorrelatedRiskValue !== null && data.CorrelatedRiskValue !== undefined) {
        value = data.CorrelatedRiskValue.toFixed(2) + "%";

        const risk = TradingHelper.convertValueToAssetRiskClass(data.CorrelatedRiskValue);
        if (risk === RiskClass.Extreme) {
            minusScore = 5;
            valid = false;
        } else if (risk === RiskClass.High) {
            minusScore = 3;
            valid = false;
        }

        tooltip = valid ? "You have no major correlated risk in your open/pending orders." : "WARNING! If you take this trade, you will be overexposing and taking a too much-correlated risk. This means you will lose or win a much higher amount than usual and likely lead to losing your account in the long run. Avoid this trade and look to other markets.";

    }
    return {
        name: "Correlated Risk",
        valid: valid,
        value: value,
        minusScore: valid ? 0 : minusScore,
        tooltip: tooltip,
        type: ChecklistItemType.CorrelatedRisk
    };
};

export const SpreadValidatorFunction = (data: OrderValidationChecklist): ChecklistItem => {
    let value = "";
    let valid = null;
    let minusScore = 0;
    if (data.SpreadRiskValue !== null && data.SpreadRiskValue !== undefined) {
        value = data.SpreadRiskValue.toFixed(2) + "%";
        valid = data.SpreadRiskValue < 0.1;
    }
    return {
        name: "Spread",
        valid: valid,
        value: value,
        minusScore: valid ? 0 : minusScore,
        tooltip: valid ? "Your broker has acceptable spread on this market." : "Warning! Your broker is offering you a bad spread on this market. Be very careful as this can lead to a total loss of your trading account on the wrong markets.",
        type: ChecklistItemType.Spread
    };
};

export const StoplossValidatorFunction = (data: OrderValidationChecklist, sl?: number): ChecklistItem => {
    const isValid = !!sl;

    if (data.isSLReversed) {
        return {
            name: "Stoploss",
            valid: false,
            minusScore: 10,
            tooltip: "Your stoploss is on the wrong side of this trade, please pay attention.",
            type: ChecklistItemType.Stoploss
        };
    }

    if (data.isSLToClose) {
        return {
            name: "Stoploss",
            valid: false,
            minusScore: 2,
            tooltip: "This stoploss has a high risk of being stopped out with the current volatility of this market. Please rethink this stoploss.",
            type: ChecklistItemType.Stoploss
        };
    }

    if (data.isSLToFare) {
        return {
            name: "Stoploss",
            valid: false,
            minusScore: 2,
            tooltip: "Stoploss unreasonable far from the entry price.",
            type: ChecklistItemType.Stoploss
        };
    }

    return {
        name: "Stoploss",
        valid: isValid,
        minusScore: isValid ? 0 : 3,
        tooltip: isValid ? "You have set a reasonable stoploss for the trade. A basic but very important discipline for successful trading, when it comes to humans." : "Warning! You are missing stoploss for this trade. Trading without stoploss is risky business and a classic trait of the average losing human trader. ",
        type: ChecklistItemType.Stoploss
    };
};

export const PriceOffsetValidatorFunction = (data: OrderValidationChecklist): ChecklistItem => {
    let value = "";
    let valid = null;
    let minusScore = 0;
    if (data.FeedBrokerSpread !== null && data.FeedBrokerSpread !== undefined) {
        value = (data.FeedBrokerSpread * 100).toFixed(0) + " BPS";
        valid = data.FeedBrokerSpread < 0.03;
    }
    return {
        name: "Price offset",
        valid: valid,
        value: value,
        minusScore: valid ? 0 : minusScore,
        tooltip: valid ? "The navigator datafeed and the connected broker feed for this market are aligned within an acceptable price range." : "Warning! The navigator datafeed and the connected broker feed for this market are not aligned within an acceptable price range. Price offset required.",
        type: ChecklistItemType.PriceOffset
    };
};

// MT

export class LocalTrendValidator implements MTChecklistItemDescription {
    calculate(data: OrderValidationChecklist, config: MTOrderConfig): ChecklistItem {
        return LocalTrendValidatorFunction(data, config.timeframe);
    }
}

export class GlobalTrendValidator implements MTChecklistItemDescription {
    calculate(data: OrderValidationChecklist, config: MTOrderConfig): ChecklistItem {
        return GlobalTrendValidatorFunction(data);
    }
}

export class LevelsValidator implements MTChecklistItemDescription {
    calculate(data: OrderValidationChecklist, config: MTOrderConfig): ChecklistItem {
        return LevelsValidatorFunction(data, config.side);
    }
}

export class LeverageValidator implements MTChecklistItemDescription {
    calculate(data: OrderValidationChecklist, config: MTOrderConfig): ChecklistItem {
        return LeverageValidatorFunction(data);
    }
}

export class CorrelatedRiskValidator implements MTChecklistItemDescription {
    calculate(data: OrderValidationChecklist, config: MTOrderConfig): ChecklistItem {
        return CorrelatedRiskValidatorFunction(data);
    }
}

export class SpreadValidator implements MTChecklistItemDescription {
    calculate(data: OrderValidationChecklist, config: MTOrderConfig): ChecklistItem {
        return SpreadValidatorFunction(data);
    }
}

export class StoplossValidator implements MTChecklistItemDescription {
    calculate(data: OrderValidationChecklist, config: MTOrderConfig): ChecklistItem {
        return StoplossValidatorFunction(data, config.sl);
    }
}

export class PriceOffsetValidator implements MTChecklistItemDescription {
    calculate(data: OrderValidationChecklist, config: MTOrderConfig): ChecklistItem {
        return PriceOffsetValidatorFunction(data);
    }
}

// Binance Spots

export class BinanceLocalTrendValidator implements BinanceChecklistItemDescription {
    calculate(data: OrderValidationChecklist, config: BinanceOrderConfig): ChecklistItem {
        return LocalTrendValidatorFunction(data, config.timeframe);
    }
}

export class BinanceGlobalTrendValidator implements BinanceChecklistItemDescription {
    calculate(data: OrderValidationChecklist, config: BinanceOrderConfig): ChecklistItem {
        return GlobalTrendValidatorFunction(data);
    }
}

export class BinanceLevelsValidator implements BinanceChecklistItemDescription {
    calculate(data: OrderValidationChecklist, config: BinanceOrderConfig): ChecklistItem {
        return LevelsValidatorFunction(data, config.side);
    }
}

// export class BinanceLeverageValidator implements BinanceChecklistItemDescription {
//     calculate(data: OrderValidationChecklist, config: BinanceOrderConfig): ChecklistItem {
//         return LeverageValidatorFunction(data);
//     }
// }

// export class BinanceCorrelatedRiskValidator implements BinanceChecklistItemDescription {
//     calculate(data: OrderValidationChecklist, config: BinanceOrderConfig): ChecklistItem {
//         return CorrelatedRiskValidatorFunction(data);
//     }
// }

export class BinanceSpreadValidator implements BinanceChecklistItemDescription {
    calculate(data: OrderValidationChecklist, config: BinanceOrderConfig): ChecklistItem {
        return SpreadValidatorFunction(data);
    }
}

// export class BinanceStoplossValidator implements BinanceChecklistItemDescription {
//     calculate(data: OrderValidationChecklist, config: BinanceOrderConfig): ChecklistItem {
//         return StoplossValidatorFunction(data, config.sl);
//     }
// }

export class BinancePriceOffsetValidator implements BinanceChecklistItemDescription {
    calculate(data: OrderValidationChecklist, config: BinanceOrderConfig): ChecklistItem {
        return PriceOffsetValidatorFunction(data);
    }
}