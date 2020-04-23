export interface IBitmexLoginAction {
    apiKey: string;
    secret: string;
}

export enum DirectionTrades {
    Buy = 'Buy',
    Sell = 'Sell'
}

export enum EBitmexTimeInForce {
    Day = 'Day',
    GoodTillCancel = 'GoodTillCancel',
    ImmediateOrCancel = 'ImmediateOrCancel',
    FillOrKill = 'FillOrKill'
}

export enum EBitmexExecInst {
    None = 'None',
    ParticipateDoNotInitiate = 'ParticipateDoNotInitiate',
    MarkPrice = 'MarkPrice',
    LastPrice = 'LastPrice',
    IndexPrice = 'IndexPrice',
    ReduceOnly = 'ReduceOnly',
    Close = 'Close'

}
