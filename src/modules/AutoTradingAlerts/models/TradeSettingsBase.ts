import {TradeActionType} from "../../Trading/models/models";

export class TradeSettings {
    TradeActionType: TradeActionType;
}

export class PlaceTradeSettings extends TradeSettings {
    Side: string;
    Size: number;
    Symbol: string;
    Type: string;
    StopPrice?: number;
    Price?: number;
}

export class CancelTradeSettings extends TradeSettings {
    OrderId: string;
}