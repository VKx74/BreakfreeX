import {Inject, InjectionToken, Optional, Pipe, PipeTransform} from '@angular/core';
import {JsUtil} from "../../../utils/jsUtil";
import {Observable} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";

export const DateFormatPipeUpdateTriggerToken = new InjectionToken<Observable<any>>('DateFormatPipeUpdateTriggerToken');

@Pipe({
    name: 'formatDate',
    pure: false
})
export class DateFormatPipe implements PipeTransform {
    private _value: string;
    private _origValue: any;

    constructor(@Inject(DateFormatPipeUpdateTriggerToken) @Optional() private _updateTrigger: Observable<any>) {
        if (this._updateTrigger) {
            this._updateTrigger
                .pipe(
                    takeUntil(componentDestroyed(this))
                )
                .subscribe(() => {
                    this._value = null;
                });
        }

    }

    transform(value: Date | moment.Moment | string | number, ...args: any[]): string {
        if (this._value != null && this._origValue === value) {
            return this._value;
        }

        this._value = JsUtil.formatMomentDate(value, args[0]);
        this._origValue = value;
        return this._value;
    }

    ngOnDestroy() {

    }
}
