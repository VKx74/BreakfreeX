import {Injector, Pipe, PipeTransform} from '@angular/core';
import {TzUtils} from "TimeZones";

@Pipe({
    name: 'localTime'
})
export class LocalTimePipe implements PipeTransform {
    transform(value: Date | string | number): any {
        // string milliseconds value handling
        if (typeof value === 'string' && !isNaN(Number(value))) {
            value = Number(value);
        }
        return TzUtils.utcToLocalTz(new Date(value));
    }

}
