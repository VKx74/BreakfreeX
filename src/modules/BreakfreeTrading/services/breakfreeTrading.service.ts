import { Injectable, Inject } from '@angular/core';
import { WebsocketBase } from '@app/interfaces/socket/socketBase';
import { BFTSocketService } from '@app/services/socket/bft.socket.service';
import { AlgoService, IBFTAAlgoCacheItemResponse, IBFTAAlgoResponse, IBFTAAlgoResponseV2, IBFTAAlgoResponseV3, IBFTAlgoParameters, IBFTAMarketInfo, IBFTAPositionSize, IBFTAPositionSizeParameters, IBFTScannerCacheItem, IBFTScannerResponseHistoryItem, ICFlexPayload, IRTDPayload } from '@app/services/algo.service';
import { IInstrument } from '@app/models/common/instrument';
import { IdentityService } from '@app/services/auth/identity.service';
import { map } from 'rxjs/operators';

export interface IPoolItem {
    resolve: any;
    reject: any;
}

@Injectable()
export class BreakfreeTradingService {

    constructor(@Inject(BFTSocketService) private ws: WebsocketBase, private alogService: AlgoService, private identity: IdentityService) {
    }

    getBftIndicatorCalculation(params: IBFTAlgoParameters): Promise<IBFTAAlgoResponse> {
        return this.alogService.calculate(params).toPromise();
    }

    getBftIndicatorCalculationV2(params: IBFTAlgoParameters): Promise<IBFTAAlgoResponseV2> {
        if (this.identity.isGuestMode) {
            return this.alogService.calculateV2Guest(params).toPromise();
        }
        return this.alogService.calculateV2(params).toPromise();
    }

    getBftIndicatorCalculationV3(params: IBFTAlgoParameters): Promise<IBFTAAlgoResponseV3> {
        return this.alogService.calculateV3(params).pipe(map((_) => {
            // let test = _.sar.slice(-10);
            // test = test.reverse();
            // let last = _.sar[_.sar.length - 1];
            // _.sar_prediction = [];
            
            // let i = 1;
            // let lastLevel = null;
            // for (let s of test) {
            //     let o = {...s};
            //     o.date = last.date + (timeinterval * i);
            //     i++;
            //     _.sar_prediction.push(o);
            //     lastLevel = o;
            // }

            // if (_.sar_prediction && _.sar_prediction.length) {
            //     let lastLevel = _.sar_prediction[_.sar_prediction.length - 1];
            //     _.levels.p28 = lastLevel.r_p28;
            //     _.levels.p18 = lastLevel.r_p18;
            //     _.levels.ee = lastLevel.r;
            //     _.levels.ze = lastLevel.s;
            //     _.levels.m18 = lastLevel.s_m18;
            //     _.levels.m28 = lastLevel.s_m28;
            //     _.levels.fe = lastLevel.n;
            // }
            return _;
        })).toPromise();
    }

    getBftSonarHistoryCache(symbol: string, exchange: string, timeframe: number, time: number, id: any): Promise<IBFTAAlgoCacheItemResponse> {
        return this.alogService.getSonarHistoryCache(symbol, exchange, timeframe, time).pipe(map((data: IBFTScannerCacheItem) => {
            if (!data) {
                return null;
            }

            const response: IBFTAAlgoResponseV2 = {
                levels: {} as any,
                size: 1,
                trade: data.trade,
                id: id
            };
            return {
                setup: response,
                trend: data.trend
            };
        })).toPromise();
    }

    getRTDCalculation(params: any): Promise<IRTDPayload> {
        if (this.identity.isGuestMode) {
            return this.alogService.calculateRTDGuest(params).toPromise();
        }
        return this.alogService.calculateRTD(params).toPromise();
    }
    
    getCFlex(params: any): Promise<ICFlexPayload> {
        return this.alogService.calculateCFlex(params).toPromise();
    }
}