import {Pipe, PipeTransform} from '@angular/core';
import {OrderAction, OrderKind} from "../data/api.models";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";

@Pipe({
    name: 'orderAction'
})
export class OrderActionPipe implements PipeTransform {

    constructor(private _translateService: TranslateService) {
    }

    transform(value: OrderAction): Observable<string> {
        const map = {
            [OrderAction.Buy]: 'buy',
            [OrderAction.Sell]: 'sell'
        };

        return this._translateService.stream(map[value]);
    }

}
