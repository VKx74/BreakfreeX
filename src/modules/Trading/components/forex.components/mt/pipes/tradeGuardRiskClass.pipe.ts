import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'tradeGuardRiskClassPipe'})
export class TradeGuardRiskClassPipe implements PipeTransform {
  transform(value: number): string {
    if (!value) {
        return "";
    }
    
    if (value < 2) {
      return "low-risk";
    }

    if (value < 4) {
      return "mid-risk";
    }

    if (value < 7.5) {
      return "high-risk";
    }

    return "extreme-risk";
  }
}