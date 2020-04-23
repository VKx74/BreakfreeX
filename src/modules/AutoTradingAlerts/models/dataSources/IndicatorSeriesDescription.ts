export interface IndicatorSeriesDescription {
    IndicatorName: string;
    SeriesName: string;
    SeriesIndex: number;
    IndicatorParameters: IndicatorParameter[];
    Title: string;
}

export class IndicatorParameter {
    Name: string;
    Value: string | number;
}