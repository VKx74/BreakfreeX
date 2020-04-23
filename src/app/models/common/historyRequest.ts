import {IInstrument} from "./instrument";
import {ITimeFrame} from "./timeFrame";

export interface IHistoryRequest {
    instrument: IInstrument;
    timeFrame: ITimeFrame;
    startDate: Date;
    endDate: Date;
}

export interface IHistoryByBackBarsCountRequest {
    instrument: IInstrument;
    timeFrame: ITimeFrame;
    barsCount: number;
    endDate: Date;
}
