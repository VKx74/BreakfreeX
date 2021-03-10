import { RTDTrendStrength } from "modules/Trading/models/forex/mt/mt.models";
import { OrderTradeType, RiskClass } from "modules/Trading/models/models";

export class TradingHelper {
    public static buildRiskByVAR(contractSize: number, profitRate: number, size: number, price: number, cvar: number, balance: number) {
        if (!profitRate) {
            return 0;
        }
        
        let diff = price / 100 * cvar;
        let riskNet = diff * size * contractSize;
        // if (profitRate === 0) {
        //     riskNet = riskNet / price;
        // } else 
        if (profitRate) {
            riskNet = riskNet * profitRate;
        }
        return riskNet / balance * 100;
    } 
    
    public static buildRiskByPrice(contractSize: number, profitRate: number, size: number, price1: number, price2: number, balance: number) {
        if (!profitRate) {
            return 0;
        }

        let diff = Math.abs(price1 - price2);
        let riskNet = diff * size * contractSize;
        // if (profitRate === 0) {
        //     riskNet = riskNet / price;
        // } else 
        if (profitRate) {
            riskNet = riskNet * profitRate;
        }
        return riskNet / balance * 100;
    }

    public static  normalizeInstrument(symbol: string): string {
        let s = symbol;
        if (s.length > 6 && s[s.length - 2] === '-') {
            s = s.slice(0, s.length - 2);
        }
        s = s.replace("_", "").replace("/", "").replace("^", "").replace("-", "").toLowerCase();
        return s;
    }

    public static buildTechnicalComment(tradeType: OrderTradeType, timeframe: number): string {
        let comment = "";
        switch (tradeType) {
            case OrderTradeType.BRC: comment += "B"; break;
            case OrderTradeType.EXT: comment += "E"; break;
            case OrderTradeType.SWING: comment += "S"; break;
        }

        if (!timeframe) {
            return "";
        }

        let tf = timeframe / 60;

        if (tf < 60) {
            comment += `_${tf}M`;
        } else if (tf < 60 * 24) {
            comment += `_${tf / 60}H`;
        } else {
            comment += `_${tf / 60 / 24}D`;
        }

        return `[${comment}]`;
    }
    
    public static getTradeTypeFromTechnicalComment(comment: string): OrderTradeType {
        if (!comment || !comment.startsWith('[')) {
            return null;
        }

        let indexOfEnd = comment.indexOf(']');
        if (indexOfEnd === -1) {
            return null;
        }

        let substr = comment.substr(1, indexOfEnd - 1);
        let type = substr.split("_")[0];

        switch (type) {
            case "B": return OrderTradeType.BRC;
            case "E": return OrderTradeType.EXT;
            case "S": return OrderTradeType.SWING;
        }

        return null;
    }
    
    public static getTradeTimeframeFromTechnicalComment(comment: string): number {
        if (!comment || !comment.startsWith('[')) {
            return null;
        }

        let indexOfEnd = comment.indexOf(']');
        if (indexOfEnd === -1) {
            return null;
        }

        let substr = comment.substr(1, indexOfEnd - 1);
        let tf = substr.split("_")[1];
        if (!tf) {
            return null;
        }

        // minutes
        if (tf.indexOf("M") !== -1) {
            tf = tf.replace("M", "");
            let res = Number(tf) * 60;
            return Number.isNaN(res) ? null : res;
        }

        // hours
        if (tf.indexOf("H") !== -1) {
            tf = tf.replace("H", "");
            let res = Number(tf) * 60 * 60;
            return Number.isNaN(res) ? null : res;
        }

        // days
        if (tf.indexOf("D") !== -1) {
            tf = tf.replace("D", "");
            let res = Number(tf) * 60 * 60 * 24;
            return Number.isNaN(res) ? null : res;
        }

        return null;

    }

    public static toGranularityToTimeframeText(tf: number): string {
        switch (tf) {
            case 1 * 60: return "1 Min";
            case 5 * 60: return "5 Min";
            case 15 * 60: return "15 Min";
            case 60 * 60: return "1 Hour";
            case 240 * 60: return "4 Hours";
            case 24 * 60 * 60: return "1 Day";
        }
        return "Undefined";
    }

    public static convertTrendSpread(value: number): RTDTrendStrength {
        if (value) {
            if (value > 1.2) {
                return RTDTrendStrength.Strong;
            } else if (value > 0.7) {
                return RTDTrendStrength.Average;
            } else if (value > 0.4) {
                return RTDTrendStrength.Low;
            } else {
                return RTDTrendStrength.Weak;
            }
        }
    }

    public static convertValueToAssetRiskClass(value: number): RiskClass {
        if (!value) {
            return RiskClass.NoRisk;
        }
        
        if (value < 5) {
            return RiskClass.Low;
        }
    
        if (value < 15) {
            return RiskClass.Medium;
        }
    
        if (value < 25) {
            return RiskClass.High;
        }
    
        return RiskClass.Extreme;
    }

    public static convertValueToOrderRiskClass(value: number): RiskClass {
        if (!value) {
            return RiskClass.NoRisk;
        }
        
        if (value < 5) {
            return RiskClass.Low;
        }
    
        if (value < 15) {
            return RiskClass.Medium;
        }
    
        if (value < 25) {
            return RiskClass.High;
        }
    
        return RiskClass.Extreme;
    }

    public static calculatePositionSize(accountSize: number, suggestedRisk: number, priceDiff: number, contract?: number) {
        return (((accountSize * (suggestedRisk / 100)) / Math.abs(priceDiff))) / contract;
    }
}