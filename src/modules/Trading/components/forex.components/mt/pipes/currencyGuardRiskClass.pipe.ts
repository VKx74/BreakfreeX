import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'currencyGuardRiskClassPipe'})
export class CurrencyGuardRiskClassPipe implements PipeTransform {
  transform(value: number): string {
    if (!value) {
        return "";
    }
    
    if (value < 4) {
      return "low-risk";
    }

    if (value < 7) {
      return "mid-risk";
    }

    if (value < 10) {
      return "high-risk";
    }

    return "extreme-risk";
  }
}