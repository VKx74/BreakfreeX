import { Pipe, PipeTransform } from '@angular/core';
import { RiskClass } from 'modules/Trading/models/models';

@Pipe({name: 'currencyGuardRiskPipe'})
export class CurrencyGuardRiskPipe implements PipeTransform {
  transform(value: RiskClass): string {
    switch (value) {
      case RiskClass.Calculating: return "Calculating...";
      case RiskClass.NoRisk: return "No Risk";
      case RiskClass.Low: return "Low Risk";
      case RiskClass.Medium: return "Mid Risk";
      case RiskClass.High: return "High Risk";
      case RiskClass.Extreme: return "Extreme Risk";
    }
    
    return "Calculating...";
  }
}