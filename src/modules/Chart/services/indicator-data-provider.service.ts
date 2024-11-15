import { Injectable } from "@angular/core";
import { BreakfreeTradingService } from 'modules/BreakfreeTrading/services/breakfreeTrading.service';
import { Observable, of, Subject } from 'rxjs';
import { IBFTAAlgoCacheItemResponse, IBFTAAlgoTrendResponse, IBFTAlgoParameters, ICFlexPayload, IRTDPayload } from '@app/services/algo.service';
import { BrokerService } from '@app/services/broker.service';
import { MTBroker } from '@app/services/mt/mt.broker';
import { TradingHelper } from "@app/services/mt/mt.helper";
import { IdentityService } from "@app/services/auth/identity.service";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { BinanceFuturesUsdBroker } from "@app/services/binance-futures/binance-futures-usd.broker";
import { BinanceBroker } from "@app/services/binance/binance.broker";
import { BinanceFuturesCoinBroker } from "@app/services/binance-futures/binance-futures-coin.broker";
import { BinanceFuturesBroker } from "@app/services/binance-futures/binance-futures.broker";

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
        return this._calculateData(indicator, params);
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
    
    getCFlex(indicator: TradingChartDesigner.Indicator, params?: any): Promise<ICFlexPayload> {
        let request = {
            timeframe: params["timeframe"],
            instrument: params["instrument"],
            barsCount: params["barsCount"],
            period: params["reflexPeriod"],
            superSmooth: params["superSmoothPeriod"],
            postSmooth: params["postSmoothPeriod"],
            id: params["id"],
            version: ""
        };

        if (!request.barsCount)
        {
            return null;
        }

        return this._bftService.getCFlex(request).then(data => {
            return data;
        });
    }

    private _calculateData(indicator: TradingChartDesigner.Indicator, params?: object): Promise<any> {
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
                if (contract_size) {
                    bftParams.contract_size = contract_size;
                }
            }

            console.log(">>> Contract size: " + bftParams.contract_size);
        } else if (this._broker.activeBroker instanceof BinanceFuturesUsdBroker || this._broker.activeBroker instanceof BinanceFuturesCoinBroker) {
            const broker = this._broker.activeBroker as BinanceFuturesBroker;
            const brokerInstrument = broker.instrumentToBrokerFormat(bftParams.instrument.symbol);
            const asset =  brokerInstrument ? broker.assets.find(_ => _.Asset === brokerInstrument.dependInstrument) : null;

            if (asset) {
                bftParams.account_currency = asset.Asset;
                if (asset.WalletBalance) {
                    if (!bftParams.input_accountsize) {
                        bftParams.input_accountsize = asset.WalletBalance;
                    }

                    bftParams.contract_size = 1;
                }
            }
        } else if (this._broker.activeBroker instanceof BinanceBroker) {
            const broker = this._broker.activeBroker as BinanceBroker;
            const brokerInstrument = broker.instrumentToBrokerFormat(bftParams.instrument.symbol);
            const asset = brokerInstrument ? broker.funds.find(_ => _.Coin === brokerInstrument.dependInstrument) : null;

            if (asset) {
                bftParams.account_currency = asset.Coin;
                if (asset.AvailableBalance) {
                    if (!bftParams.input_accountsize) {
                        bftParams.input_accountsize = asset.AvailableBalance;
                    }

                    bftParams.contract_size = 1;
                }
            }
        }

        if (indicator instanceof TradingChartDesigner.BreakfreeTradingML) {
            return this._bftService.getBftIndicatorCalculationV3(bftParams);
        } else {
            return this._bftService.getBftIndicatorCalculationV2(bftParams);
        }
    }
}

export interface IBFTAAlgoCacheItemAdded {
    id: string;
    item: IBFTAAlgoCacheItemResponse;
}

@Injectable()
export class SonarChartIndicatorDataProviderService extends IndicatorDataProviderService {
    private static _cache: { [symbol: string]: IBFTAAlgoCacheItemResponse } = {};

    dataAddedToCache: Subject<IBFTAAlgoCacheItemAdded> = new Subject();

    getData(indicator: TradingChartDesigner.Indicator, params?: object): Promise<any> {
        const chart = indicator.chart;
        const lastDate: Date = chart.dataContext.dateDataRows.lastValue as Date;

        if (!lastDate) {
            return null;
        }

        // if (!chart.replayMode.isInPlayMode) {
        //     return super.getData(indicator, params);
        // }

        const symbol = chart.instrument.id;
        const exchange = chart.instrument.exchange;
        const timeframe = chart.timeInterval / 1000;
        const endTime = lastDate.getTime() / 1000;
        const key = this._getKey(symbol, exchange, timeframe, endTime);
        const id = (params as any).id;

        if (SonarChartIndicatorDataProviderService._cache[key]) {
            const res = {
                ...SonarChartIndicatorDataProviderService._cache[key].setup
            };
            res.id = id;
            return of(res).toPromise();
        }

        return this._getDataFromCache(symbol, exchange, timeframe, endTime, id).then((_) => {
            if (_) {
                SonarChartIndicatorDataProviderService._cache[key] = _;
                this.dataAddedToCache.next({
                    item: _,
                    id: key
                });
                return _.setup;
            }

            return {};
        });
    }

    getTrend(symbol: string, exchange: string, timeframe: number, endTime: number): IBFTAAlgoTrendResponse {
        const key = this._getKey(symbol, exchange, timeframe, endTime);
        if (SonarChartIndicatorDataProviderService._cache[key]) {
            return SonarChartIndicatorDataProviderService._cache[key].trend;
        }
        return null;
    }

    private _getDataFromCache(symbol: string, exchange: string, timeframe: number, time: number, id: any): Promise<any> {
        return this._bftService.getBftSonarHistoryCache(symbol, exchange, timeframe, time, id);
    }

    private _getKey(symbol: string, exchange: string, timeframe: number, time: number): string {
        return `${symbol}${exchange}${timeframe}${time}`;
    }
}