import { CandleDto } from "./trends-widget-dataservice/common";

export class TrendCalculator {

    static calculate(candles: Array<CandleDto>): Array<boolean | object> {
        let highValues = new Array<number>();
        let lowValues = new Array<number>();
        candles.forEach(candle => {
            highValues.push(candle.High);
            lowValues.push(candle.Low);
        });

        let emaHigh = TrendCalculator.calculateEMA(highValues, 6);
        let emaLow = TrendCalculator.calculateEMA(lowValues, 3);

        let result = new Array<boolean | object>();
        candles.forEach((candle, index) => {
            let closeValue = candle.Close;
            let emaMiddle = (emaHigh[index] + emaLow[index]) / 2;
            let trend = closeValue > emaMiddle;
            result.push(trend);
        });

        return result;
    }

    private static calculateEMA(series: Array<number>, period: number): Array<number> {
        let result = new Array<number>();
        let emaConstant1 = 2 / (1 + period);
        let emaConstant2 = 1 - 2 / (1 + period);

        let emaPrev = 0;
        series.forEach(value => {
            let emaCurrent = emaPrev === 0
                ? value
                : value * emaConstant1 + emaPrev * emaConstant2;

            result.push(emaCurrent);
            emaPrev = emaCurrent;
        });

        return result;
    }
}