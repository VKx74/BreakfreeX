/*
    IMPORTANT NOTICE:  This software and source code is owned and licensed by Fintatech B.V., https://fintatech.com
    Downloading, installing or otherwise using this software or source code shall be made only under Fintatech License agreement. If you do not granted Fintatech License agreement, you must promptly delete the software, source code and all associated downloadable materials and you must not use the software for any purpose whatsoever.
*/

import CompletionItem = monaco.languages.CompletionItem;
import CompletionItemKind = monaco.languages.CompletionItemKind;
import {
    documentationsIndicator, documentationsMath,
    documentationsScriptingOrder,
    documentationsScriptingPosition, generalMethods, paramsOrderInfo, ParamsTypesIndicator,
} from "@scripting/models/documentations";
import {JsUtil} from "../../../utils/jsUtil";
import {
    IGenerateMath,
    IParamsInfo,
    IScriptIndicatorsDocumentation,
    IScriptingOrderInfo, ITradingPositionAndGeneral
} from "@scripting/models/interfacesDocumentation";

enum MethodMultiDataName {
    addDataRows = 'AddDataRows',
    descriptionAdd = 'For adding new timeframe series to your script you can use AddDataRows method\n',
    getDataRows = 'AetDataRows',
    descriptionGet = 'For getting timeframe series',
}

export function getNeededParameters(paramsInfo: IParamsInfo[], nameParamMethod: string[]) {
    return paramsInfo.filter(param => nameParamMethod.some(paramMethod => paramMethod === param.name));
}

function transformStringToCompletionItems(labelsArray: string[], kind: CompletionItemKind): CompletionItem[] {
    return labelsArray.map((label) => {
        return {
            label: label,
            kind: kind,
            insertText: {
                value: [
                    label
                ].join('\n')
            },
            detail: label,
        };
    });
}

function transformMathFunctionsToCompletionItems(labelsArray: string[]): CompletionItem[] {
    return labelsArray.map((label) => {
        return {
            label: `${label}()`,
            kind: 1,
            insertText: {
                value: [
                    `${label}(\${1:})`
                ].join('\n')
            },
            detail: label,
        };
    });
}

function transformObjectToCompletionItemAsFunctionIndicator(indicatorsParamsArray: IScriptIndicatorsDocumentation[]): CompletionItem[] {

    let indicatorsObjects = indicatorsParamsArray.map((indicatorMethodInfo) => {

        const methodParams: IParamsInfo[] = getNeededParameters(ParamsTypesIndicator, indicatorMethodInfo.nameParams);

        const firstExampleParams: string[] = methodParams.filter(params => params.required).map(params => params.example);

        const secondExampleParams: string[] = methodParams.map(params => params.example).slice(1);

        const thirdExampleParams: string[] = methodParams.map(params => params.example);

        return [
            {
                label: `${indicatorMethodInfo.name}(${firstExampleParams.join(', ')})`,
                kind: 2,
                insertText: {
                    value: [
                        `var ${indicatorMethodInfo.name.toLowerCase()} = ${indicatorMethodInfo.name}(${firstExampleParams.map((arg, i) => `\${${i + 1}:${arg}}`).join(', ')})`
                    ].join('\n')
                },
                detail: `${indicatorMethodInfo.description}.`,
            },
            {
                label: `${indicatorMethodInfo.name}(${secondExampleParams.join(', ')})`,
                kind: 2,
                insertText: {
                    value: [
                        `var ${indicatorMethodInfo.name.toLowerCase()} = ${indicatorMethodInfo.name}(${secondExampleParams.map((arg, i) => `\${${i + 1}:${arg}}`).join(', ')})`
                    ].join('\n')
                },
                detail: `${indicatorMethodInfo.description}.`,
            },
            {
                label: `${indicatorMethodInfo.name}(${thirdExampleParams.join(', ')})`,
                kind: 2,
                insertText: {
                    value: [
                        `var ${indicatorMethodInfo.name.toLowerCase()} = ${indicatorMethodInfo.name}(${thirdExampleParams.map((arg, i) => `\${${i + 1}:${arg}}`).join(', ')})`
                    ].join('\n')
                },
                detail: `${indicatorMethodInfo.description}.`,
            },
        ];
    });

    return JsUtil.flattenArray(indicatorsObjects);
}

function transformObjectToCompletionItemAsFunctionTradingOrder(orderParamsArray: IScriptingOrderInfo[]): CompletionItem[] {

    let orderObjects = orderParamsArray.map((orderMethodInfo) => {

        const methodParams: IParamsInfo[] = getNeededParameters(paramsOrderInfo, orderMethodInfo.nameParams);

        const secondExampleParams: string[] = methodParams.map(example => example.example);

        const firstExampleParams: string[] = secondExampleParams.slice(0, -1);

        return [
            {
                label: `${orderMethodInfo.name}(${firstExampleParams.join(', ')})`,
                kind: 2,
                insertText: {
                    value: [
                        `var ${orderMethodInfo.name.toLowerCase()} = ${orderMethodInfo.name}(${firstExampleParams.map((arg, i) => `\${${i + 1}:${arg}}`).join(', ')})`
                    ].join('\n')
                },
                detail: `${orderMethodInfo.description}.`,
            },
            {
                label: `${orderMethodInfo.name}(${secondExampleParams.join(', ')})`,
                kind: 2,
                insertText: {
                    value: [
                        `var ${orderMethodInfo.name.toLowerCase()} = ${orderMethodInfo.name}(${secondExampleParams.map((arg, i) => `\${${i + 1}:${arg}}`).join(', ')})`
                    ].join('\n')
                },
                detail: `${orderMethodInfo.description}.`,
            },
        ];
    });

    return JsUtil.flattenArray(orderObjects);
}

function transformObjectToCompletionItemAsFunctionGeneral(positionParamsArray: ITradingPositionAndGeneral[]): CompletionItem[] {
        return positionParamsArray.map(positionMethodInfo => {
            const example = positionMethodInfo.parameters.map(i => i.example).join(', ');
            return {
                label: `${positionMethodInfo.name}(${positionMethodInfo.parameters.length ? example : ''})`,
                kind: 2,
                insertText: {
                    value: [
                        `var ${positionMethodInfo.name.toLowerCase()} = ${positionMethodInfo.name}(\${1:${positionMethodInfo.parameters.length ?  example : ''}})`
                    ].join('\n')
                },
                detail: `${positionMethodInfo.description}.`,
            };
        });
}

function transformObjectToCompletionItemAsFunctionMath(mathParamsArray: IGenerateMath[]): CompletionItem[] {

    return JsUtil.flattenArray(mathParamsArray.map(mathMethodInfo => {

        let arrayMathOverloads = [];

       for (let numberOverloads = 0; numberOverloads < mathMethodInfo.quantityOverloads; numberOverloads++) {
            let examples: string[] = [];
            let strExp: string = '';

                for (let i = 0; i < mathMethodInfo.numberCount; i++) {

                    if (mathMethodInfo.quantityOverloads < 2) {
                        strExp +=  mathMethodInfo.parameters.map( param => param.example).join(', ');
                    } else {
                        strExp += mathMethodInfo.parameters.map( param => param.example)[numberOverloads];
                    }
                        strExp += i !== mathMethodInfo.numberCount - 1 ? ', ' : '';
                }

                    examples.push(strExp);

                    arrayMathOverloads.push({
                        label: `Math.${mathMethodInfo.name}(${mathMethodInfo.parameters.length ? examples : ''})`,
                        kind: 2,
                        insertText: {
                            value: [
                                `var ${mathMethodInfo.name.toLowerCase()} = Math.${mathMethodInfo.name}(\${1:${examples}})`
                            ].join('\n')
                        },
                        detail: `${mathMethodInfo.description}.`,
                    });
       }

       return arrayMathOverloads;

    }));
}

function transformObjectToCompletionItemAsFunctionMultiData(multiDataArray: string[]) {
    return multiDataArray.map(nameParam => {
        return {
            label: `${MethodMultiDataName.addDataRows}(${nameParam})`,
            kind: 2,
            insertText: {
                value: [
                    `var ${MethodMultiDataName.addDataRows.toLowerCase()} = ${MethodMultiDataName.addDataRows}(\${1:${nameParam}})`
                ].join('\n')
            },
            detail: `${MethodMultiDataName.descriptionAdd}.`,
        };
    });
}

const keyWords: string[] = [
    'abstract', 'as', 'base', 'break', 'case', 'catch', 'checked', 'class', 'const', 'continue', 'default', 'delegate', 'do', 'else',
    'event', 'explicit', 'extern', 'false', 'finally', 'fixed', 'for', 'foreach', 'goto', 'if', 'implicit', 'in', 'int', 'interface', 'internal', 'is', 'lock', 'namespace',
    'new', 'null', 'object', 'operator', 'out', 'override', 'params', 'private', 'protected', 'public', 'readonly', 'ref', 'return', 'sealed', 'sizeof', 'stackalloc', 'static',
    'switch', 'this', 'throw', 'true', 'try', 'typeof', 'unchecked', 'unsafe', 'ushort', 'using', 'using static', 'virtual', 'volatile', 'while', 'Math'
];

const contextKeyWords: string[] = [
    'add', 'alias', 'ascending', 'async', 'await', 'by', 'descending', 'dynamic', 'equals', 'from', 'get', 'global', 'group', 'into', 'join', 'nameof', 'on', 'orderby', 'partial', 'remove',
    'select', 'set', 'value', 'when', 'where', 'yield'
];

const variables: string[] = [
    'bool', 'byte', 'char', 'sbyte', 'short', 'int', 'long', 'ushort', 'uint', 'ulong', 'float', 'double', 'decimal', 'enum', 'struct', 'string', 'var', 'let', 'void',
];

const enums: string[] = [
    'Calculate', 'StartBehavior'
];

const ECalculate: string[] = [
    'OnEachTick', 'OnPriceChange', 'OnBarClose'
];

const EStartBehavior: string[] = [
    'ImmediatelySubmit', 'WaitForBarUpdate'
];

const getMultiData: CompletionItem = {
    label: 'multiBars[dailyTimeFrame]',
    kind: 2,
    insertText: {
        value: [
            'var getDataRows = multiBars[dailyTimeFrame]'
        ].join('\n')
    },
    detail: MethodMultiDataName.descriptionGet,
};

const multiDataOverloads: string[] = [
    'timeFrame, historyRequest', 'instrument, timeFrame, historyRequest', '13', '13, timeFramePeriodicity, 13', '"str", 13, timeFramePeriodicity, 13', 'dateTime, dateTime', '13, timeFramePeriodicity, dateTime, dateTime', '"str" ,13, timeFramePeriodicity, dateTime, dateTime'
];

const basics = [
    ...transformStringToCompletionItems(keyWords, 13),
    ...transformStringToCompletionItems(contextKeyWords, 13),
    ...transformStringToCompletionItems(variables, 5),
    ...transformStringToCompletionItems(enums, 12),
    ...transformObjectToCompletionItemAsFunctionIndicator(documentationsIndicator),
    ...transformObjectToCompletionItemAsFunctionTradingOrder(documentationsScriptingOrder),
    ...transformObjectToCompletionItemAsFunctionGeneral(documentationsScriptingPosition),
    ...transformObjectToCompletionItemAsFunctionGeneral(generalMethods),
    ...transformObjectToCompletionItemAsFunctionMath(documentationsMath),
    ...transformObjectToCompletionItemAsFunctionMultiData(multiDataOverloads),
    getMultiData
];
export const completionItem = {
    provideCompletionItems: (model, position) => {
        let match;
        const textUntilPosition: string = model.getValueInRange({
            startLineNumber: 1, startColumn: 1,
            endLineNumber: position.lineNumber, endColumn: position.column
        });
        match = textUntilPosition.match(/Math\.{1}$/);
        if (match) {
            return transformObjectToCompletionItemAsFunctionMath(documentationsMath);
        }
        match = textUntilPosition.match(/Calculate\.{1}$/);
        if (match) {
            return transformStringToCompletionItems(ECalculate, 12);
        }
        match = textUntilPosition.match(/StartBehavior\.{1}$/);
        if (match) {
            return transformStringToCompletionItems(EStartBehavior, 12);
        }
        return basics;
    }
};
