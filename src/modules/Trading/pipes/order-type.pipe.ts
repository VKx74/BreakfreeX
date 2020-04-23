import {Inject, Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../localization/token";
import {OrderTypes} from "../models/models";
import {Observable} from "rxjs";

@Pipe({
    name: 'orderType'
})
export class OrderTypePipe implements PipeTransform {
    constructor(@Inject(TradingTranslateService) private _translateService: TranslateService) {

    }

    transform(type: OrderTypes): Observable<string> {
        const _map = {
            [OrderTypes.Market]: 'tradeManager.market',
            [OrderTypes.Limit]: 'tradeManager.limit',
            [OrderTypes.Stop]: 'tradeManager.stop',
            [OrderTypes.StopLimit]: 'tradeManager.stopLimit'
        };

        return this._translateService.stream(_map[type]);
    }
}
