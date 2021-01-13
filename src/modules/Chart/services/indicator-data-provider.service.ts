import { Injectable } from "@angular/core";
import { BreakfreeTradingService } from 'modules/BreakfreeTrading/services/breakfreeTrading.service';
import { of } from 'rxjs';
import { IBFTAlgoParameters, IRTDPayload } from '@app/services/algo.service';
import { BrokerService } from '@app/services/broker.service';
import { MTBroker } from '@app/services/mt/mt.broker';

@Injectable()
export class IndicatorDataProviderService {

    constructor(protected _bftService: BreakfreeTradingService, protected _broker: BrokerService) {
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

            const brokerInstrument = broker.instrumentToBrokerFormat(bftParams.instrument.symbol);

            if (brokerInstrument) {
                const contract_size = broker.instrumentContractSize(brokerInstrument.symbol);
                if  (contract_size) {
                    bftParams.contract_size = contract_size;
                }
            }

            console.log(">>> Contract size: " + bftParams.contract_size);
        }

        return this._bftService.getBftIndicatorCalculationV2(bftParams);
    }

    getRTD(indicator: TradingChartDesigner.Indicator, params?: any): Promise<IRTDPayload> {
        const interval = indicator.chart.timeInterval / 1000;
        const dailyInterval = 86400;

        if (interval < dailyInterval) {
            try {
                var l = indicator.chart.dataContext.dateDataRows.lastValue as Date;
                var f = indicator.chart.dataContext.dateDataRows.firstValue as Date;
                if (l && f) {
                    const diff = (l.getTime() - f.getTime()) / 1000 / dailyInterval;
                    if (diff > 0) {
                        params.barsCount = diff;
                    }
                } else {
                    const diff = interval / dailyInterval;
                    if (diff > 0) {
                        params.barsCount = params.barsCount * diff;
                    }
                }
            } catch (error) {}
            params.barsCount = Math.round(params.barsCount);
        }

        return this._bftService.getRTDCalculation(params).then(data => {
            return data;
        });
    }
}
