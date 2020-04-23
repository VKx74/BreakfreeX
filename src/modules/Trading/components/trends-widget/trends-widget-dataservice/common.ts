export class CandleDto {
    Timestamp: number;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
}

export class ExchangeHistoryDto {
    Exchange: string;
    HistoriesPerEachGranularity: object;
}

export class ComplexHistoryDto {
    Symbol: string;
    Count: number;
    HistoryData: Array<ExchangeHistoryDto>;
}