import { Pipe, PipeTransform } from '@angular/core';
import { TzUtils } from "TimeZones";

@Pipe({
    name: 'secondsToTF'
})
export class SecondsToTFPipe implements PipeTransform {
    // value - time in seconds
    transform(value: number): string {        
        switch (value) {
            case 1 * 60: return "1 Min";
            case 5 * 60: return "5 Min";
            case 15 * 60: return "15 Min";
            case 60 * 60: return "1 Hour";
            case 240 * 60: return "4 Hours";
            case 24 * 60 * 60: return "1 Day";
        }
        return "";
    }
}