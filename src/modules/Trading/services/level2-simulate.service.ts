import {Injectable} from "@angular/core";
import {JsUtil} from "../../../utils/jsUtil";

export enum Level2DataType {
    bid,
    ask
}

export interface ILevel2DataItem {
    marketMaker: string;
    value: number;
    size: number;
    time: string;
    type: Level2DataType;
}

const MarketMakers = [
    'EGDA',
    'BOS',
    'ARCA',
    'PHL',
    'NSD',
    'NSDQ',
    'NYE',
    'VNDM',
    'KEYB',
    'MSCO',
    'BRUT',
    'BTRD'
];



@Injectable()
export class Level2SimulateService {
    constructor() {

    }

    getLevel2DataItem(): ILevel2DataItem {
        return {
            marketMaker: this._getMarketMaker(),
            type: this._getLevel2DataType(),
            value: JsUtil.roundNumber(JsUtil.getRandomNumber(30, 30.03), 3),
            size: JsUtil.roundNumber(JsUtil.getRandomNumber(40, 200), 3),
            time: new Date().toISOString()
        };
    }

    private _getLevel2DataType(): Level2DataType {
        return Math.random() > 0.5 ? Level2DataType.ask : Level2DataType.bid;
    }

    private _getMarketMaker(): string {
        const index = JsUtil.getRandomInteger(0, MarketMakers.length - 1);
        return MarketMakers[index];
    }
}
