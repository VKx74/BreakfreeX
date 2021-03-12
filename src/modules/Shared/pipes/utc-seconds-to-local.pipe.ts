import { Pipe, PipeTransform } from '@angular/core';
import { TzUtils } from "TimeZones";

@Pipe({
    name: 'utcSecondsToLocal'
})
export class UTCSecondsToLocalPipe implements PipeTransform {
    // value - time in seconds
    transform(value: number): Date {
        return TzUtils.utcToLocalTz(new Date(value * 1000));
        // return TzUtils.localToUTCTz(new Date(value * 1000));               
    }
}
