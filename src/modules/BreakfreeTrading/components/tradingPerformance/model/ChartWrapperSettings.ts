export class ChartWrapperSettings {
    constructor(index: number, header: string, chartType: string, unit: string) {
        this.index = index;
        this.header = header;
        this.chartType = chartType;
        this.unit = unit;
    }
    public index: number;
    public header: string;
    public chartType: string;
    public unit: string;
}