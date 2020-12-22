import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'accountGuardRiskPipe'})
export class AccountGuardRiskPipe implements PipeTransform {
  transform(value: number): string {
    if (!value) {
        return "Calculating...";
    }
    
    if (value < 15) {
        return "Low Risk";
    }

    if (value < 30) {
        return "Mid Risk";
    }

    if (value < 45) {
        return "High Risk";
    }

    return "Extreme Risk";
  }
}