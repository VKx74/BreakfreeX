import {
    IGeneralParams, IGenerateMath,
    IInfoMultiData, IParamsInfo, IScriptIndicatorsDocumentation,
    IScriptingCoverInfo,
    IScriptingOrderInfo, ITradingPositionAndGeneral
} from "@scripting/models/interfacesDocumentation";

export enum DocumentationCategory {
    Indicators = 'Indicator',
    Math = 'Math',
    Trading = 'Trading',
    General = 'General',
    MultiData = 'MultiData'
}

const paramsIndicator = {
    double: {
        type: 'Double',
        example: '3.5'
    },
    idr: {
        type: 'IDataRows',
        example: {
            close: 'close',
            high: 'high',
            low: 'low',
            volume: 'volume',
            open: 'open',
            typical: 'typical',
            median: 'median',
            input: 'input'
        }
    },
    int: {
        type: 'int',
        example: '14'
    },
    bool: {
        type: 'bool',
        example: 'true'
    },
    calculate: {
        type: 'Calculate',
        example: 'culc'
    }
};

export const ParamsTypesIndicator: IParamsInfo[] = [
    {
        name: 'calculate',
        type: paramsIndicator.calculate.type,
        example: paramsIndicator.calculate.example,
        description: 'Calculation type',
        required: false
    },
    {
        name: 'close',
        type: paramsIndicator.idr.type,
        example: paramsIndicator.idr.example.close,
        description: 'Input series for calculation',
        required: false
    },
    {
        name: 'high',
        type: paramsIndicator.idr.type,
        example: paramsIndicator.idr.example.high,
        description: 'Input series for calculation',
        required: false
    },
    {
        name: 'low',
        type: paramsIndicator.idr.type,
        example: paramsIndicator.idr.example.low,
        description: 'Input series for calculation',
        required: false
    },
    {
        name: 'volume',
        type: paramsIndicator.idr.type,
        example: paramsIndicator.idr.example.volume,
        description: 'Input series for calculation',
        required: false
    },
    {
        name: 'open',
        type: paramsIndicator.idr.type,
        example: paramsIndicator.idr.example.open,
        description: 'Input series for calculation',
        required: false
    },
    {
        name: 'typical',
        type: paramsIndicator.idr.type,
        example: paramsIndicator.idr.example.typical,
        description: 'Input series for calculation',
        required: false
    },
    {
        name: 'median',
        type: paramsIndicator.idr.type,
        example: paramsIndicator.idr.example.median,
        description: 'Input series for calculation',
        required: false
    },
    {
        name: 'input',
        type: paramsIndicator.idr.type,
        example: paramsIndicator.idr.example.input,
        description: 'Input series for calculation',
        required: false
    },
    {
        name: 'period',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: "Indicator period",
        required: true
    },
    {
        name: 'interval',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator interval',
        required: true
    },
    {
        name: 'smooth',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator smooth parameter',
        required: true
    },
    {
        name: 'fast',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator fast parameter',
        required: true
    },
    {
        name: 'slow',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator slow parameter',
        required: true
    },
    {
        name: 'mAPeriod',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator mAPeriod parameter',
        required: true
    },
    {
        name: 'rOCPeriod',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'rOCPeriod',
        required: true
    },
    {
        name: 'smoothing',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator smoothing parameter',
        required: true
    },
    {
        name: 'volumeDivisor',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator volumeDivisor parameter',
        required: true
    },
    {
        name: 'barCount',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator barCount parameter',
        required: true
    },
    {
        name: 'barDown',
        type: paramsIndicator.bool.type,
        example: paramsIndicator.bool.example,
        description: 'Indicator barDown parameter',
        required: true
    },
    {
        name: 'loverHigh',
        type: paramsIndicator.bool.type,
        example: paramsIndicator.bool.example,
        description: 'Indicator loverHigh parameter',
        required: true
    },
    {
        name: 'loverLow',
        type: paramsIndicator.bool.type,
        example: paramsIndicator.bool.example,
        description: 'Indicator loverLow parameter',
        required: true
    },
    {
        name: 'barUp',
        type: paramsIndicator.bool.type,
        example: paramsIndicator.bool.example,
        description: 'Indicator barUp parameter',
        required: true,
    },
    {
        name: 'higherHigh',
        type: paramsIndicator.bool.type,
        example: paramsIndicator.bool.example,
        description: 'Indicator higherHigh parameter',
        required: true,
    },
    {
        name: 'higherLow',
        type: paramsIndicator.bool.type,
        example: paramsIndicator.bool.example,
        description: 'Indicator higherLow parameter',
        required: true,
    },
    {
        name: 'periodQ',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator periodQ parameter',
        required: true
    },
    {
        name: 'ema1',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator ema1 parameter',
        required: true
    },
    {
        name: 'ema2',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Idicator ema2 parameter',
        required: true
    },
    {
        name: 'length',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator length parameter',
        required: true
    },
    {
        name: 'tCount',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator tCount parameter',
        required: true
    },
    {
        name: 'vFactor',
        type: paramsIndicator.double.type,
        example: paramsIndicator.double.example,
        description: 'Indicator vFactor parameter',
        required: true
    },
    {
        name: 'forecast',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator forecast parameter',
        required: true
    },
    {
        name: 'intermediate',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator intermediate parameter',
        required: true
    },
    {
        name: 'volatilityPeriod',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator volatilityPeriod parameter',
        required: true
    },
    {
        name: 'bandPct',
        type: paramsIndicator.double.type,
        example: paramsIndicator.double.example,
        description: 'Indicator bandPct parameter',
        required: true,
    },
    {
        name: 'numStdDev',
        type: paramsIndicator.double.type,
        example: paramsIndicator.double.example,
        description: 'Indicator numStdDev parameter',
        required: true
    },
    {
        name: 'line1value',
        type: paramsIndicator.double.type,
        example: paramsIndicator.double.example,
        description: 'Indicator line1Value parameter',
        required: true,
    },
    {
        name: 'line2Value',
        type: paramsIndicator.double.type,
        example: paramsIndicator.double.example,
        description: 'Indicator line2Value parameter',
        required: true,

    },
    {
        name: 'line3Value',
        type: paramsIndicator.double.type,
        example: paramsIndicator.double.example,
        description: 'Indicator line3Value parameter',
        required: true,
    },
    {
        name: 'line4Value',
        type: paramsIndicator.double.type,
        example: paramsIndicator.double.example,
        description: 'Indicator line4Value parameter',
        required: true,
    },
    {
        name: 'offsetMultiplier',
        type: paramsIndicator.double.type,
        example: paramsIndicator.double.example,
        description: 'Indicator offsetMultiplier parameter',
        required: true,
    },
    {
        name: 'envelopePercentage',
        type: paramsIndicator.double.type,
        example: paramsIndicator.double.example,
        description: 'Indicator envelopePercentage parameter',
        required: true,
    },
    {
        name: 'mAType',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator mAType parameter',
        required: true,
    },
    {
        name: 'periodD',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator periodD parameter',
        required: true,
    },
    {
        name: 'periodK',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator periodK parameter',
        required: true,
    },
    {
        name: 'Indicator signalPeriod parameter',
        type: paramsIndicator.int.type,
        example: paramsIndicator.int.example,
        description: 'Indicator signalPeriod parameter',
        required: true,
    },

];

export const paramsScripting = {
    string: {
        type: 'string',
        example: "'str'"
    },
    decimal: {
        type: 'decimal',
        example: '15.5'
    },
    int: {
        type: 'int',
        example: '14'
    },
};

export const paramsOrderInfo: IParamsInfo[] = [
    {
        name: 'quantity',
        type: paramsScripting.int.type,
        example: paramsScripting.int.example,
        description: '\n' +
            'Quantity of order. Default 1. (optional parameter)\n'
    },
    {
        name: 'symbol',
        type: paramsScripting.string.type,
        example: paramsScripting.string.example,
        description: '\n' +
            'Symbol by which place order, default if not specified. (optional parameter) \n'
    },
    {
        name: 'limitPrice',
        type: paramsScripting.decimal.type,
        example: paramsScripting.decimal.example,
        description: 'The limit price of the order. Required for limit order'
    },
    {
        name: 'stopPrice',
        type: paramsScripting.decimal.type,
        example: paramsScripting.decimal.example,
        description: 'The stop price of the order. Required for stop order'
    }
    // ,
    // {
    //     name: 'fromEntrySignal',
    //     type: paramsScripting.string.type,
    //     example: paramsScripting.string.example,
    //     description: '\n' +
    //         'The entry signal name. This ties the exit to the entry and exits the position quantity represented by the actual entry.\n'
    // },
];

export const paramsMath = {
    UInt: {
        type: 'UInt',
        example: '14',
        description: 'Returns the absolute value unsigned integer.'
    },
    UInt16: {
        type: 'UIn16',
        example: '15',
        description: '\t\n' +
            'Returns the absolute value of a 16-bit unsigned integer.'
    },
    UInt32: {
        type: 'UInt32',
        example: '31',
        description: '\t\n' +
            'Returns the absolute value of a 32-bit unsigned integer.'
    },
    UInt64: {
        type: 'UInt64',
        example: '63',
        description: '\t\n' +
            'Returns the absolute value of a 64-bit unsigned integer.'
    },
    double: {
        type: 'Double',
        example: '3.5',
        description: 'Returns the absolute value of a double-precision floating-point number.'
    },
    number: {
        type: 'Number',
        example: '18',
        description: 'Returns the absolute value signed number.'
    },
    int: {
        type: 'int',
        example: '45',
        description: 'Returns the absolute value signed integer.'
    },
    int16: {
        type: 'in16',
        example: '16',
        description: '\t\n' +
            'Returns the absolute value of a 16-bit signed integer.'
    },
    int32: {
        type: 'int32',
        example: '32',
        description: '\t\n' +
            'Returns the absolute value of a 32-bit signed integer.'
    },
    int64: {
        type: 'int32',
        example: '64',
        description: '\t\n' +
            'Returns the absolute value of a 64-bit signed integer.'
    },
    decimal: {
        type: 'decimal',
        example: '15.5',
        description: 'Returns the absolute value of a Decimal number.'
    },
    SByte: {
        type: 'int8',
        example: '8',
        description: '\t\n' +
            'Returns the absolute value of a 8-bit signed integer.'
    },
    Byte: {
        type: 'unint8',
        example: '8',
        description: '\t\n' +
            'Returns the absolute value of a 8-bit unsigned integer.'
    },
    single: {
        type: 'single',
        example: '20.5',
        description: 'Returns the absolute value of a single-precision floating-point number.'
    }
};

const paramsCrossFunc: IGeneralParams[] = [
    {
        example: '14',
        name: 'lookBackPeriod',
        type: 'int',
        description: 'Number of elements back'
    },
    {
        example: '3.5',
        name: 'value',
        type: 'double',
        description: 'Single data'
    },
    {
        example: '3.5',
        name: 'dataRow',
        type: 'IDataRow<double>',
        description: 'Data series'
    }
];

export const documentationsMath: IGenerateMath[] = [
    {
        name: 'Abs',
        description: 'Absolute value',
        parameters: [paramsMath.double, paramsMath.SByte, paramsMath.int16, paramsMath.int32, paramsMath.int64, paramsMath.single, paramsMath.decimal],
        quantityOverloads: 7,
        numberCount: 1,
    },
    {
        name: 'Acos',
        description: 'Returns the angle whose cosine is the specified number',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Acosh',
        description: 'Returns the angle whose cosine is the specified number',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Asin',
        description: 'Returns the angle whose sine is the specified number',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Asinh',
        description: 'Returns the angle whose sine is the specified number',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Atan',
        description: 'Returns the angle whose tangent is the specified number',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Atan2',
        description: 'Returns the angle whose tangent is the quotient of two specified numbers',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 2,
    },
    {
        name: 'Atanh',
        description: 'Returns the angle whose tangent is the specified number',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'BigMul',
        description: 'Produces the full product of two 32-bit numbers.',
        parameters: [paramsMath.int],
        quantityOverloads: 1,
        numberCount: 2,
    },
    {
        name: 'BitDecrement',
        description: '',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'BitIncrement',
        description: '',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Cbrt',
        description: '',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Ceiling',
        description: 'Returns the smallest integral value that is greater than or equal to the specified decimal number',
        parameters: [paramsMath.decimal, paramsMath.double],
        quantityOverloads: 2,
        numberCount: 1,
    },
    {
        name: 'CopySign',
        description: '',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 2,
    },
    {
        name: 'Cos',
        description: 'Returns the cosine of the specified angle',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Cosh',
        description: 'Returns the hyperbolic cosine of the specified angle',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'DivRem',
        description: 'Calculates the quotient of two numbers and also returns the remainder in an output parameter.',
        parameters: [paramsMath.int],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Exp',
        description: 'Returns "e" raised to the specified power',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Floor',
        description: 'Returns the largest integral value less than or equal to the specified decimal number',
        parameters: [paramsMath.double, paramsMath.decimal],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'FusedMultiplyAdd',
        description: '',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 3,
    },
    {
        name: 'Clamp',
        description: '',
        parameters: [paramsMath.int16, paramsMath.int32, paramsMath.int64, paramsMath.double, paramsMath.decimal, paramsMath.single, paramsMath.UInt16, paramsMath.UInt32, paramsMath.UInt64, ],
        quantityOverloads: 6,
        numberCount: 3,
    },
    {
        name: 'IEEERemainder',
        description: 'Returns the remainder resulting from the division of a specified number by another specified number.',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 2,
    },
    {
        name: 'Log10',
        description: 'Returns the base 10 logarithm of a specified number',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Log',
        description: 'Returns the logarithm of a specified number in a specified base',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 2,
    },
    {
        name: 'Log2',
        description: 'Returns the logarithm of a specified number in a specified base',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'ILogB',
        description: 'Returns the logarithm of a specified number in a specified base',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Log10',
        description: 'Returns the base 10 logarithm of a specified number',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Max',
        description: 'Returns the larger of two numbers',
        parameters: [paramsMath.int16, paramsMath.int32, paramsMath.int64, paramsMath.double, paramsMath.decimal, paramsMath.single, paramsMath.UInt16, paramsMath.UInt32, paramsMath.UInt64],
        quantityOverloads: 6,
        numberCount: 2,
    },
    {
        name: 'MaxMagnitude',
        description: 'Returns the larger of two numbers',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 2,
    },
    {
        name: 'Min',
        description: 'Returns the smaller of two numbers',
        parameters: [paramsMath.int16, paramsMath.int32, paramsMath.int64, paramsMath.double, paramsMath.decimal, paramsMath.single, paramsMath.UInt16, paramsMath.UInt32, paramsMath.UInt64],
        quantityOverloads: 6,
        numberCount: 2,
    },
    {
        name: 'MinMagnitude',
        description: 'Returns the smaller of two numbers',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 2,
    },
    {
        name: 'Pow',
        description: 'Returns a specified number raised to the specified power',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 2,
    },
    {
        name: 'Round',
        description: 'Rounds a double value to the nearest integral value, and rounds midpoint values to the nearest even number',
        parameters: [paramsMath.number],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'ScaleB',
        description: '',
        parameters: [paramsMath.double, paramsMath.int],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Sign',
        description: 'Returns an integer that indicates the sign of a number.',
        parameters: [paramsMath.single, paramsMath.decimal, paramsMath.double, paramsMath.int],
        quantityOverloads: 4,
        numberCount: 1,
    },
    {
        name: 'Sin',
        description: 'Returns the sine of the specified angle',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Sinh',
        description: 'Returns the hyperbolic sine of the specified angle.',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Sqrt',
        description: 'Returns the square root of a specified number',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Tan',
        description: 'Returns the tangent of the specified angle',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Tanh',
        description: 'Returns the hyperbolic tangent of the specified angle.\n' +
            '\n',
        parameters: [paramsMath.double],
        quantityOverloads: 1,
        numberCount: 1,
    },
    {
        name: 'Truncate',
        description: 'Calculates the integral part of a number.' +
            '\n',
        parameters: [paramsMath.decimal, paramsMath.double],
        quantityOverloads: 2,
        numberCount: 1,
    },
];

export const documentationsIndicator: IScriptIndicatorsDocumentation[] = [
    {
        name: "ADL",
        description: "Accumulation Distribution Line",
        nameParams: [
        'close',
        'high',
        'low',
        'volume',
        'calculate'],
        output: ['Value']
    },
    {
        name: "ADX",
        description: "Average directional index",
        nameParams: [
        'close',
        'high',
        'low',
        'period',
        'calculate'],
        output: ['Value']
    },
    {
        name: "ADXR",
        description: "Directional Movement Rating",
        nameParams: [
        'close',
        'high',
        'low',
        'interval',
        'period',
        'calculate'],
        output: ['Value']
    },
    {
        name: "AroonOscillator",
        description: "Aroon Oscillator",
        nameParams: [
        'high',
        'low',
        'period',
        'calculate'],
        output: ['Value']
    },
    {
        name: "ATR",
        description: "Average True Range",
        nameParams: [
        'close',
        'high',
        'low',
        'period',
        'calculate'],
        output: ['Value']
    },
    {
        name: "BOP",
        description: "Balance of Power",
        nameParams: [
        'open',
        'high',
        'low',
        'close',
        'smooth',
        'calculate'],
        output: ['Value']
    },
    {
        name: "CCI",
        description: "Commodity Channel Index",
        nameParams: [
        'typical',
        'period',
        'calculate'],
        output: ['Value']
    },
    {
        name: "ChaikinMoneyFlow",
        description: "Chaikin Money Flow",
        nameParams: [
        'close',
        'high',
        'low',
        'volume',
        'period',
        'calculate'],
        output: ['Value']
    },
    {
        name: "ChaikinOscillator",
        description: "Chaikin Oscillator",
        nameParams: [
        'close',
        'high',
        'low',
        'volume',
        'fast',
        'slow',
        'calculate'],
        output: ['Value']
    },
    {
        name: "ChaikinVolatility",
        description: "Chaikin Volatility",
        nameParams: [
        'high',
        'low',
        'mAPeriod',
        'rOCPeriod',
        'calculate'],
        output: ['Value']
    },
    {
        name: "CMO",
        description: "Chaikin Oscillator",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "DEMA",
        description: "CDouble Exponential Moving Average",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "DeviationToMA",
        description: "Deviation To Movement Average",
        nameParams: [
        'close',
        'calculate'],
        output: ['Value']
    },
    {
        name: "DMIndex",
        description: "Directional Movement Index",
        nameParams: [
        'smooth',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "EaseOfMovement",
        description: "Ease Of Movement",
        nameParams: [
        'high',
        'low',
        'median',
        'volume',
        'smoothing',
        'volumeDivisor',
        'calculate'],
        output: ['Value']
    },
    {
        name: "EMA",
        description: "Exponential Moving Average",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "FOSC",
        description: "Forecast Oscillator",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "HMA",
        description: "Hull Moving Average",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "KAMA",
        description: "Kaufman`s Adaptive Moving Average",
        nameParams: [
        'fast',
        'period',
        'slow',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "KeyReversalDown",
        description: "Key Reversal Down",
        nameParams: [
        'close',
        'high',
        'period',
        'calculate'],
        output: ['Value']
    },
    {
        name: "KeyReversalUp",
        description: "Key Reversal Up",
        nameParams: [
        'close',
        'low',
        'period',
        'calculate'],
        output: ['Value']
    },
    {
        name: "LogChange",
        description: "Log Change",
        nameParams: [
        'close',
        'calculate'],
        output: ['Value']
    },
    {
        name: "MAX",
        description: "Maximum",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "MFI",
        description: "Money Flow Index",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "MIN",
        description: "Minimum",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "Momentum",
        description: "Momentum",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "NBarsDown",
        description: "Number of Bars Down",
        nameParams: [
        'open',
        'high',
        'low',
        'close',
        'barCount',
        'barDown',
        'lowerHigh',
        'lowerLow',
        'calculate'],
        output: ['Value']
    },
    {
        name: "NBarsUp",
        description: "Number of Bars Up",
        nameParams: [
        'open',
        'high',
        'low',
        'close',
        'barCount',
        'barDown',
        'lowerHigh'],
        output: ['Value']
    },
    {
        name: "OBV",
        description: "On-Balance Volume",
        nameParams: [
        'close',
        'volume',
        'calculate'],
        output: ['Value']
    },
    {
        name: "PEE",
        description: "PEE",
        nameParams: [
        'smooth',
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "PriceOscillator",
        description: "Price Oscillator",
        nameParams: [
        'smooth',
        'slow',
        'fast',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "Range",
        description: "Range",
        nameParams: [
        'high',
        'low',
        'calculate'],
        output: ['Value']
    },
    {
        name: "RIND",
        description: "RIND",
        nameParams: [
        'close',
        'high',
        'low',
        'periodQ',
        'smooth',
        'calculate'],
        output: ['Value']
    },
    {
        name: "ROC",
        description: "Rate of Change",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "RSS",
        description: "Relative Spread Strength",
        nameParams: [
        'ema1',
        'ema2',
        'length',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "SMA",
        description: "Simple Moving Average",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "StdDev",
        description: "Standard Deviation",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "StochRSI",
        description: "Stochastic Relative Strength Index",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "SUM",
        description: "Sum",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "T3",
        description: "T3",
        nameParams: [
        'period',
        'tCount',
        'vFactor',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "TEMA",
        description: "Triple Exponential Moving Average",
        nameParams: [
        'period',
        'input',
        'calculate'],
        output: ['Value']
    },
    {
        name: "TMA",
        description: "TMA",
        nameParams: ['period', 'input', 'calculate'],
        output: ['Value']
    },
    {
        name: "TSF",
        description: "Time Series Forecast",
        nameParams: ['input', 'forecast', 'period', 'calculate'],
        output: ['Value']
    },
    {
        name: "TSI",
        description: "True Strength Index",
        nameParams: ['close', 'fast', 'slow', 'calculate'],
        output: ['Value']
    },
    {
        name: "UltimateOscillator",
        description: "Ultimate Oscillatorx",
        nameParams: ['close', 'fast', 'high', 'low', 'intermediate', 'slow', 'calculate'],
        output: ['Value']
    },
    {
        name: "VaR",
        description: "VaR",
        nameParams: ['close', 'calculate'],
        output: ['Value']
    },
    {
        name: "VMA",
        description: "Variable Moving Average",
        nameParams: ['input', 'period', 'volatilityPeriod', 'calculate'],
        output: ['Value']
    },
    {
        name: "VOL",
        description: "Volume",
        nameParams: ['input', 'calculate'],
        output: ['Value']
    },
    {
        name: "Volatility",
        description: "Volatility",
        nameParams: ['close', 'calculate'],
        output: ['Value']
    },
    {
        name: "VOLMA",
        description: "Volume Moving Average",
        nameParams: ['volume', 'period', 'calculate'],
        output: ['Value']
    },
    {
        name: "VolumeOscillator",
        description: "Volume Oscillator",
        nameParams: ['volume', 'fast', 'slow', 'calculate'],
        output: ['Value']
    },
    {
        name: "VolumeUpdown",
        description: "Volume Up Down",
        nameParams: ['volume', 'open', 'close', 'calculate'],
        output: ['Value']
    },
    {
        name: "VROC",
        description: "Volume Rate of Change Definition",
        nameParams: ['volume', 'period', 'smooth', 'calculate'],
        output: ['Value']
    },
    {
        name: "WillamsR",
        description: "Williams %R",
        nameParams: ['close', 'high', 'low', 'period', 'calculate'],
        output: ['Value']
    },
    {
        name: "WMA",
        description: "Weighted Moving Average",
        nameParams: ['input', 'period', 'calculate'],
        output: ['Value']
    },
    {
        name: "Zlema",
        description: "Zero Lag Exponential Moving Average",
        nameParams: ['input', 'period', 'calculate'],
        output: ['Value']
    },
    {
        name: "Aroon",
        description: "Aroon",
        nameParams: ['high', 'low', 'period', 'calculate'],
        output: ['Value']
    },
    {
        name: "APZ",
        description: "Directional Movement Rating",
        nameParams: ['input', 'period', 'bandPct', 'high', 'low', 'calculate'],
        output: ['Value']
    },
    {
        name: "Bollinger",
        description: "Bollinger",
        nameParams: ['input', 'period', 'numStdDev', 'calculate'],
        output: ['Value']
    },
    {
        name: "DM",
        description: "Bollinger",
        nameParams: ['close', 'high', 'low', 'period', 'calculate'],
        output: ['Value']
    },
    {
        name: "ConstantLines",
        description: "Constant Lines",
        nameParams: ['input', 'line1Value', 'line2Value', 'line3Value', 'line4Value', 'calculate'],
        output: ['value']
    },
    {
        name: "DoichainChannel",
        description: "Doichain Channel",
        nameParams: ['high', 'low', 'period', 'calculate'],
        output: ['value']
    },
    // {
    //     name: "iMDD",
    //     description: "iMDD",
    //     nameParams: ['input'],
    //     output: ['ThreeDaysDataRow', 'MonthDataRow', 'YearDataRow']
    // },
    {
        name: "KaltnerChannel",
        description: "Kaltner Channel",
        nameParams: ['close', 'high', 'low', 'period', 'offsetMultiplier', 'calculate'],
        output: ['Value']
    },
    {
        name: "MACD",
        description: "Moving Average Convergence Divergence",
        nameParams: ['input', 'fast', 'slow', 'smooth', 'calculate'],
        output: ['Default', 'Avg', 'Diff']
    },
    {
        name: "MAEnvelopes",
        description: "Moving Average Envelopes",
        nameParams: ['input', 'envelopePercentage', 'mAType', 'period', 'calculate'],
        output: ['Upper', ' Middle', 'Lower']
    },
    {
        name: "PPO",
        description: "Percentage Price Oscillator",
        nameParams: ['input', 'fast', 'slow', 'smooth', 'calculate'],
        output: ['Default', ' Smoothed']
    },
    {
        name: "RSI",
        description: "Range Indicator",
        nameParams: ['input', 'period', 'smooth', 'calculate'],
        output: ['Default', 'Avg']
    },
    {
        name: "Stochastics",
        description: "Stochastics",
        nameParams: ['close', 'high', 'low', 'periodD', 'periodK', 'smooth', 'calculate'],
        output: ['D', 'K']
    },
    {
        name: "StochasticsFast",
        description: "Stochastics Fast",
        nameParams: ['input', 'periodD', 'periodK', 'calculate'],
        output: ['D', 'K']
    },
    {
        name: "TRIX",
        description: "Triple Exponential Average",
        nameParams: ['input', 'period', 'signalPeriod', 'calculate'],
        output: ['Default', 'Signal']
    },
    {
        name: "Trend",
        description: "Trend indicator",
        nameParams: ['close', 'high', 'low', 'calculate'],
        output: ['Value']
    },
];

export const documentationsScriptingOrder: IScriptingOrderInfo[] = [
    {
        name: "OrderLong",
        description: "a buy market",
        nameParams: ['quantity', 'symbol'],
    },
    {
        name: "OrderLongLimit",
        description: "a buy limit",
        nameParams: ['quantity', 'symbol', 'limitPrice'],
    },
    {
        name: "OrderLongStopLimit",
        description: "a buy stop limit",
        nameParams: ['quantity', 'symbol', 'limitPrice', 'stopPrice'],
    },
    // {
    //     name: "OrderLongStopMarket",
    //     description: "a buy short market",
    //     nameParams: ['quantity', 'symbol', 'stopPrice'],
    // },
    {
        name: "OrderShort",
        description: "a sell short market ",
        nameParams: ['quantity', 'symbol'],
    },
    {
        name: "OrderShortLimit",
        description: "a sell short limit",
        nameParams: ['quantity', 'symbol', 'limitPrice'],
    },
    {
        name: "OrderShortStopLimit",
        description: "a sell short stop limit",
        nameParams: ['quantity', 'symbol', 'limitPrice', 'stopPrice'],
    },
    // {
    //     name: "OrderShortStopMarket",
    //     description: "a sell short stop",
    //     nameParams: ['quantity', 'symbol', 'stopPrice'],
    // },
];

export const documentationsScriptingCover: IScriptingCoverInfo[] = [
    {
        name: "CoverLong",
        description: "a sell market",
        nameParams: ['quantity', 'symbol', 'fromEntrySignal'],
        examples: ["var coverLong = CoverLong()", "var coverLong = CoverLong(15.5)", "var coverLong = CoverLong('str')", "var coverLong = CoverLong('str', 'str')", "var coverLong = CoverLong(15.5, 'str', 'str')"]
    },
    {
        name: "CoverLongLimit",
        description: "a sell limit",
        nameParams: ['quantity', 'symbol', 'limitPrice', 'fromEntrySignal'],
        examples: ["var coverLongLimit = CoverLongLimit(15.5)", "var coverLongLimit = CoverLongLimit(15.5, 15.5)", "var coverLongLimit = CoverLongLimit(15.5, 'str')", "var coverLongLimit = CoverLongLimit(15.5, 'str', 'str')", "var coverLongLimit = CoverLongLimit(15.5, 15.5, 'str', 'str')"]
    },
    {
        name: "CoverLongStopMarket",
        description: "a sell stop market",
        nameParams: ['quantity', 'symbol', 'stopPrice', 'fromEntrySignal'],
        examples: ["var coverLongStopMarket = CoverLongStopMarket(15.5)", "var coverLongStopMarket = CoverLongStopMarket(15.5, 15.5)", "var coverLongStopMarket = CoverLongStopMarket(15.5, 'str')", "var coverLongStopMarket = CoverLongStopMarket(15.5, 15.5, 'str', 'str')", "var coverLongStopMarket = CoverLongStopMarket(15.5, 15.5, 15.5 'str', 'str'"]
    },
    {
        name: "CoverLongStopLimit",
        description: "a sell stop limit",
        nameParams: ['quantity', 'symbol', 'limitPrice', 'stopPrice', 'fromEntrySignal'],
        examples: ["var coverLongStopLimit = CoverLongStopLimit(15.5, 15.5)", "var coverLongStopLimit = CoverLongStopLimit(15.5, 15.5, 15.5)", "var coverLongStopLimit = CoverLongStopLimit(15.5, 'str')", "var coverLongStopLimit = CoverLongStopLimit(15.5, 'str', 'str')", "var coverLongStopLimit = CoverLongStopLimit(15.5, 15.5, 'str', 'str'"]
    },
    {
        name: "CoverShort",
        description: "a buy to cover market",
        nameParams: ['quantity', 'symbol', 'fromEntrySignal'],
        examples: ["var coverShort = CoverShort()", "var coverShort = CoverShort(14)", "var coverShort = CoverShort('str')", "var coverShort = CoverShort('str', 'str')", "var coverShort = CoverShort(15.5, 'str', 'str')"]
    },
    {
        name: "CoverShortStopMarket",
        description: "a buy to cover market limit",
        nameParams: ['quantity', 'signalName', 'stopPrice', 'fromEntrySignal'],
        examples: ["var coverShortStopMarket = CoverShortStopMarket(15.5)", "var coverShortStopMarket = CoverShortStopMarket(15.5, 15.5)", "var coverShortStopMarket = CoverShortStopMarket(15.5, 'str')", "var coverShortStopMarket = CoverShortStopMarket(15.5, 'str', 'str')", "var coverShortStopMarket = CoverShortStopMarket(15.5, 15.5, 'str', 'str'"]
    },
    {
        name: "CoverShortLimit",
        description: "a buy to cover limit",
        nameParams: ['quantity', 'signalName', 'limitPrice', 'stopPrice', 'fromEntrySignal'],
        examples: ["var coverShortLimit = CoverShortLimit(15.5)", "var coverShortLimit = CoverShortLimit(15.5, 15.5)", "var coverShortLimit = CoverShortLimit(15.5, 'str')", "var coverShortLimit = CoverShortLimit(15.5, 'str', 'str')", "var coverShortLimit = CoverShortLimit(15.5, 15.5 'str', 'str'"]
    },
    {
        name: "CoverShortStopMarket",
        description: "a buy to cover stop market ",
        nameParams: ['quantity', 'signalName', 'stopPrice', 'fromEntrySignal'],
        examples: ["var coverShortStopMarket = CoverShortStopMarket(15.5)", "var coverShortStopMarket = CoverShortStopMarket(15.5, 15.5)", "var coverShortStopMarket = CoverShortStopMarket(15.5, 'str')", "var coverShortStopMarket = CoverShortStopMarket(15.5, 'str', 'str')", "var coverShortStopMarket = CoverShortStopMarket(15.5, 15.5, 'str', 'str'"]
    },
];

export const documentationsScriptingPosition: ITradingPositionAndGeneral[] = [
    {
        category: DocumentationCategory.Trading,
        name: 'GetPositions',
        signature: 'GetPositions()',
        parameters: [],
        description: 'Get list of all positions',
        examples: ['var getPositions = GetPositions()']
    },
    {
        category: DocumentationCategory.Trading,
        name: 'GetPosition',
        signature: 'GetPosition()',
        parameters: [
            {
                example: '3',
                name: 'id',
                type: 'string',
                description: 'position id'
            },
        ],
        description: 'Get position by id',
        examples: ['var getPosition = GetPosition(3)']
    },
    {
        category: DocumentationCategory.Trading,
        name: 'CancelPosition',
        signature: 'CancelPosition()',
        parameters: [
            {
                example: '3',
                name: 'id',
                type: 'string',
                description: 'position id'
            },
        ],
        description: 'Cancel position by id',
        examples: ['var cancelPosition = CancelPosition(3)']
    },
];

export const generalMethods: ITradingPositionAndGeneral[] = [
    {
        name: 'ShowPopup',
        signature: 'ShowPopup()',
        category: DocumentationCategory.General,
        description: 'Method that show a popup message.\n',
        parameters: [
            {
                example: "'str'",
                name: 'message',
                type: 'string',
                description: 'Popup message'
            }
        ],
        examples: ['var showPopup = ShowPopup("str")']
    },
    {
        name: 'PlaySound',
        signature: 'PlaySound()',
        category: DocumentationCategory.General,
        description: 'Method that plays sound.',
        parameters: [
            {
                example: "'str'",
                name: 'location',
                type: 'string',
                description: 'Sound location'
            }
        ],
        examples: ['var playSound = PlaySound("str")']
    },
    {
        name: 'SendEmail',
        signature: 'SendEmail()',
        category: DocumentationCategory.General,
        description: 'Method that send email message.',
        parameters: [
            {
                example: "'str'",
                name: 'message',
                type: 'string',
                description: 'Email message'
            }
        ],
        examples: ['var sendEmail = SendEmail("str")']
    },
    {
        name: 'SendSMS',
        signature: 'SendSMS()',
        category: DocumentationCategory.General,
        description: 'Method that send SMS message.',
        parameters: [
            {
                example: "'str'",
                name: 'message',
                type: 'string',
                description: 'SMS message'
            }
        ],
        examples: ['var sendSMS = SendSMS("str")']
    },
    {
        name: 'CrossBelow',
        signature: 'CrossBelow()',
        category: DocumentationCategory.General,
        description: 'Methods that compares value and check if first is cross below second.\n',
        parameters: paramsCrossFunc,
        examples: ['var crossAbove = CrossAbove(3.5, 3.5, 14)']
    },
    {
        name: 'CrossAbove',
        signature: 'CrossAbove()',
        category: DocumentationCategory.General,
        description: 'Methods that compares value and check if first is cross above second.\n',
        parameters: paramsCrossFunc,
        examples: ['var crossAbove = CrossAbove(3.5, 3.5, 14)']
    }
];

export const multiDataMethods: IInfoMultiData[] = [
    {
        name: 'AddDataRows',
        signature: 'AddDataRows()',
        category: DocumentationCategory.MultiData,
        description: 'For adding new timeframe series to your script you can use AddDataRows method\n',
        parameters: [
            {
                name: 'timeFrame',
                type: 'ITimeFrame',
                description: 'Data timeframe'
            },
            {
                name: 'request',
                type: 'IHistoryRequest',
                description: 'History data request'
            },
            {
                name: 'instrument',
                type: 'IInstrument',
                description: 'Instrument for new dataseries'
            },
            {
                name: 'requestDaysBack',
                type: 'int',
                description: 'Number of days back for request'
            },
            {
                name: 'timeframeInterval',
                type: 'int',
                description: 'Dataseries timeframe interval'
            },
            {
                name: 'timeframePeriodicity',
                type: 'Periodicity',
                description: 'Dataseries timeframe periodicity'
            },
            {
                name: 'fromDate',
                type: 'DateTime',
                description: 'Dataseries bars start date'
            },
            {
                name: 'toDate',
                type: 'DateTime',
                description: 'Dataseries bars end date'
            },
        ],
        examples: [
            'var addDataRows = AddDataRows(timeFrame, historyRequest)',
            'var addDataRows = AddDataRows(instrument, timeFrame, historyRequest)',
            'var addDataRows = AddDataRows(13)',
            'var addDataRows = AddDataRows(13, timeFramePeriodicity, 13)',
            'var addDataRows = AddDataRows("str", 13, timeFramePeriodicity, 13)',
            'var addDataRows = AddDataRows(dateTime, dateTime)',
            'var addDataRows = AddDataRows(13, timeFramePeriodicity, dateTime, dateTime)',
            'var addDataRows = AddDataRows("str" ,13, timeFramePeriodicity, dateTime, dateTime)',
        ]
    },
    {
        name: 'getDataRows',
        signature: 'getDataRows()',
        category: DocumentationCategory.MultiData,
        description: 'For getting timeframe series',
        parameters: [],
        examples: ['item = multiBars[dailyTimeFrame]']
    },
];

