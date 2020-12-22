import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'accountGuardRiskClassPipe'})
export class AccountGuardRiskClassPipe implements PipeTransform {
  transform(value: number): string {
    if (!value) {
        return "";
    }
    
    if (value < 15) {
      return "low-risk";
    }

    if (value < 30) {
      return "mid-risk";
    }

    if (value < 45) {
      return "high-risk";
    }

    return "extreme-risk";
  }
}