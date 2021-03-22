import { Pipe, PipeTransform } from '@angular/core';
import { TzUtils } from "TimeZones";
import { JsUtil } from 'utils/jsUtil';

@Pipe({
    name: 'utcSecondsToStr'
})
export class UTCSecondsToDTPipe implements PipeTransform {
    // value - time in seconds
    transform(value: number): string {
        let date = TzUtils.localToUTCTz(new Date(value * 1000));
        if (date.getFullYear() === 1970)
            return "";
        return JsUtil.formatMomentDate(date, 'YYYY/MM/DD HH:mm');
    }
}