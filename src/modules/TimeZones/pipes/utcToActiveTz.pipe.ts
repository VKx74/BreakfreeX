import {Pipe, PipeTransform} from '@angular/core';
import {TzUtils} from "../utils/TzUtils";
import {TimeZoneManager} from '../services/timeZone.manager';
import {LocalTimeZone} from '../models/models';
import {BaseImpurePipe} from "../../Shared/pipes/base-impure.pipe";
import {takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";

@Pipe({
    name: 'utcToCurrentTz',
    pure: false
})
export class UtcToActiveTz extends BaseImpurePipe implements PipeTransform {
    constructor(private _tzManager: TimeZoneManager) {
        super();

        this._tzManager.timeZoneChange$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => {
                this.reset();
            });
    }

    protected _transform(value: Date | string | number): Date {
        return TzUtils.convertDateTz(new Date(value), LocalTimeZone, this._tzManager.timeZone);
    }

    protected _isValueCached(prevArguments, currentArguments): boolean {
        return prevArguments[0] === currentArguments[0];
    }

    ngOnDestroy() {

    }
}
