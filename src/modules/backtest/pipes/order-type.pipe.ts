import {Pipe, PipeTransform} from '@angular/core';
import {OrderKind} from "../data/api.models";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";

@Pipe({
    name: 'orderType'
})
export class OrderTypePipe implements PipeTransform {

    constructor(private _translateService: TranslateService) {
    }

    transform(value: OrderKind): Observable<string> {
        const map = {
            [OrderKind.Market]: 'orderType.market',
            [OrderKind.Limit]: 'orderType.limit',
            [OrderKind.Stop]: 'orderType.stop',
            [OrderKind.StopLimit]: 'orderType.stopLimit'
        };

        return this._translateService.stream(map[value]);
    }

}
