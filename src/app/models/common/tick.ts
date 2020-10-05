import {IInstrument} from "./instrument";
import {ESide} from "./side";

export interface ITick {
    instrument: IInstrument;
    price: number;
    volume: number;
    side: ESide;
    time: number;
}

export interface IMTTick {
    symbol: string;
    volume: number;
    last: number;
    bid: number;
    ask: number;
}

export interface ILevel2 {
    instrument: IInstrument;
    buys: ITick[];
    sells: ITick[];
}
