import { Injectable, Inject } from '@angular/core';
import { WebsocketBase } from '@app/interfaces/socket/socketBase';
import { BFTSocketService } from '@app/services/socket/bft.socket.service';
import { AlgoService, IBFTAAlgoCacheItemResponse, IBFTAAlgoResponse, IBFTAAlgoResponseV2, IBFTAAlgoResponseV3, IBFTAlgoParameters, IBFTAMarketInfo, IBFTAPositionSize, IBFTAPositionSizeParameters, IBFTScannerCacheItem, IBFTScannerResponseHistoryItem, IRTDPayload } from '@app/services/algo.service';
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
        return this.alogService.calculateV3(params).toPromise();
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
}