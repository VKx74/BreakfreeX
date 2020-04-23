/*
    IMPORTANT NOTICE:  This software and source code is owned and licensed by Fintatech B.V., https://fintatech.com
    Downloading, installing or otherwise using this software or source code shall be made only under Fintatech License agreement. If you do not granted Fintatech License agreement, you must promptly delete the software, source code and all associated downloadable materials and you must not use the software for any purpose whatsoever.
*/

const refable = [
    {
        label: 'Ref(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Ref(${1:<value>})'
            ].join('\n')
        },
        detail: 'Back-reference.\nReturns floating value/vector\n\n\n<value>: Integer or Float value',
        documentation: 'Getting of previous values in vector, e.g A.Ref(3) if required to get some previous values defined in buffer'
    }
];

const basics = [
    {
        label: 'var',
        kind: 13,
        insertText: {
            value: [
                'var '
            ].join('\n')
        },
        detail: 'Define new variable',
        documentation: 'Required to use keyword with next defined name. Allowed alphanumeric names but first char allowed only a-z (A-Z) without white spaces, variable can not be started from digit (0-9). Allowed to initialize variable by any of supported type(e.g.string, number) and also you can initialize variable as vector (e.g assign indicator)\n\nvar A = 123\nvar B = true\nvar C = CLOSE\nvar D = CLOSE.Ref(2)\nvar E = Indicator.Sma(CLOSE, 14)\nvar mySignal = "buy signal"\n'
    },
    {
        label: 'extvar',
        kind: 13,
        insertText: {
            value: [
                'extvar '
            ].join('\n')
        },
        detail: 'Define new external variable.',
        documentation: 'Required to use keyword  extvar with next defined name. Allowed alphanumeric names but first char allowed only a-z (A-Z) without white spaces, variable can not be started from digit (0-9).\n\nexvar A = 123.789\nextvar B = true\nextvar C = "buy signal"\nextvar magicNumber = 42'
    },
    {
        label: 'Output(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Output(${1:<value>})'
            ].join('\n')
        },
        detail: 'Output results',
        documentation: 'his functionality can return simple data (String, Float, Integer, Bool)\n\nOutput("my point")\nOutput(123.45)\nOutput(true)\n'
    },
    {
        label: 'Output(<key>, <value>)',
        kind: 2,
        insertText: {
            value: [
                'Output(${1:<key>}, ${2:<value>})'
            ].join('\n')
        },
        detail: 'Output results',
        documentation: 'This functionality can return simple data (String, Float, Integer, Bool). Output support additional argument, key. This key can be defined only as string value\n\nOutput("signal1", true)\nOutput("sma point", Indicator.Sma(CLOSE, 14))'
    },

    {
        label: 'OPEN',
        kind: 11,
        insertText: {
            value: [
                'OPEN'
            ].join('\n')
        },
        detail: 'Floating value',
        documentation: 'Open price of current bar'
    },
    {
        label: 'HIGH',
        kind: 11,
        insertText: {
            value: [
                'HIGH'
            ].join('\n')
        },
        detail: 'Floating value',
        documentation: 'High price of current bar'
    },
    {
        label: 'LOW',
        kind: 11,
        insertText: {
            value: [
                'LOW'
            ].join('\n')
        },
        detail: 'Floating value',
        documentation: 'Low price of current bar'
    },
    {
        label: 'CLOSE',
        kind: 11,
        insertText: {
            value: [
                'CLOSE'
            ].join('\n')
        },
        detail: 'Floating value',
        documentation: 'Close price of current bar'
    },
    {
        label: 'VOLUME',
        kind: 11,
        insertText: {
            value: [
                'VOLUME'
            ].join('\n')
        },
        detail: 'Integer value',
        documentation: 'Volume price of current bar'
    },
    {
        label: 'BAR',
        kind: 11,
        insertText: {
            value: [
                'BAR'
            ].join('\n')
        },
        detail: 'Reuired parameter for some indicators',
        documentation: 'Bar object'
    },
    {
        label: 'AND',
        kind: 11,
        insertText: {
            value: [
                'AND'
            ].join('\n')
        },
        detail: 'Logical AND operator',
        documentation: 'Is true if compared logical variables equals true\n\n\Suppose variable A equals true and the variable B is equals false then:\n(A AND B) is equals false\n(A AND A) is equals true\n(B AND B) is equals false'
    },
    {
        label: 'OR',
        kind: 11,
        insertText: {
            value: [
                'OR'
            ].join('\n')
        },
        detail: 'Logical OR operator',
        documentation: 'Is true if any one of compared logical variable  equals true\n\nSuppose variable A equals true and the variable B is equals false then:\n(A OR B) is equals true\n\(A OR A) is equals true\n(B OR B) is equals false'
    },
    {
        label: 'CandlePattern',
        kind: 18,
        insertText: {
            value: [
                'CandlePattern.'
            ].join('\n')
        },
        detail: 'Contains Candle Patterns',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'TechnicalPattern',
        kind: 18,
        insertText: {
            value: [
                'TechnicalPattern.'
            ].join('\n')
        },
        detail: 'Contains Technical Patterns',
        documentation: 'To identify intelligent patterns required to use special keyword  "TechnicalPattern." that allows exactly identification of this part of functionality. For example to call DoubleBottom pattern you should type TechnicalPattern.DoubleBottom(200). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g TechnicalPattern.DoubleBottom(200).Ref(3).'
    },
    {
        label: 'Indicator',
        kind: 18,
        insertText: {
            value: [
                'Indicator.'
            ].join('\n')
        },
        detail: 'Contains Technical Indicators',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3).'
    },
    {
        label: 'SetBuffer(<key>, <value>)',
        kind: 2,
        insertText: {
            value: [
                'SetBuffer(${1:<key>}, ${2:<value>})'
            ].join('\n')
        },
        detail: 'Define required value for specified key\n\n\n<key>: String value\n\n<Value>: Integer, Float, Boolean or String value',
        documentation: 'Bufer represents a collection of keys and values that can be used as temp  storage of variables available for each moment and for each next update of execute script. Buffer supports back-reference, so you can can get previous values in vector, e.g GetBuffer("MyKey").Ref(3) if required to get some previous values defined in buffer. To use Buffer functionality available to special functions / keywords GetBuffer and SetBuffer\n\nSetBuffer("MyState", true)\nSetBuffer("MagicNumber", 15)'
    },
    {
        label: 'GetBuffer(<key>)',
        kind: 2,
        insertText: {
            value: [
                'GetBuffer(${1:<key>}})'
            ].join('\n')
        },
        detail: 'Retrieve value by specified key\n\n\n<key>: String value',
        documentation: 'Bufer represents a collection of keys and values that can be used as temp  storage of variables available for each moment and for each next update of execute script. Buffer supports back-reference, so you can can get previous values in vector, e.g GetBuffer("MyKey").Ref(3) if required to get some previous values defined in buffer. To use Buffer functionality available to special functions / keywords GetBuffer and SetBuffer\n\nE.g. assign previously defined variables A, B, C, D\nA = GetBuffer("MyState")\nB = GetBuffer("Magic Number")\nC = GetBuffer("Magic Number") + 123456\nD = GetBuffer("MyState").Ref(4)'
    },
    {
        label: 'CrossAbove(<vectorA>, <vectorB>)',
        kind: 2,
        insertText: {
            value: [
                'CrossAbove(${1:<vectorA>}, ${2:<vectorB>})'
            ].join('\n')
        },
        detail: 'Identify if vector A cross above vector B.\nReturns boolean value (true or false)\n\n\n<vectorA>, <vectorB> : Reasonable to use variable or indicator',
        documentation: 'To identify special behaviour available special function that can be used in conditional logic. This functions support back - reference, so you can can get previous values of vector\n\nCrossAbove(SMA(CLOSE, 14), EMA(CLOSE, 18))'
    },
    {
        label: 'CrossBelow(<vectorA>, <vectorB>)',
        kind: 2,
        insertText: {
            value: [
                'CrossBelow(${1:<vectorA>}, ${2:<vectorB>})'
            ].join('\n')
        },
        detail: 'Identify if vector A cross below vector B.\nReturns boolean value (true or false)',
        documentation: 'To identify special behaviour available special function that can be used in conditional logic. This functions support back - reference, so you can can get previous values of vector\n\CrossBelow(SMA(CLOSE, 14), EMA(CLOSE, 18))'
    },
    {
        label: 'Abs(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Abs(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'The absolute value or modulus |x| of a real number x is the non-negative value of x.\nReturns floating value'
    },
    {
        label: 'Acos(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Acos(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'The angle whose cosine is the specified number.\nReturns floating value'
    },
    {
        label: 'Asin(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Asin(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'The angle whose sine is the specified number.\nReturns floating value'
    },
    {
        label: 'Atan(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Atan(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'The angle whose tangent is the specified number.\nReturns floating value'
    },
    {
        label: 'Ceiling(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Ceiling(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'The smallest integral value that is greater than or equal to the specified double-precision floating-point number.\nReturns floating value'
    },
    {
        label: 'Cosh(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Cosh(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'The hyperbolic cosine of the specified angle.\nReturns floating value'
    },
    {
        label: 'Cos(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Cos(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'The cosine of the specified angle.(degrees).\nReturns floating value'
    },
    {
        label: 'Exp(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Exp(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: '"e" raised to the specified power.\nReturns floating value'
    },
    {
        label: 'Log(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Log(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'The logarithm.\nReturns floating value'
    },
    {
        label: 'Log(<value>, <base>)',
        kind: 2,
        insertText: {
            value: [
                'Log(${1:<value>}, ${2:<base>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value, <base>: Integer or Float value',
        documentation: 'The logarithm.\nReturns floating value'
    },
    {
        label: 'Max(<value1>, <value2>)',
        kind: 2,
        insertText: {
            value: [
                'Max(${1:<value1>}, ${2:<value2>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value1>: Integer or Float value, <valuee2>: Integer or Float value',
        documentation: 'The larger of two double-precision floating-point numbers.\nReturns floating value'
    },
    {
        label: 'Min(<value1>, <value2>)',
        kind: 2,
        insertText: {
            value: [
                'Min(${1:<value1>}, ${2:<value2>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value1>: Integer or Float value, <valuee2>: Integer or Float value',
        documentation: 'The smaller of two double-precision floating-point numbers.\nReturns floating value'
    },
    {
        label: 'Round(<value>, <digits>)',
        kind: 2,
        insertText: {
            value: [
                'Round(${1:<value>}, ${2:<digits>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Float value, <digits>: Integer or Float value',
        documentation: 'Rounds a double-precision floating-point value to the nearest integral value.\nReturns floating value'
    },
    {
        label: 'Sign(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Sign(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'An integer that indicates the sign of a number.\nReturns integer -1 or 0 or 1 value'
    },
    {
        label: 'Sinh(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Sinh(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'The hyperbolic sine of the specified angle.\nReturns floating value'
    },
    {
        label: 'Sin(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Sin(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'The sine of the specified angle.\nReturns floating value'
    },
    {
        label: 'Sqrt(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Sqrt(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'The square root of a specified number.\nReturns floating value'
    },
    {
        label: 'Tanh(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Tanh(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'The hyperbolic tangent of the specified angle.\nReturns floating value'
    },
    {
        label: 'Truncate(<value>)',
        kind: 2,
        insertText: {
            value: [
                'Truncate(${1:<value>})'
            ].join('\n')
        },
        detail: 'Basic mathematical function.\nReturns floating value\n\n\n<value>: Integer or Float value',
        documentation: 'The integral part of a specified double-precision floating-point number.\nReturns floating value'
    },
    {
        label: 'ifelse',
        kind: 14,
        insertText: {
            value: [
                'if (${1:<condition>}) {',
                '\t$0',
                '} else {',
                '\t',
                '}'
            ].join('\n')
        },
        documentation: 'If-Else Statement'
    }
];

const candlePatterns = [
    {
        label: 'AdvanceBlock',
        kind: 2,
        insertText: {
            value: [
                'AdvanceBlock()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'BearishAbandonedBaby',
        kind: 2,
        insertText: {
            value: [
                'BearishAbandonedBaby()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'BearishBeltHold',
        kind: 2,
        insertText: {
            value: [
                'BearishBeltHold()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'BearishCounterattack',
        kind: 2,
        insertText: {
            value: [
                'BearishCounterattack()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'BearishEngulfing',
        kind: 2,
        insertText: {
            value: [
                'BearishEngulfing()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'BearishThreeLineStrike',
        kind: 2,
        insertText: {
            value: [
                'BearishThreeLineStrike()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'BullishAbandonedBaby',
        kind: 2,
        insertText: {
            value: [
                'BullishAbandonedBaby()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'BullishBeltHold',
        kind: 2,
        insertText: {
            value: [
                'BullishBeltHold()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'BullishCounterattack',
        kind: 2,
        insertText: {
            value: [
                'BullishCounterattack()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'BullishEngulfing',
        kind: 2,
        insertText: {
            value: [
                'BullishEngulfing()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'BullishHomingPigeon',
        kind: 2,
        insertText: {
            value: [
                'BullishHomingPigeon()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'BullishThreeLineStrike',
        kind: 2,
        insertText: {
            value: [
                'BullishThreeLineStrike()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'DojiDown',
        kind: 2,
        insertText: {
            value: [
                'DojiDown()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'DojiUp',
        kind: 2,
        insertText: {
            value: [
                'DojiUp()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'DownsideGapThreeMethod',
        kind: 2,
        insertText: {
            value: [
                'DownsideGapThreeMethod()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'DownsideTasukiGap',
        kind: 2,
        insertText: {
            value: [
                'DownsideTasukiGap()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'DragonflyDoji',
        kind: 2,
        insertText: {
            value: [
                'DragonflyDoji()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'EveningStar',
        kind: 2,
        insertText: {
            value: [
                'EveningStar()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'FallingThreeMethods',
        kind: 2,
        insertText: {
            value: [
                'FallingThreeMethods()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'Hammer',
        kind: 2,
        insertText: {
            value: [
                'Hammer()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'HangingMan',
        kind: 2,
        insertText: {
            value: [
                'HangingMan()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'HaramiBearish',
        kind: 2,
        insertText: {
            value: [
                'HaramiBearish()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'InNeckPattern',
        kind: 2,
        insertText: {
            value: [
                'InNeckPattern()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'InvertedHammer',
        kind: 2,
        insertText: {
            value: [
                'InvertedHammer()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'LadderBottom',
        kind: 2,
        insertText: {
            value: [
                'LadderBottom()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'LadderTop',
        kind: 2,
        insertText: {
            value: [
                'LadderTop()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'MorningStar',
        kind: 2,
        insertText: {
            value: [
                'MorningStar()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'OnNeckPattern',
        kind: 2,
        insertText: {
            value: [
                'OnNeckPattern()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'PiercingLine',
        kind: 2,
        insertText: {
            value: [
                'PiercingLine()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'RisingThreeMethods',
        kind: 2,
        insertText: {
            value: [
                'RisingThreeMethods()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'ShootingStar',
        kind: 2,
        insertText: {
            value: [
                'ShootingStar()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'SpinningTop',
        kind: 2,
        insertText: {
            value: [
                'SpinningTop()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'StarPattern',
        kind: 2,
        insertText: {
            value: [
                'StarPattern()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'ThreeBlackCrows',
        kind: 2,
        insertText: {
            value: [
                'ThreeBlackCrows()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'ThreeInsideDown',
        kind: 2,
        insertText: {
            value: [
                'ThreeInsideDown()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'ThreeInsideUp',
        kind: 2,
        insertText: {
            value: [
                'ThreeInsideUp()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'ThreeOutsideDown',
        kind: 2,
        insertText: {
            value: [
                'ThreeOutsideDown()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'ThreeOutsideUp',
        kind: 2,
        insertText: {
            value: [
                'ThreeOutsideUp()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'ThreeStarsInTheSouth',
        kind: 2,
        insertText: {
            value: [
                'ThreeStarsInTheSouth()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'ThreeWhiteSoldiers',
        kind: 2,
        insertText: {
            value: [
                'ThreeWhiteSoldiers()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'Thrusting',
        kind: 2,
        insertText: {
            value: [
                'Thrusting()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'TriStarBearish',
        kind: 2,
        insertText: {
            value: [
                'TriStarBearish()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'TriStarBullish',
        kind: 2,
        insertText: {
            value: [
                'TriStarBullish()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'TwoBlackGapping',
        kind: 2,
        insertText: {
            value: [
                'TwoBlackGapping()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'UniqueThreeRiver',
        kind: 2,
        insertText: {
            value: [
                'UniqueThreeRiver()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'UpsideGapThreeMethods',
        kind: 2,
        insertText: {
            value: [
                'UpsideGapThreeMethods()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'UpsideGapTwoCrows',
        kind: 2,
        insertText: {
            value: [
                'UpsideGapTwoCrows()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'UpsideTasukiGap',
        kind: 2,
        insertText: {
            value: [
                'UpsideTasukiGap()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'HaramiCrossBearish',
        kind: 2,
        insertText: {
            value: [
                'HaramiCrossBearish()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'HaramiCrossBullish',
        kind: 2,
        insertText: {
            value: [
                'HaramiCrossBullish()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
    {
        label: 'Doji',
        kind: 2,
        insertText: {
            value: [
                'Doji()'
            ].join('\n')
        },
        detail: 'Candle Pattern.\nReturns Boolean value: true or false',
        documentation: 'To identify simple patterns required to use special keyword  "CandlePattern." that allows exactly identification of this part of functionality. For example to call DojiUp pattern you should type CandlePattern.DojiUp(). Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g Indicator.DojiUp().Ref(3).'
    },
];

const technicalPatterns = [
    {
        label: 'Uptrend',
        kind: 2,
        insertText: {
            value: [
                'Uptrend()'
            ].join('\n')
        },
        detail: 'Technical Pattern.\nReturns Boolean value: true or false',
        documentation: 'Available intelligent patterns applicable to minimum 25 bars of historical data. Pattern could be not recognized If available less bars than required amount. To identify intelligent patterns required to use special keyword  "TechnicalPattern." that allows exactly identification of this part of functionality.For example to call DoubleBottom pattern you should type TechnicalPattern.DoubleBottom(200).Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g TechnicalPattern.DoubleBottom(200).Ref(3).'
    },
    {
        label: 'DownTrend',
        kind: 2,
        insertText: {
            value: [
                'DownTrend()'
            ].join('\n')
        },
        detail: 'Technical Pattern .Returns Boolean value: true or false',
        documentation: 'Available intelligent patterns applicable to minimum 25 bars of historical data. Pattern could be not recognized If available less bars than required amount. To identify intelligent patterns required to use special keyword  "TechnicalPattern." that allows exactly identification of this part of functionality.For example to call DoubleBottom pattern you should type TechnicalPattern.DoubleBottom(200).Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g TechnicalPattern.DoubleBottom(200).Ref(3).'
    },
    {
        label: 'DownTrend',
        kind: 2,
        insertText: {
            value: [
                'DownTrend()'
            ].join('\n')
        },
        detail: 'Technical Pattern .Returns Boolean value: true or false',
        documentation: 'Available intelligent patterns applicable to minimum 25 bars of historical data. Pattern could be not recognized If available less bars than required amount. To identify intelligent patterns required to use special keyword  "TechnicalPattern." that allows exactly identification of this part of functionality.For example to call DoubleBottom pattern you should type TechnicalPattern.DoubleBottom(200).Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g TechnicalPattern.DoubleBottom(200).Ref(3).'
    },
    {
        label: 'HeadAndShouldersTop',
        kind: 2,
        insertText: {
            value: [
                'HeadAndShouldersTop()'
            ].join('\n')
        },
        detail: 'Technical Pattern .Returns Boolean value: true or false',
        documentation: 'Available intelligent patterns applicable to minimum 25 bars of historical data. Pattern could be not recognized If available less bars than required amount. To identify intelligent patterns required to use special keyword  "TechnicalPattern." that allows exactly identification of this part of functionality.For example to call DoubleBottom pattern you should type TechnicalPattern.DoubleBottom(200).Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g TechnicalPattern.DoubleBottom(200).Ref(3).'
    },
    {
        label: 'HeadAndShouldersBottom',
        kind: 2,
        insertText: {
            value: [
                'HeadAndShouldersBottom()'
            ].join('\n')
        },
        detail: 'Technical Pattern .Returns Boolean value: true or false',
        documentation: 'Available intelligent patterns applicable to minimum 25 bars of historical data. Pattern could be not recognized If available less bars than required amount. To identify intelligent patterns required to use special keyword  "TechnicalPattern." that allows exactly identification of this part of functionality.For example to call DoubleBottom pattern you should type TechnicalPattern.DoubleBottom(200).Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g TechnicalPattern.DoubleBottom(200).Ref(3).'
    },
    {
        label: 'DoubleBottom(<value>)',
        kind: 2,
        insertText: {
            value: [
                'DoubleBottom(${1:<value>})'
            ].join('\n')
        },
        detail: 'Technical Pattern .Returns Boolean value: true or false\n\n\n<value>: Integer or Float value. Period-window of bars used to recognize pattern',
        documentation: 'Available intelligent patterns applicable to minimum 25 bars of historical data. Pattern could be not recognized If available less bars than required amount. To identify intelligent patterns required to use special keyword  "TechnicalPattern." that allows exactly identification of this part of functionality.For example to call DoubleBottom pattern you should type TechnicalPattern.DoubleBottom(200).Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g TechnicalPattern.DoubleBottom(200).Ref(3).'
    },
    {
        label: 'DoubleTop(<value>)',
        kind: 2,
        insertText: {
            value: [
                'DoubleTop(${1:<value>})'
            ].join('\n')
        },
        detail: 'Technical Pattern .Returns Boolean value: true or false\n\n\n<value>: Integer or Float value. Period-window of bars used to recognize pattern',
        documentation: 'Available intelligent patterns applicable to minimum 25 bars of historical data. Pattern could be not recognized If available less bars than required amount. To identify intelligent patterns required to use special keyword  "TechnicalPattern." that allows exactly identification of this part of functionality.For example to call DoubleBottom pattern you should type TechnicalPattern.DoubleBottom(200).Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g TechnicalPattern.DoubleBottom(200).Ref(3).'
    },
    {
        label: 'TripleBottom(<value>)',
        kind: 2,
        insertText: {
            value: [
                'TripleBottom(${1:<value>})'
            ].join('\n')
        },
        detail: 'Technical Pattern .Returns Boolean value: true or false\n\n\n<value>: Integer or Float value. Period-window of bars used to recognize pattern',
        documentation: 'Available intelligent patterns applicable to minimum 25 bars of historical data. Pattern could be not recognized If available less bars than required amount. To identify intelligent patterns required to use special keyword  "TechnicalPattern." that allows exactly identification of this part of functionality.For example to call DoubleBottom pattern you should type TechnicalPattern.DoubleBottom(200).Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g TechnicalPattern.DoubleBottom(200).Ref(3).'
    },
    {
        label: 'TripleTop(<value>)',
        kind: 2,
        insertText: {
            value: [
                'TripleTop(${1:<value>})'
            ].join('\n')
        },
        detail: 'Technical Pattern .Returns Boolean value: true or false\n\n\n<value>: Integer or Float value. Period-window of bars used to recognize pattern',
        documentation: 'Available intelligent patterns applicable to minimum 25 bars of historical data. Pattern could be not recognized If available less bars than required amount. To identify intelligent patterns required to use special keyword  "TechnicalPattern." that allows exactly identification of this part of functionality.For example to call DoubleBottom pattern you should type TechnicalPattern.DoubleBottom(200).Simple patterns returns true if pattern was found and returns false if currently pattern is missing. Patterns support back-reference, so you can can get previous values in vector, e.g TechnicalPattern.DoubleBottom(200).Ref(3).'
    },
];

const indicators = [
    {
        label: 'Adl(BAR)',
        kind: 2,
        insertText: {
            value: [
                'Adl(${1:BAR})'
            ].join('\n')
        },
        detail: 'Accumulation Distribution Line.\nReturns floating value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Adrx(BAR, <period>, <interval>)',
        kind: 2,
        insertText: {
            value: [
                'Adrx(${1:BAR}, ${2:<period>}, ${3:<interval>})'
            ].join('\n')
        },
        detail: 'Directional Movement Rating.\nReturns floating value\n\n\n<period>: Integer or Float value\n\n<interval>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Adx(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Adrx(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Average directional index.\nReturns floating value\n\n\n<period>: Integer or Float value\n\n<interval>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Apz(BAR, <period>, <bandPct>)',
        kind: 2,
        insertText: {
            value: [
                'Apz(${1:BAR}, ${2:<period>}, ${3:<bandPct>}).'
            ].join('\n')
        },
        detail: 'Directional Movement Rating.\neturns floating value as Up and Down vector\n\n\n<period>: Integer or Float value\n\n<bandPct>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'AroonOscillator(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'AroonOscillator(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Aroon Oscillator.\nReturns floating value\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Aroon(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Aroon(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Aroon.\nReturns floating value as Up and Down vector\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Atr(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Atr(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Average True Range.\nReturns floating value\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'BollingerBands(<input>, <SMA Period>, <Standard Deviation>, <Number of Standard Deviations>)',
        kind: 2,
        insertText: {
            value: [
                'BollingerBands(${1:<input>}, ${2:<SMA Period>}, ${3:<Standard Deviation>}, ${4:<Number of Standard Deviations>}).'
            ].join('\n')
        },
        detail: 'Average directional index.\nReturns floating value as Lower, Middle and Upper vector\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n\n<SMA Period>: Integer or Float value\n\n<Standard Deviation>: Integer or Float value\n\n<Number of Standard Deviations>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Bop(BAR, <smooth>)',
        kind: 2,
        insertText: {
            value: [
                'Bop(${1:BAR}, ${2:<smooth>})'
            ].join('\n')
        },
        detail: 'Balance of Power.\nReturns floating value\n\n\n<smooth>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Cci(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Cci(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Commodity Channel Index.\nReturns floating value\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'ChaikinOscillator(BAR, <fast>, <slow>)',
        kind: 2,
        insertText: {
            value: [
                'ChaikinOscillator(${1:BAR}, ${2:<fast>}, ${3:<slow>})'
            ].join('\n')
        },
        detail: 'Chaikin Oscillator.\nReturns floating value\n\n\n<fast>: Integer or Float value\n\n<slow>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'ChaikinVolatility(BAR, <MA Period>, <ROC Period>)',
        kind: 2,
        insertText: {
            value: [
                'ChaikinVolatility(${1:BAR}, ${2:<MA Period>}, ${3:<ROC Period>})'
            ].join('\n')
        },
        detail: 'Chaikin Volatility.\nReturns floating value\n\n\n<fast>: Integer or Float value\n\n<ROC Period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'ChaikinMoneyFlow(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'ChaikinMoneyFlow(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Chaikin Money Flow.\nReturns floating value\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Cmo(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Cmo(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Average directional index.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Dema(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Dema(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Double Exponential Moving Average.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Dmi(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Dmi(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Directional Movement Index.\nReturns floating value\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Dm(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Dm(${1:BAR}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Directional Movement.\nReturns floating value as AdxPlot, DiMinus  and DiPlus vector\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'DonchianChannel(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'DonchianChannel(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Donchian Channel.\nReturns floating value as Value, Up  and Down vector\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'DoubleStochastics(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'DoubleStochastics(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Double Stochastics.\nReturns floating value\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'EaseOfMovement(BAR, <smoothing>, <divisor>)',
        kind: 2,
        insertText: {
            value: [
                'EaseOfMovement(${1:BAR}, ${2:<smoothing>}, ${3:<divisor>})'
            ].join('\n')
        },
        detail: 'Ease Of Movement.\nReturns floating value\n\n\n<smoothing>: Integer of Float value\n\n<divisor>: Integer of Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Ema(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Ema(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Exponential Moving Average.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'FisherTransform(<input>, <tick size>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'FisherTransform(${1:<input>}, ${2:<tick size>}, ${3:<period>}).'
            ].join('\n')
        },
        detail: 'Fisher Transform.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<tick size>: Integer or Float value\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Fosc(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Fosc(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Forecast Oscillator.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Hma(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Hma(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Hull Moving Average.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Kama(<input>, <fast>, <slow>)',
        kind: 2,
        insertText: {
            value: [
                'Kama(${1:<input>}, ${2:<fast>}, ${3:<slow>})'
            ].join('\n')
        },
        detail: 'Kaufman`s Adaptive Moving Average.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<fast>: Integer or Float value\n\n<slow>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'KeltnerChannel(BAR, <period>, <offset multiplier>)',
        kind: 2,
        insertText: {
            value: [
                'KeltnerChannel(${1:BAR}, ${2:<period>}, ${3:<offset multiplier>})'
            ].join('\n')
        },
        detail: 'Keltner Channel.\nReturns floating value as Lower, Middle and Upper vector\n\n\n<period>: Integer or Float value\n\n<offset multiplier>: Integer of Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'KeyReversalDown(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'KeyReversalDown(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Key Reversal Down.\nReturns floating value\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'KeyReversalUp(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'KeyReversalUp(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Key Reversal Up.\nReturns floating value\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Lri(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Lri(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Linear Regression Intercept.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'LinReg(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'LinReg(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Linear Regression.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Lrs(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Lrs(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Linear Regression Slope.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Macd(<input>, <fast>, <slow>, <smooth>)',
        kind: 2,
        insertText: {
            value: [
                'Macd(${1:<input>}, ${2:<fast>}, ${3:<slow>}, ${4:<smooth>}).'
            ].join('\n')
        },
        detail: 'Moving Average Convergence Divergence.\nReturns floating value as Avg, Diff and Macd vector\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<fast>: Float or Integer value\n\n<slow>: Float or Integer value\n\n<smooth>: Float or Integer value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Mae(<input>, <period>, <MA Type>, <Envelope Percentage>)',
        kind: 2,
        insertText: {
            value: [
                'Mae(${1:<input>}, ${2:<period>}, ${3:<MA Type>}, ${4:<Envelope Percentage>}).'
            ].join('\n')
        },
        detail: 'Moving Average Envelopes.\nReturns floating value as Lower, Middle and Upper vector\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value\n\n<MA Type>: Allowed values: "EMA" "HMA" "SMA" "TMA" "TEMA" "WMA"\n\n<Envelope Percentage>: Float or Integer value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Maximum(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Maximum(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Maximum.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Mfi(BAR, <length>)',
        kind: 2,
        insertText: {
            value: [
                'Mfi(${1:BAR}, ${2:<length>})'
            ].join('\n')
        },
        detail: 'Money Flow Index.\nReturns floating value\n\n\n<length>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Minimum(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Minimum(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Minimum.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Momentum(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Momentum(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Momentum.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Obv(BAR)',
        kind: 2,
        insertText: {
            value: [
                'Obv(${1:BAR}).'
            ].join('\n')
        },
        detail: 'On-Balance Volume.\nReturns floating value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'ParabolicSar(BAR, <Acceleration>, <Acceleration Step>, <Acceleration Max>)',
        kind: 2,
        insertText: {
            value: [
                'ParabolicSar(${1:BAR}, ${2:<Acceleration>}, ${3:<Acceleration Step>}, ${4:<Acceleration Max>})'
            ].join('\n')
        },
        detail: 'Parabolic Sar.\nReturns floating value\n\n\n<Acceleration>: Integer or Float value\n\n<Acceleration Step>: Integer or Float value\n\n<Acceleration Max>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Pfe(<input>, <period>, <smooth>)',
        kind: 2,
        insertText: {
            value: [
                'Pfe(${1:<input>}, ${2:<period>}, ${2:<smooth>}).'
            ].join('\n')
        },
        detail: 'Polarized Fractal Efficiency.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value\n\n<smooth>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Ppo(<input>, <fast>, <slow>, <smooth>)',
        kind: 2,
        insertText: {
            value: [
                'Ppo(${1:<input>}, ${2:<fast>}, ${3:<slow>}, ${4:<smooth>}).'
            ].join('\n')
        },
        detail: 'Percentage Price Oscillator.\nReturns floating value as Default, and Smoothed vector\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<fast>: Float or Integer value\n\n<slow>: Float or Integer value\n\n<smooth>: Float or Integer value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'PriceOscillator(<input>, <fast>, <slow>, <smooth>)',
        kind: 2,
        insertText: {
            value: [
                'PriceOscillator(${1:<input>}, ${2:<fast>}, ${3:<slow>}, ${4:<smooth>}).'
            ].join('\n')
        },
        detail: 'Price Oscillator.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<fast>: Float or Integer value\n\n<slow>: Float or Integer value\n\n<smooth>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'RegressionChannel(<input>, <period>, <width>)',
        kind: 2,
        insertText: {
            value: [
                'RegressionChannel(${1:<input>}, ${2:<period>}, ${3:<width>}).'
            ].join('\n')
        },
        detail: 'Regression Channel.\nReturns floating value as Lower, Middle and Upper vector\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Float or Integer value\n\n<width>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Roc(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Roc(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Rate of Change.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Rsi(<input>, <period>, <smooth>)',
        kind: 2,
        insertText: {
            value: [
                'Rsi(${1:<input>}, ${2:<period>}, ${3:<smooth>}).'
            ].join('\n')
        },
        detail: 'Range Indicator.\nReturns floating value as Rsi and Avg vector\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value\n\n<smooth>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Lrrs(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Lrrs(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Linear Regression R-Squared.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Rss(<input>, <EMA_1 period>, <EMA_2 period>, <length>)',
        kind: 2,
        insertText: {
            value: [
                'Rss(${1:<input>}, ${2:<EMA_1 period>}, ${3:<EMA_2 period>}, ${4:<length>}).'
            ].join('\n')
        },
        detail: 'Relative Spread Strength.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<EMA_1 period>: Integer or Float value\n\n<EMA_2 period>: Integer or Float value\n\n<length>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Rvi(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Rvi(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Relative Vigor Index.\nReturns floating value\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Sma(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Sma(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Simple Moving Averag.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'StdDev(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'StdDev(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Standard Deviation.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'StdError(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'StdError(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Standard Error.\nReturns floating value as Lower, LinReg and Upper vector\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'StochasticsFast(BAR, <periodD>, <periodK>)',
        kind: 2,
        insertText: {
            value: [
                'StochasticsFast(${1:BAR}, ${2:<periodD>}, ${3:<periodK>})'
            ].join('\n')
        },
        detail: 'Stochastics Fast.\nReturns floating value as PeriodD and PeriodK vector\n\n\n<periodD>: Integer or Float value\n\n<periodK>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Stochastics(BAR, <periodD>, <periodK>, <smooth>)',
        kind: 2,
        insertText: {
            value: [
                'Stochastics(${1:BAR}, ${2:<periodD>}, ${3:<periodK>}, ${4:<smooth>})'
            ].join('\n')
        },
        detail: 'Stochastics Fast.\nReturns floating value as PeriodD and PeriodK vector\n\n\n<periodD>: Integer or Float value\n\n<periodK>: Integer or Float value\n\n<smooth>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'StochRsi(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'StochRsi(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Stochastic Relative Strength Index.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'SumBy(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'SumBy(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Sum.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'T3ma(<input>, <period>, <v-Factor>)',
        kind: 2,
        insertText: {
            value: [
                'T3ma(${1:<input>}, ${2:<period> ${3:<v-Factor>}).'
            ].join('\n')
        },
        detail: 'T3 Moving Average.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer val\n\n<v-Factor>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Tema(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Tema(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Triple Exponential Moving Average.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Tma(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Tma(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Triangular Moving Average.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Trix(<input>, <period>, <signal period>)',
        kind: 2,
        insertText: {
            value: [
                'Trix(${1:<input>}, ${2:<period>}, ${3:<signal period>}).'
            ].join('\n')
        },
        detail: 'Triple Exponential Average.\nReturns floating value as Default and Signal vector\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value\n\n<signal period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Tsf(<input>, <period>, <forecast>)',
        kind: 2,
        insertText: {
            value: [
                'Tsf(${1:<input>}, ${2:<period>}, ${3:<forecast>}).'
            ].join('\n')
        },
        detail: 'Time Series Forecast.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer val\n\n<forecast>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Tsi(<input>, <fast>, <slow>)',
        kind: 2,
        insertText: {
            value: [
                'Tsi(${1:<input>}, ${2:<fast>}, ${3:<slow>}).'
            ].join('\n')
        },
        detail: 'True Strength Index.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<fast>: Integer val\n\n<slow>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'UltimateOscillator(<input>, <fast>, <slow>, <intermediate>)',
        kind: 2,
        insertText: {
            value: [
                'UltimateOscillator(${1:<input>}, ${2:<fast>}, ${3:<slow>}, ${4:<intermediate>}).'
            ].join('\n')
        },
        detail: 'Ultimate Oscillator.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<fast>: Integer val\n\n<slow>: Integer or Float value\n\n<intermediate>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Vma(<input>, <period>, <forecast>)',
        kind: 2,
        insertText: {
            value: [
                'Vma(${1:<input>}, ${2:<period>}, ${3:<volatility period>}).'
            ].join('\n')
        },
        detail: 'Variable Moving Average.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer val\n\n<volatility period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Volma(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Volma(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Volume Moving Average.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'VolumeOscillator(BAR, <fast>, <slow>)',
        kind: 2,
        insertText: {
            value: [
                'VolumeOscillator(${1:BAR}, ${2:<fast>}, ${3:<slow>})'
            ].join('\n')
        },
        detail: 'Volume Oscillator.\nReturns floating value\n\n\n<fast>: Integer or Float value\n\n<slow>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Vroc(BAR, <period>, <smooth>)',
        kind: 2,
        insertText: {
            value: [
                'Vroc(${1:BAR}, ${2:<period>}, ${3:<smooth>})'
            ].join('\n')
        },
        detail: 'Volume Rate of Change Definition.\nReturns floating value\n\n\n<period>: Integer or Float value\n\n<smooth>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Vwma(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Vwma(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Volume-Weighted Moving Average.\nReturns floating value\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'WilliamsR(BAR, <period>)',
        kind: 2,
        insertText: {
            value: [
                'WilliamsR(${1:BAR}, ${2:<period>})'
            ].join('\n')
        },
        detail: 'Williams %R.\nReturns floating value\n\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Wma(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Wma(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Weighted Moving Averag.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
    {
        label: 'Zlema(<input>, <period>)',
        kind: 2,
        insertText: {
            value: [
                'Zlema(${1:<input>}, ${2:<period>}).'
            ].join('\n')
        },
        detail: 'Zero Lag Exponential Moving Average.\nReturns floating value\n\n\n<input>: Integer or Float value Prefered to use OPEN, HIGH, LOW, CLOSE or reference values like CLOSE.Ref(x)\n\n<period>: Integer or Float value',
        documentation: 'To identify indicators required to use special keyword "Indicators." that allows exactly identification of this part of functionality. For example to call SMA indicator you should type Indicator.Sma(...) and then define required parameters (parameters for each supported indicator described below). Indicators support back-reference, so you can can get previous values of vector, e.g Indicator.Sma(...).Ref(3)'
    },
];

const indicator_Apz = [
    {
        label: 'Down',
        kind: 2,
        insertText: {
            value: [
                'Down'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Up',
        kind: 2,
        insertText: {
            value: [
                'Up'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_Aroon = [
    {
        label: 'Down',
        kind: 2,
        insertText: {
            value: [
                'Down'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Up',
        kind: 2,
        insertText: {
            value: [
                'Up'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_BollingerBands = [
    {
        label: 'Lower',
        kind: 2,
        insertText: {
            value: [
                'Lower'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Middle',
        kind: 2,
        insertText: {
            value: [
                'Middle'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Upper',
        kind: 2,
        insertText: {
            value: [
                'Upper'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_Dm = [
    {
        label: 'AdxPlot',
        kind: 2,
        insertText: {
            value: [
                'AdxPlot'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'DiMinus',
        kind: 2,
        insertText: {
            value: [
                'DiMinus'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'DiPlus',
        kind: 2,
        insertText: {
            value: [
                'DiPlus'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_DonchianChannel = [
    {
        label: 'Value',
        kind: 2,
        insertText: {
            value: [
                'Value'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Down',
        kind: 2,
        insertText: {
            value: [
                'Down'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Up',
        kind: 2,
        insertText: {
            value: [
                'Up'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_KeltnerChannel = [
    {
        label: 'Lower',
        kind: 2,
        insertText: {
            value: [
                'Lower'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Middle',
        kind: 2,
        insertText: {
            value: [
                'Middle'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Upper',
        kind: 2,
        insertText: {
            value: [
                'Upper'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_Macd = [
    {
        label: 'Avg',
        kind: 2,
        insertText: {
            value: [
                'Avg'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Diff',
        kind: 2,
        insertText: {
            value: [
                'Diff'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Macd',
        kind: 2,
        insertText: {
            value: [
                'Macd'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_Mae = [
    {
        label: 'Lower',
        kind: 2,
        insertText: {
            value: [
                'Lower'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Middle',
        kind: 2,
        insertText: {
            value: [
                'Middle'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Upper',
        kind: 2,
        insertText: {
            value: [
                'Upper'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_Ppo = [
    {
        label: 'Default',
        kind: 2,
        insertText: {
            value: [
                'Default'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Smoothed ',
        kind: 2,
        insertText: {
            value: [
                'Smoothed'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_RegressionChannel = [
    {
        label: 'Lower',
        kind: 2,
        insertText: {
            value: [
                'Lower'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Middle',
        kind: 2,
        insertText: {
            value: [
                'Middle'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Upper',
        kind: 2,
        insertText: {
            value: [
                'Upper'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_Rsi = [
    {
        label: 'Rsi',
        kind: 2,
        insertText: {
            value: [
                'Rsi'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Avg ',
        kind: 2,
        insertText: {
            value: [
                'Avg'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_StdError = [
    {
        label: 'Lower',
        kind: 2,
        insertText: {
            value: [
                'Lower'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'LinReg',
        kind: 2,
        insertText: {
            value: [
                'LinReg'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Upper',
        kind: 2,
        insertText: {
            value: [
                'Upper'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_StochasticsFast = [
    {
        label: 'PeriodD',
        kind: 2,
        insertText: {
            value: [
                'PeriodD'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'PeriodK',
        kind: 2,
        insertText: {
            value: [
                'PeriodK'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_Stochastics = [
    {
        label: 'PeriodD',
        kind: 2,
        insertText: {
            value: [
                'PeriodD'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'PeriodK',
        kind: 2,
        insertText: {
            value: [
                'PeriodK'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

const indicator_Trix = [
    {
        label: 'Default',
        kind: 2,
        insertText: {
            value: [
                'Default'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    },
    {
        label: 'Signal',
        kind: 2,
        insertText: {
            value: [
                'Signal'
            ].join('\n')
        },
        detail: 'Returns floating value',
        documentation: 'Indicator value'
    }
];

export const completionItem = {
    provideCompletionItems: (model, position) => {
        let match;
        const textUntilPosition: string = model.getValueInRange({
            startLineNumber: 1, startColumn: 1,
            endLineNumber: position.lineNumber, endColumn: position.column
        });
        match = textUntilPosition.match(/Indicator\.{1}$/);
        if (match) {
            return indicators;
        }
        match = textUntilPosition.match(/CandlePattern\.{1}$/);
        if (match) {
            return candlePatterns;
        }
        match = textUntilPosition.match(/TechnicalPattern\.{1}$/);
        if (match) {
            return technicalPatterns;
        }
        match = textUntilPosition.match(/Indicator\.Apz\(.*\)\.{1}$/);
        if (match) {
            return indicator_Apz;
        }
        match = textUntilPosition.match(/Indicator\.Aroon\(.*\)\.{1}$/);
        if (match) {
            return indicator_Apz;
        }
        match = textUntilPosition.match(/Indicator\.BollingerBands\(.*\)\.{1}$/);
        if (match) {
            return indicator_BollingerBands;
        }
        match = textUntilPosition.match(/Indicator\.Dm\(.*\)\.{1}$/);
        if (match) {
            return indicator_Dm;
        }
        match = textUntilPosition.match(/Indicator\.DonchianChannel\(.*\)\.{1}$/);
        if (match) {
            return indicator_DonchianChannel;
        }
        match = textUntilPosition.match(/Indicator\.KeltnerChannel\(.*\)\.{1}$/);
        if (match) {
            return indicator_KeltnerChannel;
        }
        match = textUntilPosition.match(/Indicator\.Macd\(.*\)\.{1}$/);
        if (match) {
            return indicator_Macd;
        }
        match = textUntilPosition.match(/Indicator\.Mae\(.*\)\.{1}$/);
        if (match) {
            return indicator_Mae;
        }
        match = textUntilPosition.match(/Indicator\.Ppo\(.*\)\.{1}$/);
        if (match) {
            return indicator_Ppo;
        }
        match = textUntilPosition.match(/Indicator\.RegressionChannel\(.*\)\.{1}$/);
        if (match) {
            return indicator_RegressionChannel;
        }
        match = textUntilPosition.match(/Indicator\.Rsi\(.*\)\.{1}$/);
        if (match) {
            return indicator_Rsi;
        }
        match = textUntilPosition.match(/Indicator\.StdError\(.*\)\.{1}$/);
        if (match) {
            return indicator_StdError;
        }
        match = textUntilPosition.match(/Indicator\.StochasticsFast\(.*\)\.{1}$/);
        if (match) {
            return indicator_StochasticsFast;
        }
        match = textUntilPosition.match(/Indicator\.Stochastics\(.*\)\.{1}$/);
        if (match) {
            return indicator_Stochastics;
        }
        match = textUntilPosition.match(/Indicator\.Trix\(.*\)\.{1}$/);
        if (match) {
            return indicator_Trix;
        }
        match = textUntilPosition.match(/\.{1}$/);
        if (match) {
            return refable;
        }

        return basics;
    }
};

