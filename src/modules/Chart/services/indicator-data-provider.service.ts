import { Injectable } from "@angular/core";
import { IdentityService } from "../../../app/services/auth/identity.service";
import { TemplatesStorageService } from './templates-storage.service';
import { AlertService } from '@alert/services/alert.service';
import { BreakfreeTradingService } from 'modules/BreakfreeTrading/services/breakfreeTrading.service';
import { BreakfreeTradingNavigatorService } from 'modules/BreakfreeTrading/services/breakfreeTradingNavigator.service';
import { of } from 'rxjs';
import { IBFTAlgoParameters } from '@app/services/algo.service';

@Injectable()
export class IndicatorDataProviderService {

    constructor(protected _bftService: BreakfreeTradingService, protected _bftPanel: BreakfreeTradingNavigatorService) {
       
    }

    getData(indicator: TradingChartDesigner.Indicator, params?: object): Promise<any> {
        const bftParams = params as IBFTAlgoParameters;

        const chart = indicator.chart;

        if (chart.replayMode.isInPlayMode) {
            const replayBack = chart.replayMode.originDataRows[".close"].length - chart.dataContext.dataRows[".close"].length;
            bftParams.replay_back = replayBack;

            if (replayBack > 1000) {
                return of({
                    algo_Info: {
                        status: "Playback allowed on last 1000 candles." 
                    }
                }).toPromise();
            }
        }

        return this._bftService.getBftIndicatorCalculation(bftParams).then(data => {
            this._bftPanel.indicatorDataLoaded(bftParams, indicator.id, data);
            return data;
        });
    }
    
    indicatorRemoved(indicator: TradingChartDesigner.Indicator) {
        this._bftPanel.indicatorRemoved(indicator.id);
    }
}
