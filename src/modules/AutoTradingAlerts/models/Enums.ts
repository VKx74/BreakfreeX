export enum AlertCondition {
    GreaterThan = 'GreaterThan',
    LessThan = 'LessThan'
}

export enum TriggerType {
    NewSetup = "NewSetup",
    SetupDisappeared = "SetupDisappeared"
}

export enum TriggerTimeframe {
    AllTimeframes = "allTimeframes",
    Min1 = "1m",
    Min5 = "5m",
    Min15 = "15m",
    Min30 = "30m",
    Hour1 = "1h",
    Hour4 = "4h",
    Day1 = "1d"
}

export enum TriggerSetup {
    AllSetups = "allSetups",
    Swing = "swing",
    BRC = "brc",
    EXT = "ext"
}