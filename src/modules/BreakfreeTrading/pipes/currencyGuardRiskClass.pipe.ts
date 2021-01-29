import { Pipe, PipeTransform } from '@angular/core';
import { RiskClass } from 'modules/Trading/models/models';

@Pipe({name: 'tradeGuardRiskClassPipe'})
export class TradeGuardRiskClassPipe implements PipeTransform {
  transform(value: RiskClass): string {
    if (!value) {
        return "";
    }

    switch (value) {
      case RiskClass.Low: return "low-risk";
      case RiskClass.Medium: return "mid-risk";
      case RiskClass.High: return "high-risk";
      case RiskClass.Extreme: return "extreme-risk";
    }
    
    return "";
  }
}