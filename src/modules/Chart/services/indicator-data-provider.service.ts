import { Injectable } from "@angular/core";
import { BreakfreeTradingService } from 'modules/BreakfreeTrading/services/breakfreeTrading.service';
import { BreakfreeTradingNavigatorService } from 'modules/BreakfreeTrading/services/breakfreeTradingNavigator.service';
import { of } from 'rxjs';
import { IBFTAlgoParameters, IRTDPayload } from '@app/services/algo.service';
import { BrokerService } from '@app/services/broker.service';
import { MTBroker } from '@app/services/mt/mt.broker';

@Injectable()
export class IndicatorDataProviderService {

    constructor(protected _bftService: BreakfreeTradingService, protected _bftPanel: BreakfreeTradingNavigatorService, protected _broker: BrokerService) {
       
    }

    getData(indicator: TradingChartDesigner.Indicator, params?: object): Promise<any> {
        const bftParams = params as IBFTAlgoParameters;

        const chart = indicator.chart;

        if (chart.replayMode.isInPlayMode) {
            const replayBack = chart.replayMode.originDataRows[".close"].length - chart.dataContext.dataRows[".close"].length;
            bftParams.replay_back = replayBack;

            if (replayBack > 5000) {
                return of({
                    algo_Info: {
                        status: "Playback allowed on last 5000 candles." 
                    }
                }).toPromise();
            }
        }

        if (this._broker.activeBroker) {
            const broker = this._broker.activeBroker as MTBroker;
            if (!bftParams.input_accountsize && broker.accountInfo && broker.accountInfo.Balance) {
                bftParams.input_accountsize = broker.accountInfo.Balance;
            }
        }

        return this._bftService.getBftIndicatorCalculation(bftParams).then(data => {
            this._bftPanel.indicatorDataLoaded(bftParams, indicator.id, data);
            return data;
        });
    }

    getRTD(indicator: TradingChartDesigner.Indicator, params?: any): Promise<IRTDPayload> {
        const interval = indicator.chart.timeInterval / 1000;
        const dailyInterval = 86400;

        if (params.barsCount && interval < dailyInterval) {
            const diff = interval / dailyInterval;
            params.barsCount = params.barsCount * diff;
            params.barsCount = Math.round(params.barsCount);
        }

        return this._bftService.getRTDCalculation(params).then(data => {
            return data;
        });
    }
    
    indicatorRemoved(indicator: TradingChartDesigner.Indicator) {
        this._bftPanel.indicatorRemoved(indicator.id);
    }
}
