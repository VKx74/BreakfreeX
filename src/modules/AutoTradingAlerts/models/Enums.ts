export enum EAlertType {
    PriceAlert = 'PriceAlert',
    ChannelAlert = 'ChannelAlert',
    MovingAlert = 'MovingAlert',
    IndicatorAlert = 'IndicatorAlert'
}

export enum EDataSourceType {
    RealtimeDataSource = 'RealtimeDataSource',
    IndicatorDataSource = 'IndicatorDataSource'
}

export enum EPriceAlertCondition {
    Crossing = 'Crossing',
    CrossingUp = 'CrossingUp',
    CrossingDown = 'CrossingDown',
    GreaterThan = 'GreaterThan',
    LessThan = 'LessThan'
}

export enum EChannelAlertCondition {
    EnteringChannel = 'EnteringChannel',
    ExitingChannel = 'ExitingChannel',
    InsideChannel = 'InsideChannel',
    OutsideChannel = 'OutsideChannel'
}

export enum EMovingAlertCondition {
    MovingUp = 'MovingUp',
    MovingDown = 'MovingDown',
    MovingUpPercentage = 'MovingUpPercentage',
    MovingDownPercentage = 'MovingDownPercentage'
}