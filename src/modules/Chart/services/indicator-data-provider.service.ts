import { Injectable } from "@angular/core";
import { IdentityService } from "../../../app/services/auth/identity.service";
import { TemplatesStorageService } from './templates-storage.service';
import { AlertService } from '@alert/services/alert.service';
import { BreakfreeTradingService, IBFTAlgoParameters } from 'modules/BreakfreeTrading/services/breakfreeTrading.service';
import { BreakfreeTradingNavigatorService } from 'modules/BreakfreeTrading/services/breakfreeTradingNavigator.service';

@Injectable()
export class IndicatorDataProviderService {

    constructor(protected _bftService: BreakfreeTradingService, protected _bftPanel: BreakfreeTradingNavigatorService) {
       
    }

    getData(indicator: TradingChartDesigner.Indicator, params?: object): Promise<any> {
        const bftParams = params as IBFTAlgoParameters;
        return this._bftService.getBftIndicatorCalculation(bftParams).then(data => {
            this._bftPanel.indicatorDataLoaded(bftParams, indicator.id, data);
            return data;
        });
    }
    
    indicatorRemoved(indicator: TradingChartDesigner.Indicator) {
        this._bftPanel.indicatorRemoved(indicator.id);
    }
}
