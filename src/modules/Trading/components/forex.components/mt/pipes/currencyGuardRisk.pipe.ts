import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'currencyGuardRiskPipe'})
export class CurrencyGuardRiskPipe implements PipeTransform {
  transform(value: number): string {
    if (!value) {
        return "Calculating...";
    }
    
    if (value < 4) {
        return "Low Risk";
    }

    if (value < 7) {
        return "Mid Risk";
    }

    if (value < 10) {
        return "High Risk";
    }

    return "Extreme Risk";
  }
}