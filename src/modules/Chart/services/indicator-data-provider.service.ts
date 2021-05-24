import { Injectable } from "@angular/core";
import { BreakfreeTradingService } from 'modules/BreakfreeTrading/services/breakfreeTrading.service';
import { of } from 'rxjs';
import { IBFTAlgoParameters, IRTDPayload } from '@app/services/algo.service';
import { BrokerService } from '@app/services/broker.service';
import { MTBroker } from '@app/services/mt/mt.broker';
import { TradingHelper } from "@app/services/mt/mt.helper";
import { IdentityService } from "@app/services/auth/identity.service";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";

@Injectable()
export class IndicatorDataProviderService {

    private _cachedGuestModeData: any;

    constructor(protected _bftService: BreakfreeTradingService, protected _broker: BrokerService, private _identity: IdentityService, private _http: HttpClient) {
        if (this._identity.isGuestMode) {
            _http.get("./assets/data/guest-mode-data-indicator.json").subscribe((data) => {
                this._cachedGuestModeData = data;
            });
        }
    }

    getData(indicator: TradingChartDesigner.Indicator, params?: object): Promise<any> {
        const bftParams = params as IBFTAlgoParameters;

        const chart = indicator.chart;

        let replayCandleDate = null;
        if (chart.replayMode.isInPlayMode) {
            const replayBack = chart.replayMode.originDataRows[".close"].length - chart.dataContext.dataRows[".close"].length;
            const datesCount = chart.dataContext.dateDataRows.values.length;
            replayCandleDate = chart.dataContext.dateDataRows.values[datesCount - 1];
            bftParams.replay_back = replayBack;

            if (replayBack > 5000) {
                return of({
                    algo_Info: {
                        status: "Playback allowed on last 5000 candles." 
                    }
                }).toPromise();
            }
        }

        if (this._identity.isGuestMode && replayCandleDate) {
            const result = this._cachedGuestModeData[replayCandleDate.getTime()];
            if (result) {
                result.id = bftParams.id;
                return of(result).toPromise();
            }
        }

        if (this._broker.activeBroker instanceof MTBroker) {
            const broker = this._broker.activeBroker as MTBroker;

            if (!bftParams.input_accountsize && broker.accountInfo && broker.accountInfo.Currency) {
                bftParams.account_currency = broker.accountInfo.Currency;
            }
            
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
        return this._bftService.getRTDCalculation(params).then(data => {
            data.global_trend_strength = TradingHelper.convertTrendSpread(data.global_trend_spread);
            data.local_trend_strength = TradingHelper.convertTrendSpread(data.local_trend_spread);
            let lastFast = data.fast[data.fast.length - 1];
            let lastFast2 = data.fast_2[data.fast_2.length - 1];
            let lastSlow = data.slow[data.slow.length - 1];
            let lastSlow2 = data.slow_2[data.slow_2.length - 1];
            let isGlobalUptrend = lastFast2 > lastSlow2;
            let isLocalUptrend = lastFast > lastSlow;
            let globalTrendDesc = [];

            if (isGlobalUptrend) {
                globalTrendDesc.push("Uptrend");
            } else {
                globalTrendDesc.push("Downtrend");
            }

            let generalSpread = data.global_trend_spread;
            if (isGlobalUptrend === isLocalUptrend) {
                let diff = (data.local_trend_spread - data.global_trend_spread) / 4;
                generalSpread += diff;
            } else {
                generalSpread -= data.local_trend_spread / 3;
            }

            if (generalSpread < 0) {
                generalSpread = 0;
                globalTrendDesc = [];
                globalTrendDesc.push("Sideways");
            } else {
                let generalStrength = TradingHelper.convertTrendSpread(generalSpread);
                generalSpread *= 100;
                globalTrendDesc.push(`${generalStrength} (${generalSpread.toFixed(2)}%)`);
            }

            data.general_trend = globalTrendDesc;
            return data;
        });
    }
}
