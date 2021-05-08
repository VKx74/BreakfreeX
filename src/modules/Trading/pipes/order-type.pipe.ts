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
            [OrderTypes.Market]: 'tradeManager.orderType.market',
            [OrderTypes.Limit]: 'tradeManager.orderType.limit',
            [OrderTypes.Stop]: 'tradeManager.orderType.stop',
            [OrderTypes.StopLimit]: 'tradeManager.orderType.stopLimit'
        };

        return this._translateService.stream(_map[type]);
    }
}
