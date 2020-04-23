export class TimeFrameTrend {
    Trends: Array<boolean|object>;

    constructor(trends: Array<boolean|object>) {
        this.Trends = trends;
    }
}

export class SymbolTrendItem {

    Low: TimeFrameTrend;
    Medium: TimeFrameTrend;
    High: TimeFrameTrend;

    constructor() {
        this.Low = new TimeFrameTrend([]);
        this.Medium = new TimeFrameTrend([]);
        this.High = new TimeFrameTrend([]);
    }   
}